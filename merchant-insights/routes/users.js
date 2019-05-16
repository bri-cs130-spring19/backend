var express = require('express');
var router = express.Router();

var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-west-2"
});

var docClient = new AWS.DynamoDB.DocumentClient();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* POST login. */
router.post('/login', function(req, res, next) {
    if (req.body.username === undefined || req.body.password === undefined) {
        res.send({"error": "missing username or password"});
    } else {
        var params = {
	    	TableName : "users",
	    	Key:{
		        "username": req.body.username,
		    }
		};
        docClient.get(params, function(err, result) {
            if (err) {
                throw(err);
            } else if (JSON.stringify(result) == "{}") {
                res.send({"error": "user does not exist"});
            } else {
            	console.log(result)
                bcrypt.compare(req.body.password, result.Item.password, function(err, match) {
                    if (match) {
                        var payload = {
                            "exp": Math.floor((Date.now()/1000)+86400),
                            "usr": result.Item.username
                        }
                        var header = {
                            "alg": "HS256",
                            "typ": "JWT"
                        }
                        var key = 'C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c';
                        var token = jwt.sign(payload, key, {'header': header});
                        res.send({"token": token});
                    } else {
                        res.send({"error": "invalid password"});
                    }
                });
            }
        });
    }
});

/* POST register. */
router.post('/register', function(req, res, next) {
	console.log(req)
    if (req.body.username === undefined || req.body.password === undefined) {
        res.send({"error": "missing username or password"});
    } else {
    	var params = {
	    	TableName : "users",
	    	Key:{
		        "username": req.body.username,
		    }
		};
    	docClient.get(params, function(err, result) {
            if (err) {
                throw(err);
            } else if (JSON.stringify(result) == "{}") {
                /* INTO DATABASE */
				bcrypt.hash(req.body.password, 10, function(err, hash) {
				  	// Store hash in your password DB.
					var paramsWrite = {
					    TableName: "users",
					    Item:{
					        "password": hash,
					        "username": req.body.username,
					        "dateCreated": Date().toString()
					    }
					};
			        docClient.put(paramsWrite, function(err, result) {
			            if (err) {
			                throw(err);
			            } else {
			            	res.send({"status": "user created successfully"});
			            }
			        });
				});
            } else {
            	res.send({"error": "username already exists"});
            }
        });
    }
});

module.exports = router;
