var request = require('request');
var fs = require('fs');
var _ = require('lodash');
var Jimp = require("jimp");

var page= 1;
var user = "serverless"; // OWNER
var repo = "serverless"; // REPO NAME
var base_url = "https://api.github.com/repos/" + user + "/" + repo + "/contributors?page="+page;

var options = {
    url: base_url,
    headers: {
        'User-Agent': 'contributors'
    }
};

Jimp.read("base.png", function (err, imageB) {
    if (err) throw err;
    imageB.resize(800,200)           
    .write("generated.jpg");

	request(options, function(error, response, body) {
		var x= 70;
		var data = JSON.parse(body);
		var rows = Math.ceil(data.length / 4) ;
		var curr_row_y = 70;
		var count = 0;
		imageB.resize(800,200*rows)     

	    _.each( data, function(value) {
	       	Jimp.read(value.avatar_url, function (err, image) {
				image.scaleToFit(120,Jimp.AUTO) 
			
				Jimp.loadFont(Jimp.FONT_SANS_16_BLACK).then(function (font) {
					count++;
				    imageB.print(font,  x+5 , (curr_row_y -20), "@"+value.login);
				    imageB.composite( image, x , curr_row_y ) .write("generated_overlap.jpg");
			  		x+=180;
			  		if(count % 4 ==0  ){
				    	curr_row_y+= 170;
				    	x=70;
				    }		  		

				});			    
			});
	       
	    });
	});

});

