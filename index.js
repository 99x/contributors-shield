var request = require('request');
var fs = require('fs');
var _ = require('lodash');
var Jimp = require("jimp");

var user = "99xt"; // OWNER
var repo = "azure-jwt-verify"; // REPO NAME
var base_url = "https://api.github.com/repos/" + user + "/" + repo + "/contributors";

var options = {
    url: base_url,
    headers: {
        'User-Agent': 'contributors'
    }
};

Jimp.read("base.png", function (err, imageB) {
    if (err) throw err;
    imageB.resize(600,200)           
    .write("generated.jpg");

	request(options, function(error, response, body) {
		var x= 50;
	    _.each(JSON.parse(body), function(value) {
	       	Jimp.read(value.avatar_url, function (err, image) {
				image.scaleToFit(120,Jimp.AUTO) 
			    imageB.composite( image, x ,50 ) .write("generated_overlap.jpg");
			    x+=180;
			});
	       
	    });

	})




});

