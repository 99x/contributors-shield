var request = require('request');
var fs = require('fs');
var _ = require('lodash');
var Jimp = require("jimp");
var AWS = require('aws-sdk');
var uuid = require('node-uuid');
var path = require('path');
var s3 = new AWS.S3();

var page = 1;

// GitHub Repo URL should be changed
var GITHUB_REPO_URL = "https://github.com/99xt/contributors-shield";

// Style Settings
var backgroundColor = "ffffff"; // background color of image
var backgroundOpacity = 1; // 0 for no background mode

// Remote upload Settings
var uploadToS3Bucket = true;
var bucketOptions = {
    bucketName: '99xtest2',
    key: '' // optional eg :- filename.png
};

var GIT_repo = GITHUB_REPO_URL.replace("https://github.com/", "");

var client_id = "client_id"
var client_secret = "client_secret"
var base_url = "https://api.github.com/repos/" + GIT_repo + "/contributors?client_id=" + client_id + "&client_secret=" + client_secret + "&page=" + page;

var async = require('async');
var options = {
    url: base_url,
    headers: {
        'User-Agent': 'contributors'
    }
};

var validateKey = function (key) {
    var key = key || uuid.v1(),
        extension = path.extname(key);
    if (!!extension && extension === '.png') {
        return key;
    } else {
        return key + '.png';
    }
};

var uploadToS3 = function(options, image) {
    image.getBuffer('image/png',function (err, buffer) {
        var params = {
            Bucket: options.bucketName,
            Key: validateKey(options.key),
            Body: buffer,
            ContentType: 'image/png'
        };

        s3.putObject(params, function(err, response) {
            if (err) {
                console.log('[UploadFailure] ' + err);
            } else {
                console.log('uploaded to s3');
                console.log('Filename : ' + params.Key);
            }
        });
    });

};

function updateURL(page) {
    base_url = "https://api.github.com/repos/" + GIT_repo + "/contributors?client_id=" + client_id + "&client_secret=" + client_secret + "&page=" + page;
    options = {
        url: base_url,
        headers: {
            'User-Agent': 'contributors'
        }
    };
}

var dataArr = [];

Jimp.read("base.png", function(err, imageB) {
    if (err) throw err;

    imageB.color([
        { apply: 'mix', params: [ backgroundColor,100 ] }
    ]).opacity(backgroundOpacity,function(err,imageB){

        if (err) throw err;

        request(options, function(error, response, body) {
            if (response.headers.link) {
                var hasNext = true;
                async.whilst(
                    function() {
                        return hasNext;
                    },
                    function(callback) {
                        page++;
                        updateURL(page);
                        request(options, function(error, response, body) {
                            body = JSON.parse(body);
                            if (body != 0) {
                                console.log("Running Pagination " + page)
                                dataArr = dataArr.concat(body);
                                callback(null);
                            } else {
                                console.log("Done with " + page)
                                hasNext = false;
                                generateImage(imageB);

                            }

                        });
                    },
                    function(err, n) {
                    }
                );
            } else {
                dataArr = JSON.parse(body);
                generateImage(imageB);
            }
        });

    });

});

function generateImage(imageB) {
    console.log("Starting to Genearate Image")
    var x = 70;
    var rows = Math.ceil(dataArr.length / 4);
    var curr_row_y = 70;
    var count = 0;
    console.log(rows +" Rows")

    imageB.resize(800, 200 * rows);

    async.each(dataArr,
        function(value, callback) {
            Jimp.read(value.avatar_url, function(err, image) {
                image.scaleToFit(120, Jimp.AUTO)
                Jimp.loadFont(Jimp.FONT_SANS_16_BLACK).then(function(font) {
                    count++;
                    imageB.print(font, x + 5, (curr_row_y - 20), "@" + value.login);
                    imageB.composite(image, x, curr_row_y);
                    x += 180;
                    if (count % 4 == 0) {
                        curr_row_y += 170;
                        x = 70;
                    }
                    callback();
                });
            });
        },
        function(err) {
            imageB.write("generated_overlap.png");
            console.log("Written to file");
            if(uploadToS3Bucket)
                uploadToS3(bucketOptions,imageB);
        }
    );
}

function getUserAndRepo(url){


}
