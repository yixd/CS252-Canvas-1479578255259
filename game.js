var io, soc, cache;
var STATES = Object.freeze({
    IDLE: 0,
    READY: 1,
    PLAY: 2,
    ENDING: 3
});




/*
var icons = {'identicons/1.png', 'identicons/2.png', 'identicons/3.png', 'identicons/4.png', 'identicons/5.png', 'identicons/6.png'};
//ar users = {}; //field: name, id
var playerQueue = []; //filed: { id: socket.id, name: name, icon: icons[?]}
var users_ready = []; //array of users id whos ready
var history_draw = [];
var history_chat = []; //field: msg, id

function countdown(secs) {
    initializeClock(new Date(Date.parse(new Date()) + secs * 1000));
}
function getTimeRemaining(endtime) {
    var t = Date.parse(endtime) - Date.parse(new Date());
    t = Math.floor(t / 1000);
    return t;
}
var countdown_finished = false;
var timeinterval = 0;
function initializeClock(endtime) {
    function updateClock() {
        var t = getTimeRemaining(endtime);
        io.emit('updateClock', ('0' + t).slice(-2));
        console.log('t: ' + ('0' + t).slice(-2));
        if (t <= 0) {
            clearInterval(timeinterval);
            countdown_finished = true;
        }
    }
    updateClock();
    timeinterval = setInterval(updateClock, 1000);

*/

exports.initGame = function(pio, socket, roomCache){
    io = pio;
    soc = socket;
    cache = roomCache;
    console.log('socket.id: ' + soc.id);
    soc.emit('connected', { message: 'You are connected!'});
    // Welcome Page Events
    soc.on('hostCreateNewGame', hostCreateNewGame);
    soc.on('playerJoinGame', playerJoinGame);

    // Main Page Events
    soc.on('answerSubmit', sendAnswer);
    soc.on('submitChat', submitChat);
    soc.on('iconClick', updateIcon);
    soc.on('sendGameCountDown', sendGameCountDown);

};

function hostCreateNewGame() {
    var newGameID = ( Math.random() * 100000 ) | 0;
    this.emit('newGameCreated', {gameId: newGameID});
    console.log('new game created: ' + newGameID);
    // Join the Room and wait for the players
    this.join(newGameID.toString());
    cache[newGameID] = {
        playerQueue: [], //{playerName, playerId}
        chatHistory: [],
        playerScore: {}, // key: playerId, val: playerScore *undefined when unready
        numPlayersReady: 0,
        whoDraw: 0,
        gameState: STATES.IDLE
    };
}

function playerJoinGame(data) {
    var sock = this;
    console.log('Player ' + data.playerName + ' attempting to join game: ' + data.gameId );

    // Look up the room ID
    var room = soc.adapter.rooms[data.gameId.toString()];
    // If the room exists...
    if( room != undefined ){
        // If state is IDLE
        if(cache[data.gameId].gameState == STATES.IDLE) {
            // Attach the socket id to the data object.
            data.playerId = sock.id;
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
                sock.emit('iconUpdate', {
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
        } else {
            sock.emit('alertError', {message: 'The game has started.'})
        }
    } else {
        // Otherwise, send an error message back to the player.
        sock.emit('alertError', {message: "This room does not exist."});
    }
}

function sendAnswer(data) {
    //check answer and allow sending if incorrect
    //io.sockets.in(data.gameId).emit('hostCheckSubmit', data);
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
    console.log(data.playerId + ' in room ' + data.gameId + ' clicked icon ' + cache[data.gameId].playerScore[data.playerId]);
    if(cache[data.gameId].gameState == STATES.IDLE){
        var tmp = undefined;
        if(cache[data.gameId].playerScore[data.playerId] == undefined) {
            tmp = 'READY';
            cache[data.gameId].numPlayersReady++;
        }else{
            cache[data.gameId].numPlayersReady--;
        }
        cache[data.gameId].playerScore[data.playerId] = tmp;
        io.sockets.in(data.gameId).emit('updateIcon', {playerId: data.playerId, playerScore: tmp });
        // Check if all ready
        if(cache[data.gameId].numPlayersReady > 1 && cache[data.gameId].numPlayersReady == cache[data.gameId].playerQueue.length) {
            // Switch state and start countdown
            cache[data.gameId].gameState == STATES.READY;
            io.sockets.in(data.gameId).emit('showReadyCountDown', cache[data.gameId].playerQueue[0].playerId);
            countDown(data.gameId, 10, 'updateReadyCountDown',function () {
                cache[data.gameId].gameState == STATES.PLAY;
                io.sockets.in(data.gameId).emit('countDownFinish', 'apple');
            })
        }
    }
}

function switchTurn() {

}


function countDown(gameId, sec, listenerName, callback) {
    var timeInterval = setInterval(ticTac, 1000);
    function ticTac() {
        sec--;
        if(listenerName) {
            io.sockets.in(gameId).emit(listenerName, ('0' + sec).slice(-2));
        }
        //console.log('t: ' + ('0' + sec).slice(-2));
        if (sec <= 0) {
            clearInterval(timeInterval);
            callback();
            return;
        }
    }
}
function sendGameCountDown(data) {
    io.sockets.in(data.gameId).emit('updateGameCountDown', data.t);
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
