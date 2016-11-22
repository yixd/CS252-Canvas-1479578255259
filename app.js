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
var users = {}; //field: name, id
var history_draw = [];
var history_chat = []; //field: msg, id
io.on('connection', function(socket){
    console.log(socket.id + ' connected');
    socket.on('name-input', function(name){
        Object.keys(users).forEach(function (key) {
            socket.emit('addIcon', users[key]);
        })
        for (var i in history_draw) {
            socket.emit('moving', history_draw[i]);
        }
        for(var i in history_chat) {
            socket.emit('chat', history_chat[i]);
        }
        users[socket.id] = {'name': name, 'id': Object.keys(users).length + 1};
        io.emit('info', '\'' + users[socket.id].name + '\' just entered room');
        io.emit('addIcon', users[socket.id]);
    });
    socket.on('disconnect', function(){
        //页面刷新的timeout - 还没做
        if(users[socket.id]){
            io.emit('info', '\'' + users[socket.id].name + '\' left room');
        }
    });
    socket.on('chat', function(msg){
        console.log('message:' + msg);
        var temp = {'msg': '<span>' + users[socket.id].name + ': </span>' + msg,
                           'id': users[socket.id].id};
        history_chat.push(temp);
        io.emit('chat', temp);
    });
    socket.on('mousemove', function(data){
        history_draw.push(data);
        /*socket.broadcast.emit('moving', data); */
        io.emit('moving', data);
    });
    /* 清空画布 - 还没做 
    socket.on('clearcanvas', function(){
        history_draw = [];
        io.emit('clearcanvas'); 
    });*/
});
