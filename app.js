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
var http = require('http').Server(app);
var io = require('socket.io')(http);

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(appEnv.port, function(){
    console.log('listening on *:' + appEnv.url);
})
/*
// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
*/

/*
io.sockets.on('connection', function(socket) {
    socket.on('mousemove', function(data) {
        socket.broadcast.emit('moving', data);
    });
});
*/
