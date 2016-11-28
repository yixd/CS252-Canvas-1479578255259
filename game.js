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
    soc.on('updateScore', updateScore);
    soc.on('gameCountDownFinish', gameCountDownFinish);
    // Canvas events
    soc.on('draw', draw);

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
        playerGuessed: [],
        numPlayersReady: 0,
        nextDraw: 0,
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
            countDown(data.gameId, 11, 'updateReadyCountDown',function () {
                cache[data.gameId].gameState == STATES.PLAY;
                io.sockets.in(data.gameId).emit('countDownFinish', 'apple');
            });
        }
    }
}

function updateScore(data) {
    cache[data.gameId].playerGuessed.push(data.playerId); // Allows flexibility of score system change
    var delta = (60 / cache[data.gameId].playerGuessed.length);
    cache[data.gameId].playerScore[data.playerId] += delta;
    this.emit('updateInfo', '+' + delta);
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

function gameCountDownFinish(data) {
    var cachei = cache[data.gameId];
    cachei.playerGuessed = [];
    cachei.nextDraw = (cachei.nextDraw + 1) % cachei.playerQueue.length;
    io.sockets.in(data.gameId).emit('showReadyCountDown', cachei.playerQueue[cachei.nextDraw].playerId);
    countDown(data.gameId, 10, 'updateReadyCountDown', function () {
        cache[data.gameId].gameState == STATES.PLAY;
        io.sockets.in(data.gameId).emit('countDownFinish', 'banana');
    });
}

function draw(data) {
    io.sockets.in(data.gameId).emit('updateCanvas', data.pos);
}

var words_easy = [
    "duck","snake","cow","drum","spider web","pants","corn","bell","cookie","pig","dinosaur","horse","Mickey Mouse","eyes","ocean","shoe","finger","eye","apple","alligator","pencil","head","blocks","skateboard","shirt","pizza","snowman","egg","bunny","bear","lemon","baby","mouse","sun","jar","face","snowflake","bird","girl","person","socks","lion","rocket","cup","stairs","cat","nose","sunglasses","book","desk","caterpillar","moon","bowl","balloon","bat","lizard","hippo","lamp","dragon","monster","milk","truck","branch","carrot","cherry","hat","bone","lips","lollipop","flower","bunk bed","ice cream cone","slide","table","monkey","bed","butterfly","ant","whale","elephant","motorcycle","house","bridge","ball","boat","seashell","bench","star","hand","dog","train","bus","grass","basketball","worm","inchworm","tree","orange","wheel","purse","ghost","kite","jellyfish","candle","heart","water","legs","broom","glasses","bug","cloud","cheese","bracelet","chair","grapes","bread","boy","leaf","doll","airplane","spider","pie","feet","mountain","blanket","ring","mouth","spoon","oval","chicken","bike","computer","octopus","ears","tail","cupcake","jacket","frog","football","beach","clock","circle","giraffe","crab","pen","smile","helicopter","car","swing","hamburger","bee","door","snail","robot","banana","square","ear","turtle","light","coat"
];

var words_medium = [
    "top hat","shelf","circus","magazine","sprinkler","dustpan","ticket","t-shirt","candle","brain","scar","carpet","harp","room","hill","silverware","hair","tusk","hospital","napkin","strawberry","hula hoop","three-toed sloth","match","fur","eraser","bucket","paw","battery","mouse","clam","cast","hopscotch","lock","lunchbox","starfish","seahorse","sailboat","baby","beehive","lawn mower","stork","pumpkin","hairbrush","pizza","yo-yo","banana split","cheetah","piano","hug","marshmallow","rain","chain","muffin","king","cello","soda","skunk","tadpole","wreath","suitcase","pinwheel","iPad","electricity","golf","boot","batteries","stoplight","vase","globe","roof","dimple","smile","skirt","flamingo","braid","cell phone","neck","cheeseburger","shark","chalk","shadow","rake","food","half","city","coal","blue jeans","calendar","toothbrush","blimp","mitten","garbage","tank","shoulder","swimming pool","mushroom","bowtie","ship","clown","stingray","deep","pear","ski","America","teeth","fox","volcano","church","hippopotamus","dolphin","trip","flashlight","owl","garage","laundry basket","catfish","soap","mop","dress","watering can","hook","school","wrench","cobra","crack","garden","eagle","page","pirate","deer","pine tree","whisk","milk","mailman","light switch","curtains","torch","porcupine","watch","park","radish","whistle","cucumber","door","bomb","shallow","potato","stamp","lipstick","ice","manatee","net","sunflower","computer","onion","belt","queen","lightsaber","maze","fishing pole","astronaut","dock","nut","pencil","toe","fist","pan","penguin","dominoes","shovel","hair dryer","wax","mailbox","mini blinds","horse","ring","back","log","spine","pond","tire","stump","coin","mouth","sidewalk","camera","pelican","hip","gift","artist","smoke","surfboard","address","forest","elbow","toaster","wood","pogo stick","broccoli","washing machine","scissors","bathroom scale","umbrella","doormat","airport","brick","sea turtle","knot","birthday cake","doorknob","ladybug","nail","doghouse","rug","roller blading","fork","chin","spring","fang","alarm clock","easel","dog leash","jungle","heel","key","pen","crayon","corndog","baseball","gumball","drums","blowfish","button","rocking chair","bag","tennis","spoon","rose","stomach","plate","stove","trash can","barn","tissue","ladder","zebra","light bulb","grill","forehead","cheek","lobster","railroad","coconut","chameleon","apple pie","lawnmower","platypus","daddy longlegs","toast","nature","front porch","cowboy","attic","telephone","corner","base","video camera","campfire","ironing board","outside","claw","wallet","tongue","skate","french fries","quilt","tape","rainbow","gingerbread man","cage","jelly","towel","happy","unicorn","bell pepper","glove","swing","jewelry","paint","bottle","thief","tulip","wing","waist","snowflake","frog","sink","window","lake","palace","puzzle","chocolate chip cookie","bicycle","family","river","popsicle","face","spool","money","maid","bib","pretzel","pajamas","flute","treasure","cricket","hoof","purse","beach","rhinoceros","password","peach","salt","pineapple","desk","eel","spider web","table","snowball","stapler","basket","hot dog","poodle","map","music","paper","round","violin","song","popcorn","cake","teapot","photograph","salt and pepper","gate","lighthouse","refrigerator","seesaw","flagpole","tiger","tent","spaceship","printer","state","bubble","crib","lid","hummingbird","spare","beaver","newspaper","trumpet","cockroach","mattress","electrical outlet","TV","sheep","hockey","headband","bathtub","saw","picture frame","bagel","peanut","jar","rolly polly","dragonfly","mail","dollar","lemon","chimney","storm","knee","paperclip","backbone","box","aircraft","banana peel","wall","nest"
];

var words_hard = [
    "laser","ski goggles","important","pigpen","double","retail","bruise","rubber","whisk","quicksand","s'mores","logo","speakers","wooly mammoth","bookend","lap","sandbox","mime","ceiling fan","scream","zipper","biscuit","shower curtain","glitter","pro","myth","hail","drain","boa constrictor","Heinz 57","landscape","yardstick","brand","firefighter","lung","swamp","bald","think","husband","oar","bedbug","pizza sauce","cruise","post office","welder","jazz","bobsled","dentist","picnic","peasant","chef","chestnut","shampoo","goblin","puppet","loveseat","rib","banister","CD","season","fizz","wobble","recycle","yolk","exercise","hot tub","rim","taxi","cloak","migrate","birthday","mascot","wedding cake","drawback","dream","fog","saddle","Internet","vegetarian","pilot","darkness","swarm","pharmacist","mirror","full","punk","gasoline","fireman pole","newsletter","salmon","download","plank","world","hut","bleach","raft","bride","nightmare","sweater vest","juggle","pail","wax","baby-sitter","snag","sneeze","dashboard","lace","gold","honk","catalog","neighborhood","fabric","beanstalk","dorsal","cape","dripping","cliff","wig","zoo","plow","commercial","shrew","sunburn","tiptoe","cell phone charger","runt","traffic jam","avocado","cardboard","point","crust","orbit","dance","baggage","lie","macho","moth","pocket","extension cord","sleep","drought","safe","coach","fireside","ditch","handle","drip","wag","cabin","water buffalo","comfy","bonnet","leak","sponge","rind","shrink ray","fiddle","dent","mold","caviar","letter opener","chess","sushi","hurdle","crow's nest","dryer sheets","wind","time machine","cheerleader","half","baguette","koala","chime","ringleader","ivy","ping pong","mast","deep","germ","baseboards","diagonal","jungle","hydrogen","foil","applause","glue stick","kneel","knight","darts","dizzy","clog","dust bunny","houseboat","grandpa","bargain","password","professor","macaroni","barber","sheep dog","vitamin"
];

var words_hard_II = [
    "intern","freshwater","soul","translate","opaque","clue","stockholder","loiterer","pomp","neutron","population","pride","telepathy","snag","publisher","inertia","philosopher","brainstorm","drift","reimbursement","Everglades","trademark","acre","interference","psychologist","positive","Atlantis","blunt","flotsam","armada","ironic","rainwater","Chick-fil-A","champion","exponential","carat","tournament","stowaway","mooch","expired","coast","aristocrat","riddle","inquisition","nutmeg","pastry","password","Zen","landfill","lyrics","default","flutter","fragment","vision","blacksmith","eureka","jig","tinting","siesta","slump","overture","con","implode","archaeologist","ice fishing","transpose","century","figment","twang","crisp","zero","czar","ligament","upgrade","protestant","panic","compromise","blueprint","gallop","lichen","kilogram","hang ten","random","handful","observatory","standing ovation","addendum","chaos","periwinkle","tutor","offstage","parody","stout","cartography","mine car","quarantine","brunette","infection","president","Big Bird","Elmo","Mr. Rogers","George of the Jungle","Mozart","Pablo Piccaso","C. S. Lewis","James Earl Jones","Moby Dick","Thomas Jefferson","Sean Connery","Captain Hook","Dr. Seuss","Barack Obama","the Wright brothers","Inigo Montoya","Isaac Newton","Waldo","Harry Houdini","Scooby Doo","Gilligan","Rocky","Luke Skywalker","Lucille Ball","the Grinch","Michael Jackson","Santa Claus","Mario","James Bond","Batman","Christopher Columbus","Cinderella","Clifford the Big Red Dog","Columbus","the Beatles","Harrison Ford","Romeo and Juliet","King George","Davy Crockett","Jim Henson","Frankenstein","Lance Armstrong","Audrey Hepburn","Pablo Picasso","Pinocchio","Plato","Alice (in Wonderland)","Andy Griffith","Kermit the Frog","Amelia Earhart","Charles Dickens","Henry Ford","Barbie","Rapunzel","Buzz Lightyear","Charles Darwin","Sherlock Holmes","Abraham Lincoln","Bill Gates","Alexander Graham Bell","Lewis and Clark","Weird Al","Cap'n Crunch","Clark Kent","Coldplay","Babe Ruth","Darth Vader","Elvis Presley","Robin Hood","Vincent Van Gogh","Neil Diamond","Oscar the Grouch","Bill Cosby","Winnie the Pooh","Michael Jordan","Charlie Brown","Ben Franklin","you","Tony Hawk","Harry Potter","Mary Poppins","Spider Man","John Hancock","George Washington","Dora the Explorer","Robin Williams","Billy the Kid","Albert Einstein","Thomas Edison","Peter Pan","Sonic the Hedgehog","Socrates","Beethoven","Neil Armstrong","Shakespeare","Leonardo DiCaprio","Anakin Skywalker","Princess Leia","John Williams"
];




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
