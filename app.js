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

var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

var roomCache = {};

io.on('connection', function (socket) {
    game.initGame(io, socket, roomCache);
});