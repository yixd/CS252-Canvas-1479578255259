/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

var app = express();

var cfenv = require('cfenv');

var appEnv = cfenv.getAppEnv();

var game = require('./game');

var http = app.listen(appEnv.port, '0.0.0.0', function () {
    console.log("server starting on " + appEnv.url);
});

/* *****************************
 *                             *
 *            REDIS            *
 *                             *
 *******************************/
// Util is handy to have around, so thats why that's here.
const util = require('util')
// and so is assert
const assert = require('assert');

var redis = require('redis');

var services = appEnv.services;
var redis_services = services["compose-for-redis"];


// This check ensures there is a services for Redis databases
assert(!util.isUndefined(redis_services), "Must be bound to compose-for-redis services");

// We now take the first bound Redis service and extract it's credentials object
var credentials = redis_services[0].credentials;

/// This is the Redis connection. From the application environment, we got the
// credentials and the credentials contain a URI for the database. Here, we
// connect to that URI
var client=redis.createClient(credentials.uri);

client.on("error", function (err) {
    console.log("Error " + err);
});


/* *****************************
 *                             *
 *          socket.io          *
 *                             *
 *******************************/
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

var roomCache = {};

io.on('connection', function (socket) {
    game.initGame(io, socket, roomCache);
});
