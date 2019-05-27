var express = require('express');
var router = express.Router();

var AWS = require("aws-sdk");
var zipcodes = require("zipcodes");

AWS.config.update({
  region: "us-west-2"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'ucla-cs130.c3ovuhsudw79.us-west-2.rds.amazonaws.com',
  user     : 'ucla',
  password : 'Ucla2019!',
  database : 'cs130'
});
 
connection.connect();

function getMonthArrayIndex(startMonth, currentMonth, startYear, currentYear) {
	return ((currentYear-startYear)*12 + (currentMonth-startMonth));
}

function getDataResponse(req, results) {
    var totalSatisfaction = 0;
    var numberSatisfactions = 0;
    var numberMales = 0;
    var numberFemales = 0;

    var numberMonths = getMonthArrayIndex(req.query.startMonth, req.query.endMonth, req.query.startYear, req.query.endYear) + 1;
    console.log(numberMonths)

    var numberSatisfactionsByMonth = new Array(numberMonths).fill(0);
    var totalSatisfactionsByMonth = new Array(numberMonths).fill(0);
		var satisfactionsByMonth = new Array(numberMonths).fill(0);

    results.forEach(function(response) {
    	if (response.overall_satisfaction != undefined) {
    		totalSatisfaction += response.overall_satisfaction;
    		numberSatisfactions++;
    		var currentMonth = response.survey_date.getMonth()+1;
    		var currentYear = response.survey_date.getYear()+1900;
    		var index = getMonthArrayIndex(req.query.startMonth, currentMonth, req.query.startYear, currentYear);
    		numberSatisfactionsByMonth[index]++;
    		totalSatisfactionsByMonth[index] += response.overall_satisfaction;
    	}
    	if (response.gender != undefined) {
    		if (response.gender == "Male") {
    			numberMales++;
    		} else if (response.gender == "Female") {
    			numberFemales++;
    		}
    	}
    });

    for (var i = 0; i < satisfactionsByMonth.length; i++) {
		satisfactionsByMonth[i] = (totalSatisfactionsByMonth[i]/numberSatisfactionsByMonth[i]).toFixed(2);
    }

    return {
		"percentMale": (numberMales/(numberMales+numberFemales)).toFixed(2),
		"percentFemale": (numberFemales/(numberMales+numberFemales)).toFixed(2),
		"averageOverallSatisfaction": (totalSatisfaction/numberSatisfactions).toFixed(2),
		"averageOverallSatisfactionByMonth": satisfactionsByMonth
	}
}

/* GET states. */
router.get('/states', function(req, res, next) {
	console.log("Querying...");

	connection.query("SELECT * FROM survey_responses", function (error, results, fields) {
	    if (error) {
	        console.error("Unable to query. Error:", JSON.stringify(error, null, 2));
	        res.status(400).send({"error": "Unable to query. Error:"});
	    } else {
	        console.log("Query succeeded.");
	       	res.send(getDataResponse(req, results));
	    }
	});

});

/* GET state by state code. */
router.get('/states/:id', function(req, res, next) {
	console.log("Querying...");

	console.log(req.params.id)
	var zips = zipcodes.lookupByState(req.params.id).map(a => a.zip);

	connection.query("SELECT * FROM survey_responses WHERE postal_code IN ("+zips+")", function (error, results, fields) {
	    if (error) {
	        console.error("Unable to query. Error:", JSON.stringify(error, null, 2));
	        res.status(400).send({"error": "Unable to query. Error:"});
	    } else {
	        console.log("Query succeeded.");
	       	res.send(getDataResponse(req, results));
	    }
	});

});

/* GET ethnicity. */
router.get('/ethnicity', function(req, res, next) {
	connection.query("SELECT * FROM survey_responses WHERE ethnicity='"+req.query.ethnicity+"'", function (error, results, fields) {
	    if (error) {
	        console.error("Unable to query. Error:", JSON.stringify(error, null, 2));
	        res.status(400).send({"error": "Unable to query. Error:"});
	    } else {
	        console.log("Query succeeded.");

	        var totalSatisfaction = 0;
	        var numberSatisfactions = 0;
	        var numberMales = 0;
	        var numberFemales = 0;

	        results.forEach(function(response) {
	        	if (response.overall_satisfaction != undefined) {
	        		totalSatisfaction += response.overall_satisfaction;
	        		numberSatisfactions++;
	        	}
	        });

	       	res.send({
	       		"averageOverallSatisfaction": (totalSatisfaction/numberSatisfactions).toFixed(2)
	       	});
	    }
	});

});

/* GET DeviceType. */

router.get('/device_type', function(req, res, next) {
	connection.query("SELECT * FROM survey_responses WHERE device_type='"+req.query.device_type+"'", function (error, results, fields) {
	    if (error) {
	        console.error("Unable to query. Error:", JSON.stringify(error, null, 2));
	        res.status(400).send({"error": "Unable to query. Error:"});
	    } else {
	        console.log("Query succeeded.");

	        var totalSatisfaction = 0;
	        var numberSatisfactions = 0;
	        var numberMales = 0;
	        var numberFemales = 0;

	        results.forEach(function(response) {
	        	if (response.overall_satisfaction != undefined) {
	        		totalSatisfaction += response.overall_satisfaction;
	        		numberSatisfactions++;
	        	}
	        });

	       	res.send({
	       		"averageOverallSatisfaction": (totalSatisfaction/numberSatisfactions).toFixed(2)
	       	});
	    }
	});

});

module.exports = router;
