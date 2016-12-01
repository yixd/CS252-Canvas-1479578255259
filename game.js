var io, cache;
var STATES = Object.freeze({
    IDLE: 0,
    READY: 1,
    PLAY: 2,
    ERROR: 3
});
var NUM_OF_ROUNDS = 4;

var word_easy = [
    "chair","milk","jacket","person","butterfly","ant","truck","light","pants","feet","mountain","flower","ice cream","ball","nose","book","lollipop","apple","banana","car","leaf","lips","cloud","star","circle","socks","Mickey Mouse","bee","ring","table","shirt","sunglasses","bed","grass","turtle","balloon","sun","moon","spoon","hat","lamp","ocean","ear","cherry", "pen", "drum", "orange", "jellyfish", "boat", "stairs", "lemon","candle", "ghost","girl", "dog", "pig", "tree", "legs", "clock", "computer", "hamburger", "computer", "rocket", "giraffe", "train", "pizza", "elephant"
];

var word_medium = [
    "belt", "corndog", "stove", "campfire", "lake", "coal", "gift", "mitten", "purse", "snowflake", "fur", "dog leash", "forest", "hair", "wood", "rain", "coconut", "knot", "bowtie", "telephone", "dragonfly", "waist", "cheeseburger", "food", "aircraft", "silverware", "knee", "battery", "strawberry", "lid", "manatee", "elbow", "basket", "unicorn", "trumpet", "ladder", "beach", "mushroom", "money", "batteries", "stingray", "penguin", "spool", "queen", "glove", "shallow", "rug", "cockroach", "pencil", "flamingo", "video camera", "mailbox", "nut", "hug", "toast", "pineapple", "harp", "sheep", "paw", "scar", "city", "thief", "photograph", "paper", "hip", "room", "washing machine", "fishing pole", "airport", "paint", "spine", "log", "hospital", "spaceship", "cage", "wing", "refrigerator", "tank", "violin", "broccoli", "heel", "eel", "nature", "blue jeans", "mattress", "whisk", "roller blading", "t-shirt", "maze", "net", "beaver", "cheetah", "base", "towel", "tennis", "plate", "sailboat", "pirate",
];

var word_hard = [
    "wax", "grandpa", "half", "mime", "ivy", "shrew", "runt", "baguette", "rind", "bobsled", "shower curtain", "jungle", "CD", "bonnet", "boa constrictor", "ditch", "wooly mammoth", "Heinz 57", "dryer sheets", "germ", "bedbug", "macho", "letter opener", "fireman pole", "sushi", "fireside", "hot tub", "hurdle", "hydrogen", "myth", "welder", "dashboard", "orbit", "rubber", "bookend", "cabin", "darkness", "vegetarian", "wobble", "sneeze", "lie", "traffic jam", "password", "swamp", "lung", "deep", "drip", "ping pong", "yolk", "fog", "dripping", "comfy", "beanstalk", "newsletter", "professor", "cape", "plow", "foil", "post office", "tiptoe", "taxi", "chef", "crust", "coach", "fizz", "commercial", "ceiling fan", "dream", "sweater vest", "neighborhood", "diagonal", "nightmare", "bald", "double", "important", "pigpen", "dizzy", "extension cord", "fiddle", "vitamin", "wag", "sandbox", "baseboards", "wedding cake", "Internet", "salmon", "catalog", "zipper", "bride", "pilot", "quicksand", "zoo", "migrate", "picnic", "koala", "ski goggles", "cell phone charger", "mirror", "think", "knight"
];

var words = [
    "wax", "grandpa", "half", "mime", "ivy", "shrew", "runt", "baguette", "rind", "bobsled", "shower curtain", "jungle", "CD", "bonnet", "boa constrictor", "ditch", "wooly mammoth", "Heinz 57", "dryer sheets", "germ", "bedbug", "macho", "letter opener", "fireman pole", "sushi", "fireside", "hot tub", "hurdle", "hydrogen", "myth", "welder", "dashboard", "orbit", "rubber", "bookend", "cabin", "darkness", "vegetarian", "wobble", "sneeze", "lie", "traffic jam", "password", "swamp", "lung", "deep", "drip", "ping pong", "yolk", "fog", "dripping", "comfy", "beanstalk", "newsletter", "professor", "cape", "plow", "foil", "post office", "tiptoe", "taxi", "chef", "crust", "coach", "fizz", "commercial", "ceiling fan", "dream", "sweater vest", "neighborhood", "diagonal", "nightmare", "bald", "double", "important", "pigpen", "dizzy", "extension cord", "fiddle", "vitamin", "wag", "sandbox", "baseboards", "wedding cake", "Internet", "salmon", "catalog", "zipper", "bride", "pilot", "quicksand", "zoo", "migrate", "picnic", "koala", "ski goggles", "cell phone charger", "mirror", "think", "knight",
    "chair","milk","jacket","person","butterfly","ant","truck","light","pants","feet","mountain","flower","ice cream","ball","nose","book","lollipop","apple","banana","car","leaf","lips","cloud","star","circle","socks","Mickey Mouse","bee","ring","table","shirt","sunglasses","bed","grass","turtle","balloon","sun","moon","spoon","hat","lamp","ocean","ear","cherry", "pen", "drum", "orange", "jellyfish", "boat", "stairs", "lemon","candle", "ghost","girl", "dog", "pig", "tree", "legs", "clock", "computer", "hamburger", "computer", "rocket", "giraffe", "train", "pizza", "elephant",
    "belt", "corndog", "stove", "campfire", "lake", "coal", "gift", "mitten", "purse", "snowflake", "fur", "dog leash", "forest", "hair", "wood", "rain", "coconut", "knot", "bowtie", "telephone", "dragonfly", "waist", "cheeseburger", "food", "aircraft", "silverware", "knee", "battery", "strawberry", "lid", "manatee", "elbow", "basket", "unicorn", "trumpet", "ladder", "beach", "mushroom", "money", "batteries", "stingray", "penguin", "spool", "queen", "glove", "shallow", "rug", "cockroach", "pencil", "flamingo", "video camera", "mailbox", "nut", "hug", "toast", "pineapple", "harp", "sheep", "paw", "scar", "city", "thief", "photograph", "paper", "hip", "room", "washing machine", "fishing pole", "airport", "paint", "spine", "log", "hospital", "spaceship", "cage", "wing", "refrigerator", "tank", "violin", "broccoli", "heel", "eel", "nature", "blue jeans", "mattress", "whisk", "roller blading", "t-shirt", "maze", "net", "beaver", "cheetah", "base", "towel", "tennis", "plate", "sailboat", "pirate",
];

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
    socket.on('trash', trash);
    socket.on('disconnect', function () {
        console.log('--- Disconnect --- ' + socket.id + ' gameId: ' + socket.gameId);
        //console.log(JSON.stringify(cache[socket.gameId]));
        var room = cache[socket.gameId];
        if(room != undefined) {
            var isDrawer = (room.drawQueue[0] == socket.id);
            // Remove from playerQueue
            room.playerQueue = room.playerQueue.filter(function (obj) {
                return obj.playerId != socket.id;
            });

            // Remove from playerScore
            delete room.playerScore[socket.id];

            // Remove from playerReady
            if (room.playerReady.indexOf(socket.id) > -1) {
                console.log('--- Removed from playerReady --- ');
                room.playerReady.splice(room.playerReady.indexOf(socket.id), 1);
            }

            // Remove from drawQueue
            if (room.drawQueue.indexOf(socket.id) > -1) {
                console.log('--- Removed from drawQueue --- ');
                room.drawQueue.splice(room.drawQueue.indexOf(socket.id), 1);
            }
            // put back icon
            room.iconList.push(socket.icon);
            io.sockets.in(this.gameId).emit('playerDisconnect', this.id);

            // idle | (play & guesser) -> no effect
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
        playerQueue: [], // {{playerId, playerName, playerIcon}}   -- delete upon disconnect
        iconList: ['pzqgqlvov/abra.png', '5446fczhr/bellsprout', 'cy4s0r7an/bullbasaur', 'xjjjsnovj/caterpie', '6a86e5nsf/charmander', '5lzbv7p2n/dratini',
            'rz72i0q0f/eevee', 'lznws3ulr/jigglypuff', 'mqgmxvwz3/mankey', 'p92bykipb/meowth', 'g2k1badgv/mew', '9ddhv9s4v/pidgey', 'kr016h2nj/pikachu_2',
            'hy6tmg2b3/psyduck', 'dqc1dp0vj/rattata', 't0bwkvwdr/snorlax', 'am1dgwk33/squirtle', '9xx4bpar3/venonat', '8k5hgebhr/weedle', 'ygz5t0f5b/zubat'],
        chatHistory: [],
        playerScore: {}, // key: playerId, val: playerScore -- delete upon disconnect
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
    var room_struct = sock.adapter.rooms[data.gameId.toString()];
    //console.log('room: ' + JSON.stringify(room));
    // If the room exists...
    if( room_struct != undefined ){
        var room = cache[data.gameId];
        // If state is IDLE
        if(cache[data.gameId].gameState == STATES.IDLE) {
            if(room_struct.length < 6) {
                // Attach the socket id to the data object.
                data.playerId = sock.id;
                // Attach the game id and name to the socket
                sock.gameId = data.gameId;
                sock.playerName = data.playerName;
                sock.playerIcon = room.iconList.splice(Math.floor(Math.random() * room.iconList.length), 1);
                console.log('icon: ' + sock.playerIcon);
                data.playerIcon = sock.playerIcon;

                // Join room
                sock.join(data.gameId);
                console.log('Player ' + data.playerName + ' is joining game: ' + data.gameId);

                // Load icons of players already in the room
                for (var i in cache[data.gameId].playerQueue) {
                    sock.emit('loadIcon', cache[data.gameId].playerQueue[i]);
                }
                // Load icon status of ready players
                for (var i in cache[data.gameId].playerReady) {
                    console.log('updating icon for' + cache[data.gameId].playerReady[i]);
                    sock.emit('updateIcon', {
                        playerId: cache[data.gameId].playerReady[i],
                        playerScore: 'READY'
                    });
                }
                // Emit an event notifying the clients that the player has joined the room.
                io.sockets.in(data.gameId).emit('playerJoinedRoom', data);
                // Add to playerQueue
                cache[data.gameId].playerQueue.push({
                    playerName: data.playerName,
                    playerId: data.playerId,
                    playerIcon: sock.playerIcon
                });
                // Add to drawQueue
                cache[data.gameId].drawQueue.push(data.playerId);
                // Initialize player score
                cache[data.gameId].playerScore[data.playerId] = 0;
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
    var room = cache[data.gameId];
    //console.log('state: ' + room.gameState + ' ' + data.playerId + ' in room ' + data.gameId + ' clicked icon ' + room.playerScore[data.playerId]);
    if(room.gameState == STATES.IDLE){
        if(room.playerReady.indexOf(data.playerId) > -1) {
            room.playerReady.splice(room.playerReady.indexOf(data.playerId), 1);
            io.sockets.in(data.gameId).emit('updateIcon', {playerId: data.playerId, playerScore: undefined });
        }else{
            room.playerReady.push(data.playerId);
            io.sockets.in(data.gameId).emit('updateIcon', {playerId: data.playerId, playerScore: 'READY' });
        }
        console.log(':: player Ready:  ' + room.playerReady);
        console.log(':: cache  Ready:  ' + cache[data.gameId].playerReady);
        if(room.playerReady.length > 1 && room.playerReady.length == room.playerQueue.length) {
            // idle to ready
            Object.keys(room.playerScore).forEach(function (key) {
                io.sockets.in(data.gameId).emit('updateIcon', {playerId: key, playerScore: room.playerScore[key] });
            });
            readyCountDown(data.gameId);
        }
    }

}

function updateScore(data) {
    var room = cache[data.gameId];
    room.playerGuessed.push(data.playerId); // Allows flexibility of score system change
    var delta = (60 / cache[data.gameId].playerGuessed.length);
    room.playerScore[data.playerId] += delta;
    this.emit('updateInfo', '+' + delta);
    io.sockets.in(data.gameId).emit('updateIcon', {playerId: data.playerId, playerScore: room.playerScore[data.playerId] });
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
    if(room) {
        // clear player guessed
        room.playerGuessed = [];
        console.log(room.round);
        if (room.round < NUM_OF_ROUNDS) {
            // play to ready
            readyCountDown(data.gameId);
        } else {
            // PLAY TO IDLE **** PLAY TO IDLE **** PLAY TO IDLE **** PLAY TO IDLE **** PLAY TO IDLE ****
            console.log('PLAY TO IDLE');
            room.round = 0;
            room.playerReady = [];
            room.gameState = STATES.IDLE;

            var tmp = [];
            Object.keys(room.playerScore).forEach(function(key){
                tmp.push({playerId: key, playerScore: room.playerScore[key]});
            });
            tmp.sort(function (a, b) {
                return b.playerScore - a.playerScore
            });
            io.sockets.in(data.gameId).emit('updateScoreBoard', tmp);
            // To be finished
        }
    }
}

function readyCountDown(gameId) {
    // all about ready state
    console.log('in ready count down');
    var room = cache[gameId];
    room.gameState = STATES.READY;
    shiftDrawQueue(room);
    console.log('drawing: ' + room.drawQueue[0]);
    io.sockets.in(gameId).emit('showReadyCountDown', room.drawQueue[0]);

    countDown(gameId, 6,function () {
        console.log('in count down call back');
        room.gameState = STATES.PLAY;
        io.sockets.in(gameId).emit('countDownFinish', words[Math.floor(Math.random() * words.length)]);
    });
}

function countDown(gameId, sec, callback) {
    var timeInterval = setInterval(ticTac, 1000);
    function ticTac() {
        sec--;
        if(cache[gameId].gameState == STATES.ERROR) {
            console.log('in countDown error');
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
function trash(gameId) {
    io.sockets.in(gameId).emit('clearCanvas');
}