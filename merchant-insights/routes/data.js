var express = require('express');
var router = express.Router();

var AWS = require("aws-sdk");
var zipcodes = require("zipcodes");

AWS.config.update({
  region: "us-west-2"
});

var docClient = new AWS.DynamoDB.DocumentClient();

function getMonthArrayIndex(startMonth, currentMonth, startYear, currentYear) {
	return ((currentYear-startYear)*12 + (currentMonth-startMonth));
}

/* GET states. */
router.get('/states', function(req, res, next) {
	console.log("Scanning...");

	var params = {
	    TableName : "survey_responses"
	};

	docClient.scan(params, function(err, data) {
	    if (err) {
	        console.error("Unable to scan. Error:", JSON.stringify(err, null, 2));
	        res.send({"error": "Unable to scan. Error:"});
	    } else {
	        console.log("Scan succeeded.");
	        console.log(data.Items.length)

	        var totalSatisfaction = 0;
	        var numberSatisfactions = 0;
	        var numberMales = 0;
	        var numberFemales = 0;

	        var numberMonths = getMonthArrayIndex(req.query.startMonth, req.query.endMonth, req.query.startYear, req.query.endYear) + 1;
	        console.log(numberMonths)

	        var numberSatisfactionsByMonth = new Array(numberMonths).fill(0);
	        var totalSatisfactionsByMonth = new Array(numberMonths).fill(0);
 			var satisfactionsByMonth = new Array(numberMonths).fill(0);

	        data.Items.forEach(function(response) {
	        	if (response.overall_satisfaction != undefined) {
	        		totalSatisfaction += response.overall_satisfaction;
	        		numberSatisfactions++;
	        		var currentYear = response.survey_date.split('-')[0] 
	        		var currentMonth = response.survey_date.split('-')[1]
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

	       	res.send({
	       		"percentMale": (numberMales/(numberMales+numberFemales)).toFixed(2),
	       		"percentFemale": (numberFemales/(numberMales+numberFemales)).toFixed(2),
	       		"averageOverallSatisfaction": (totalSatisfaction/numberSatisfactions).toFixed(2),
	       		"averageOverallSatisfactionByMonth": satisfactionsByMonth
	       	});
	    }
	});

});

/* GET state by state code. */
router.get('/states/:id', function(req, res, next) {
	console.log("Scanning...");

	console.log(req.params.id)

	var params = {
	    TableName : "survey_responses"
	};

	docClient.scan(params, function(err, data) {
	    if (err) {
	        console.error("Unable to scan. Error:", JSON.stringify(err, null, 2));
	        res.send({"error": "Unable to scan. Error:"});
	    } else {
	        console.log("Scan succeeded.");
	        console.log(data.Items.length)

	        var totalSatisfaction = 0;
	        var numberSatisfactions = 0;
	        var numberMales = 0;
	        var numberFemales = 0;

	       	var numberMonths = getMonthArrayIndex(req.query.startMonth, req.query.endMonth, req.query.startYear, req.query.endYear) + 1;
	        console.log(numberMonths)

	        var numberSatisfactionsByMonth = new Array(numberMonths).fill(0);
	        var totalSatisfactionsByMonth = new Array(numberMonths).fill(0);
 			var satisfactionsByMonth = new Array(numberMonths).fill(0);

	        data.Items.forEach(function(response) {
	            if (response.postal_code != undefined) {
		            let zipres = zipcodes.lookup(response.postal_code);
		            if (zipres != undefined && zipres.state == req.params.id) {
			        	if (response.overall_satisfaction != undefined) {
			        		totalSatisfaction += response.overall_satisfaction;
			        		numberSatisfactions++;
			        		var currentYear = response.survey_date.split('-')[0] 
			        		var currentMonth = response.survey_date.split('-')[1]
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
		            }
		        }
	        });

	       	for (var i = 0; i < satisfactionsByMonth.length; i++) {
        		satisfactionsByMonth[i] = (totalSatisfactionsByMonth[i]/numberSatisfactionsByMonth[i]).toFixed(2);
	        }

	       	res.send({
	       		"percentMale": (numberMales/(numberMales+numberFemales)).toFixed(2),
	       		"percentFemale": (numberFemales/(numberMales+numberFemales)).toFixed(2),
	       		"averageOverallSatisfaction": (totalSatisfaction/numberSatisfactions).toFixed(2),
	       		"averageOverallSatisfactionByMonth": satisfactionsByMonth
	       	});
	    }
	});

});

module.exports = router;
