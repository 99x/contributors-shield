var request = require('request');
var fs = require('fs');
var _ = require('lodash');
var Jimp = require("jimp");

var page = 1;

// GitHub Repo URL should be changed
var GITHUB_REPO_URL = "https://github.com/99xt/contributors-shield";

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
            imageB.write("generated_overlap.jpg");
            console.log("Written to file");
        }
    );
}

function getUserAndRepo(url){


}
