var io, cache;
var STATES = Object.freeze({
    IDLE: 0,
    READY: 1,
    PLAY: 2,
    ERROR: 3
});
var NUM_OF_ROUNDS = 4;

var words = [
    "alligator","seashell","dragon","finger","helicopter","swing","orange","blocks","bus","frog","spider web","desk","spoon","bike","spider","horse","worm","flower","face","grapes","monkey","bowl","socks","coat","motorcycle","ball","shirt","snail","heart","bear","square","jar","hat","bridge","table","duck","caterpillar","water","ocean","turtle","pants","nose","crab","bed","wheel","giraffe","basketball","moon","lamp","apple","oval","cheese","pen","lollipop","pie","bone","rocket","light","smile","mouth","hand","octopus","bread","skateboard","cloud","grass","whale","lion","book","glasses","bird","boy","dog","drum","mouse","train","ant","bunk bed","cookie","slide","football","hamburger","snowman","branch","dinosaur","airplane","banana","door","kite","ears","chicken","eye","Mickey Mouse","doll","chair","computer","house","cupcake","elephant","ear","lizard","butterfly","girl","hippo","purse","corn","stairs","cup","bench","feet","cherry","sunglasses","boat","bee","jacket","circle","leaf","ice cream cone","lemon","pig","monster","bat","bell","star","pencil","bracelet","pizza","shoe","inchworm","legs","sun","balloon","tail","cat","jellyfish","bug","snowflake","robot","cow","egg","snake","tree","blanket","beach","broom","ghost","bunny","clock","person","carrot","head","lips","ring","eyes","truck","milk","car","candle","mountain",
    "dress","dominoes","popsicle","forehead","ring","sunflower","stamp","lunchbox","carpet","alarm clock","sailboat","stingray","bell pepper","pear","mop","crayon","dimple","toe","half","watch","banana split","coal","golf","rain","waist","rose","bottle","banana peel","ski","popcorn","barn","wreath","corner","cello","owl","chimney","net","sidewalk","school","electricity","cricket","mini blinds","peach","whistle","password","tissue","forest","hoof","basket","pizza","coin","song","rainbow","tennis","beaver","bathtub","french fries","money","cheek","round","mail","brick","salt and pepper","jewelry","corndog","grill","gate","hug","cucumber","jelly","flamingo","eraser","chocolate chip cookie","hook","baby","bomb","snowflake","watering can","rhinoceros","doghouse","desk","puzzle","telephone","skate","paperclip","mailman","chain","aircraft","swing","base","apple pie","ship","cockroach","beach","candle","log","mushroom","cheetah","jungle","penguin","cake","torch","bag","lawn mower","hummingbird","muffin","magazine","napkin","front porch","hot dog","top hat","hippopotamus","stump","food","blowfish","spring","daddy longlegs","sheep","knee","map","cast","pond","globe","wing","easel","zebra","piano","spine","skunk","window","shadow","picture frame","scissors","radish","teeth","palace","onion","drums","stork","umbrella","king","deer","thief","sink","elbow","washing machine","lighthouse","garbage","fang","battery","pan","light switch","braid","spaceship","sprinkler","spoon","river","snowball","sea turtle","newspaper","violin","maid","glove","toothbrush","flashlight","rake","table","railroad","bubble","bib","campfire","starfish","lock","photograph","wall","shelf","maze","tulip","electrical outlet","platypus","gift","crib","fist","pajamas","city","neck","garden","state","music","eel","swimming pool","ironing board","hair","doormat","garage","knot","ladder","queen","rug","clown","address","towel","teapot","belt","vase","lake","flagpole","flute","smile","horse","ice","silverware","trumpet","nail","mailbox","boot","catfish","roller blading","astronaut","spare","pelican","batteries","purse","pineapple","laundry basket","heel","curtains","park","door","lipstick","hip","hairbrush","coconut","fox","strawberry","page","storm","tusk","tadpole","fork","smoke","dock","crack","gumball","spider web","hair dryer","bicycle","manatee","wood","tiger","camera","pirate","happy","wrench","lid","TV","hopscotch","lobster","outside","toast","button","paint","trash can","salt","face","seesaw","pencil","headband","volcano","artist","pinwheel","pen","brain","family","fur","refrigerator","dollar","back","nest","ticket","chin","tank","surfboard","bathroom scale","shark","nut","pine tree","mouth","eagle","tape","skirt","lawnmower","scar","stoplight","gingerbread man","treasure","cheeseburger","birthday cake","lightsaber","cell phone","shallow","trip","marshmallow","whisk","soda","airport","room","dustpan","lemon","box","quilt","stomach","plate","mouse","mattress","attic","porcupine","broccoli","hospital","bucket","video camera","bagel","suitcase","toaster","dog leash","claw","bowtie","match","hockey","poodle","iPad","dolphin","circus","blue jeans","key","t-shirt","clam","cage","saw","doorknob","yo-yo","potato","pumpkin","light bulb","hill","deep","America","stove","nature","backbone","peanut","spool","soap","paper","church","wax","pretzel","beehive","milk","dragonfly","calendar","stapler","paw","mitten","roof","cobra","printer","harp","blimp","rolly polly","computer","unicorn","tongue","jar","fishing pole","pogo stick","wallet","frog","rocking chair","chalk","shoulder","tent","three-toed sloth","hula hoop","seahorse","baseball","cowboy","shovel","tire","ladybug",
    "trademark","riddle","handful","infection","neutron","transpose","brunette","exponential","siesta","upgrade","compromise","ironic","tinting","parody","addendum","pride","philosopher","ice fishing","cartography","intern","stockholder","translate","inquisition","clue","psychologist","Everglades","loiterer","quarantine","armada","tournament","flotsam","eureka","figment","president","reimbursement","rainwater","lyrics","kilogram","population","acre","offstage","chaos","expired","stowaway","drift","slump","implode","telepathy","hang ten","vision","positive","carat","Atlantis","flutter","century","nutmeg","lichen","mooch","coast","gallop","default","pastry","observatory","archaeologist","aristocrat","zero","tutor","brainstorm","inertia","blacksmith","fragment","blunt","protestant","standing ovation","overture","pomp","stout","snag","con","czar","soul","random","Chick-fil-A","crisp","panic","mine car","landfill","freshwater","jig","blueprint","opaque","interference","ligament","champion","periwinkle","publisher","password","twang",
    "dream","grandpa","runt","commercial","shrew","wedding cake","taxi","cape","avocado","ski goggles","laser","post office","dance","macho","comfy","bruise","pail","dentist","rind","cloak","important","coach","dust bunny","pro","fireman pole","kneel","whisk","sweater vest","vegetarian","s'mores","bedbug","moth","lie","baseboards","chess","pigpen","honk","quicksand","bonnet","gold","download","full","koala","chime","swamp","firefighter","plow","fabric","myth","dent","glitter","wag","wax","brand","retail","sandbox","biscuit","wig","darts","raft","hot tub","catalog","baguette","picnic","oar","bald","dizzy","rim","barber","lung","rubber","leak","sneeze","cliff","fizz","world","professor","deep","baggage","foil","ping pong","drip","bobsled","plank","punk","ceiling fan","mime","water buffalo","sunburn","exercise","landscape","ivy","chef","letter opener","shrink ray","season","welder","cabin","bleach","yolk","handle","peasant","sushi","hurdle","clog","logo","drain","darkness","sponge","baby-sitter","mast","ditch","ringleader","mascot","Heinz 57","scream","glue stick","hail","chestnut","germ","newsletter","cruise","password","swarm","boa constrictor","shower curtain","hydrogen","traffic jam","applause","tiptoe","wooly mammoth","hut","half","bargain","sheep dog","neighborhood","saddle","banister","zipper","snag","lap","extension cord","macaroni","speakers","CD","caviar","knight","dryer sheets","point","Internet","pharmacist","bookend","diagonal","safe","dripping","nightmare","think","time machine","lace","zoo","double","husband","recycle","rib","drought","gasoline","jazz","dashboard","cell phone charger","mold","shampoo","houseboat","puppet","pocket","fog","wobble","cardboard","juggle","pizza sauce","drawback","yardstick","salmon","beanstalk","crow's nest","orbit","vitamin","fireside","wind","birthday","dorsal","crust","loveseat","goblin","jungle","sleep","bride","fiddle","pilot","cheerleader","migrate"
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
        io.sockets.in(gameId).emit('countDownFinish', words[Math.floor(Math.random() * (words.length - 1))]);
    });
}

function countDown(gameId, sec, callback) {
    var timeInterval = setInterval(ticTac, 1000);
    //(new Audio()).canPlayType("audio/ogg; codecs=vorbis");
    //var snd = new Audio ("countdown_beep.mp3");
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
        if (sec == 10) {
            var snd = new Audio ("countdown_beep.mp3");
            snd.play();
        }
        if (sec <= 0) {
            //snd.currentTime = 0;
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
