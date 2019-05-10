var express = require('express');
var router = express.Router();

var AWS = require("aws-sdk");
var zipcodes = require("zipcodes");

AWS.config.update({
  region: "us-west-2"
});

var docClient = new AWS.DynamoDB.DocumentClient();

/* GET map. */
router.get('/', function(req, res, next) {
	console.log("Scanning...");

	var params = {
	    TableName : "survey_responses"
	};

	docClient.scan(params, function(err, data) {
	    if (err) {
	        console.error("Unable to scan. Error:", JSON.stringify(err, null, 2));
	    } else {
	        console.log("Scan succeeded.");
	        var responses = [];
	        data.Items.forEach(function(response) {
	            //console.log(response.postal_code);
	            if (response.postal_code != undefined) {
		            let zipres = zipcodes.lookup(response.postal_code);
		            if (zipres != undefined) {
		            	response.latitude = zipres.latitude;
		            	response.longitude = zipres.longitude;
		            	responses.push(response);
		            }
		        }
	        });

	        console.log(responses.length)
	       	res.render('map', { responses: responses });
	    }
	});

});

module.exports = router;
