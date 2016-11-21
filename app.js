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
/*
var http = require('http').Server(app);*/
var http = app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
var io = require('socket.io')(http);

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

var history = [];
io.on('connection', function(socket){
    console.log('a user connected'); 
    socket.on('chat', function(msg){
        console.log('message:' + msg);
        io.emit('chat', msg);
    });
    for (var i in history) {
        socket.emit('moving', history[i]);
    }
    socket.on('mousemove', function(data){
        history.push(data);
        /*socket.broadcast.emit('moving', data); */
        io.emit('moving', data);
    });
    /* 清空画布 - 还没做 
    socket.on('clearcanvas', function(){
        history = [];
        io.emit('clearcanvas'); 
    });*/
});
