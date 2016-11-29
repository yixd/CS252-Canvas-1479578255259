var io, cache;
var STATES = Object.freeze({
    IDLE: 0,
    READY: 1,
    PLAY: 2,
    ENDING: 3,
    ERROR: 4
});


/*
var icons = {'identicons/1.png', 'identicons/2.png', 'identicons/3.png', 'identicons/4.png', 'identicons/5.png', 'identicons/6.png'};
*/

exports.initGame = function(pio, socket, roomCache){
    io = pio;
    cache = roomCache;

    console.log('socket.id: ' + socket.id);
    socket.emit('connected', { message: 'You are connected!'});
    // Welcome Page Events
    socket.on('hostCreateNewGame', hostCreateNewGame);
    socket.on('playerJoinGame', playerJoinGame);

    // Main Page Events
    socket.on('submitChat', submitChat);
    socket.on('iconClick', updateIcon);
    socket.on('sendGameCountDown', sendGameCountDown);
    socket.on('updateScore', updateScore);
    socket.on('gameCountDownFinish', gameCountDownFinish);
    // Canvas events
    socket.on('draw', draw);
    socket.on('disconnect', function () {
        console.log('--- Disconnect --- ' + socket.id + ' gameId: ' + socket.gameId);
        var room = cache[socket.gameId];
        if(room != undefined) {
            var isDrawer = (room.drawQueue[0] == socket.gameId);
            console.log('--- Is Drawer --- ');
            // Remove from playerQueue
            room.playerQueue = room.playerQueue.filter(function (obj) {
                return obj.playerId != socket.id;
            });

            // Remove from playerScore
            delete room.playerScore[socket.id];

            // Remove from playerReady
            if (room.playerReady.indexOf(socket.playerId) > -1) {
                console.log('--- Removed from playerReady --- ');
                room.playerReady.splice(room.playerReady.indexOf(socket.playerId), 1);
            }

            // Remove from drawQueue
            if (room.drawQueue.indexOf(socket.playerId) > -1) {
                console.log('--- Removed from drawQueue --- ');
                room.drawQueue.splice(room.drawQueue.indexOf(socket.playerId), 1);
            }
            // reverse shift drawQueue to cancel out later shift

            io.sockets.in(this.gameId).emit('playerDisconnect', this.id);

            // idle | ending | (play & guesser) -> no effect
            // (ready | play) & drawer -> restart from ready, score remain
            if(isDrawer) {
                //  unShift drawQueue to cancel out later shift
                console.log('--- unshift drawQueue --- ');
                room.drawQueue.unshift(room.drawQueue.pop());
                if(room.gameState == STATES.READY) {
                    console.log('--- READY TO ERROR --- ');
                    room.gameState = STATES.ERROR;
                } else if(room.gameState == STATES.PLAY) {
                    console.log('--- PLAY TO ERROR --- ');
                    room.gameState = STATES.ERROR;
                    gameCountDownFinish({gameId: socket.gameId});
                }
            }
        }
    });

};

function hostCreateNewGame() {
    var newGameID = ( Math.random() * 100000 ) | 0;
    this.emit('newGameCreated', {gameId: newGameID});
    console.log('new game created: ' + newGameID);
    // Join the Room and wait for the players
    this.join(newGameID.toString());
    cache[newGameID] = {
        playerQueue: [], // {{playerId, playerName}}   -- delete upon disconnect
        chatHistory: [],
        playerScore: {}, // key: playerId, val: playerScore *undefined when unready -- delete upon disconnect
        playerGuessed: [],
        playerReady: [],  // -- delete upon disconnect
        drawQueue: ['start'], // playerId
        round: 0,
        gameState: STATES.IDLE
    };
}

function playerJoinGame(data) {
    //console.log('this: ' + this.id);
    var sock = this;
    console.log('Player ' + data.playerName + ' attempting to join game: ' + data.gameId );

    // Look up the room ID
    var room = sock.adapter.rooms[data.gameId.toString()];
    //console.log('room: ' + JSON.stringify(room));
    // If the room exists...
    if( room != undefined ){
        // If state is IDLE
        if(cache[data.gameId].gameState == STATES.IDLE) {
            if(room.length < 6) {
                // Attach the socket id to the data object.
                data.playerId = sock.id;
                // Attach the game id and name to the socket
                sock.gameId = data.gameId;
                sock.playerName = data.playerName;
                // Join room
                sock.join(data.gameId);
                console.log('Player ' + data.playerName + ' is joining game: ' + data.gameId);
                // Load icons of players already in the room
                for (var i in cache[data.gameId].playerQueue) {
                    sock.emit('loadIcon', cache[data.gameId].playerQueue[i]);
                }
                // Load icon status of players already in the room
                Object.keys(cache[data.gameId].playerScore).forEach(function (key) {
                    console.log('updating icon for' + key + ' ' + cache[data.gameId].playerScore[key]);
                    sock.emit('updateIcon', {
                        playerId: key,
                        playerScore: cache[data.gameId].playerScore[key]
                    });
                });
                // Emit an event notifying the clients that the player has joined the room.
                io.sockets.in(data.gameId).emit('playerJoinedRoom', data);
                // Add to playerQueue
                cache[data.gameId].playerQueue.push({
                    playerName: data.playerName,
                    playerId: data.playerId
                });
                // Add to drawQueue
                cache[data.gameId].drawQueue.push(data.playerId);
            } else {
                sock.emit('alertError', {message: 'The room is full.'});
                // To be done: allow up to 10 players
            }
        } else {
            sock.emit('alertError', {message: 'The game has started.'});
            // To be done: inspector mode
        }
    } else {
        // Otherwise, send an error message back to the player.
        sock.emit('alertError', {message: "The room does not exist."});
    }
}

function submitChat(data) {
    console.log('::: msg :::' + JSON.stringify(data));
    io.sockets.in(data.gameId).emit('updateChat', data);
}

function updateIcon(data) {
    //{{ }}
    /*
    if (users_ready.indexOf(data) < 0) {
        users_ready.push(data);
    } else {
        users_ready.splice(users_ready.indexOf(data), 1);
    }*/
    var room = cache[data.gameId];
    console.log(data.playerId + ' in room ' + data.gameId + ' clicked icon ' + room.playerScore[data.playerId]);
    if(room.gameState == STATES.IDLE){
        var tmp = undefined;
        if(room.playerScore[data.playerId] == undefined) {
            tmp = 'READY';
            room.playerReady.push(data.playerId);
        }else{
            room.playerReady.splice(room.playerReady.indexOf(data.playerId), 1);
        }
        room.playerScore[data.playerId] = tmp;
        io.sockets.in(data.gameId).emit('updateIcon', {playerId: data.playerId, playerScore: tmp });

        if(room.playerReady.length > 1 && room.playerReady.length == room.playerQueue.length) {
            // idle to ready
            readyCountDown(data.gameId);
        }
    }
}

function updateScore(data) {
    cache[data.gameId].playerGuessed.push(data.playerId); // Allows flexibility of score system change
    var delta = (60 / cache[data.gameId].playerGuessed.length);
    cache[data.gameId].playerScore[data.playerId] += delta;
    this.emit('updateInfo', '+' + delta);
}

function sendGameCountDown(data) {
    io.sockets.in(data.gameId).emit('updateGameCountDown', data.t);
}

function shiftDrawQueue(room) {
    console.log('drawQ before: ' + room.drawQueue);
    room.drawQueue.push(room.drawQueue.shift());
    if(room.drawQueue[0] === 'start') {
        room.round++;
        room.drawQueue.push(room.drawQueue.shift());
    }
    console.log('drawQ after: ' + room.drawQueue);
}

function gameCountDownFinish(data) {
    var room = cache[data.gameId];
    // clear player guessed
    room.playerGuessed = [];

    if(room.round <= 4) {
        // play to ready
        readyCountDown(data.gameId);
    } else {
        // play to ending
        room.gameState = STATES.ENDING;
        // To be finished
    }
}

function readyCountDown(gameId) {
    // all about ready state
    var room = cache[gameId];
    room.gameState = STATES.READY;
    shiftDrawQueue(room);
    console.log('drawing: ' + room.drawQueue[0]);
    io.sockets.in(gameId).emit('showReadyCountDown', room.drawQueue[0]);

    countDown(gameId, 6,function () {
        console.log('in count down call back');
        room.gameState = STATES.PLAY;
        io.sockets.in(gameId).emit('countDownFinish', 'apple');
    });
}

function countDown(gameId, sec, callback) {
    var timeInterval = setInterval(ticTac, 1000);
    function ticTac() {
        sec--;
        if(cache[gameId].gameState == STATES.ERROR) {
            clearInterval(timeInterval);
            cache[gameId].gameState == STATES.READY;
            readyCountDown(gameId);
            return;
        }
        io.sockets.in(gameId).emit('updateReadyCountDown', ('0' + sec).slice(-2));
        //console.log('t: ' + ('0' + sec).slice(-2));
        if (sec <= 0) {
            clearInterval(timeInterval);
            callback();
            return;
        }
    }
}

function draw(data) {
    io.sockets.in(data.gameId).emit('updateCanvas', data.pos);
}



//unfinished
/*
console.log(socket.id + ' connected');
//var address = socket.handshake.address;
//console.log('New connection from ' + address.address + ':' + address.port);
socket.on('name-input', function (name) {
    //
     Object.keys(users).forEach(function (key) {
     socket.emit('addIcon', users[key]);
     })
     for (var i in history_draw) {
     socket.emit('moving', history_draw[i]);
     }
     for (var i in history_chat) {
     socket.emit('chat', history_chat[i]);
     }
     users[socket.id] = {
     'name': name,
     'id': Object.keys(users).length + 1
     };
     socket.emit('setId', users[socket.id].id);
     io.emit('info', '\'' + users[socket.id].name + '\' just entered room');
     io.emit('addIcon', users[socket.id]);
     //

    //load history
    for(var i in playerQueue) {
        socket.emit('addIcon', playerQueue[i]);
    }
    for (var i in history_draw) {
        socket.emit('moving', history_draw[i]);
    }
    for (var i in history_chat) {
        socket.emit('chat', history_chat[i]);
    }
    if(icons.length > 0){
        //room not full, add new player
        var tmp = {"id": socket.id, "name": name, "icon": icons.pop()};
        playerQueue.push(tmp);
        socket.emit('setId', socket.id);
        io.emit('info', '\'' + name + '\' joined game');
        io.emit('addIcon', tmp);
    } else{
        //room full, start spectating
        io.emit('info', '\'' + name + '\' started spectating');
    }
});

socket.on('disconnect', function () {
    //页面刷新的timeout - 还没做
    if (users[socket.id]) {
        io.emit('info', '\'' + users[socket.id].name + '\' left room');
    }
});
socket.on('chat', function (msg) {
    console.log('message:' + msg);
    var temp = {
        'msg': '<span>' + users[socket.id].name + ': </span>' + msg,
        'id': users[socket.id].id
    };
    history_chat.push(temp);
    io.emit('chat', temp);
});

socket.on('clickIcon', function (data) {
    if (users_ready.indexOf(data) < 0) {
        users_ready.push(data);
    } else {
        users_ready.splice(users_ready.indexOf(data), 1);
    }
    console.log('ready: ' + users_ready.length);
    io.emit('toggleReady', data);

});

socket.on('mousemove', function (data) {
    history_draw.push(data);
    //socket.broadcast.emit('moving', data); //
    io.emit('moving', data);
});

/* 清空画布 - 还没做
 socket.on('clearcanvas', function(){
 history_draw = [];
 io.emit('clearcanvas');
 });*/

/*
 function mainloop() {
 if(!countdown_finished && users_ready.length > 0 && users_ready.length == Object.keys(users).length) {
 countdown(5);
 }
 setTimeout(mainloop, 1);
 }
 mainloop();*/
