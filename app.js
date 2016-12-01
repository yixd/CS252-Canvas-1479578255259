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
var redis = require('redis');

var credentials;
// Check if we are in Bluemix or localhost
if(process.env.VCAP_SERVICES) {
    // On Bluemix read connection settings from
    // VCAP_SERVICES environment variable
    var env = JSON.parse(process.env.VCAP_SERVICES);
    credentials = env['redis-2.6'][0]['credentials'];
} else {
    // On localhost just hardcode the connection details
    credentials = { "host": "127.0.0.1", "port": 6379 }
}

var redisClient =  redis.createClient(credentials.port, credentials.host);

if('password' in credentials) {
    // On Bluemix we need to authenticate against Redis
    redisClient.auth(credentials.password);
}

redisClient.on('connect', function () {
    console.log('redis connected');
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