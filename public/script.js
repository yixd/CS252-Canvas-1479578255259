;
jQuery(function($){
    'user strict';
    var IO = {
        init: function() {
            IO.socket = io();
            IO.bindEvents();
        },
        bindEvents: function () {
            IO.socket.on('connected', IO.onConnected);
            IO.socket.on('newGameCreated', App.onNewGameCreated);
            IO.socket.on('loadIcon', App.addIcon);
            IO.socket.on('playerJoinedRoom', App.playerJoinedRoom);
            IO.socket.on('playerDisconnect', App.playerDisconnect);

            IO.socket.on('updateIcon', App.updateIcon);
            IO.socket.on('showReadyCountDown', App.showReadyCountDown);
            IO.socket.on('updateGameCountDown', App.updateGameCountDown);
            IO.socket.on('updateChat', App.updateChat);
            IO.socket.on('updateInfo', App.updateInfo);
            IO.socket.on('updateScoreBoard', App.updateScoreBoard);
            IO.socket.on('updateCanvas', Draw.updateCanvas);

            IO.socket.on('updateReadyCountDown', App.updateReadyCountDown);
            IO.socket.on('countDownFinish', App.onCountDownFinish);
            //IO.socket.on('beginNewGame', IO.beginNewGame );
            //IO.socket.on('newWordData', IO.onNewWordData);
            //IO.socket.on('hostCheckAnswer', IO.hostCheckAnswer);
            //IO.socket.on('gameOver', IO.gameOver);
            IO.socket.on('alertError', IO.error);
        },
        onConnected: function () {
            App.mySocketId = IO.socket.io.engine.id;
        },
        error : function(data) {
            alert(data.message);
        }
    };
    var STATES = Object.freeze({
        IDLE: 0,
        READY: 1,
        PLAY: 2,
        ENDING: 3
    });
    var App = {
        gameId: 0,
        myRole: '',
        myName: '',
        mySocketId: '',
        aw: '',
        answered: false,
        gameState: STATES.IDLE,

        players: {},

        init: function () {
            App.cacheElements();
            App.bindEvents();
        },

        cacheElements: function () {
            App.$doc = $(document);
            //App.$readyCountDown = $('#rcd');
        },

        bindEvents: function () {
            // JOIN
            App.$doc.on('click', '#btnCreate', App.onCreateClick);
            App.$doc.on('click', '#btnJoin', App.onJoinClick);
            // CHAT
            App.$doc.on('submit', '.send', App.onSubmit);
        },

        /* *****************************
         *                             *
         *       JOIN FUNCTIONS        *
         *                             *
         *******************************/
        onCreateClick: function () { IO.socket.emit('hostCreateNewGame'); },

        onNewGameCreated: function (data) {
            App.gameId = data.gameId;
            //display gameId on welcome page
            $('#input-room').val(App.gameId).prop('disabled', true).css('color', 'rgba(255, 255, 255, 0.3)');
            //$('#input-room').attr('placeholder', App.gameId).prop('disabled', true);
            $('#btnCreate').prop('disabled', true);
        },

        onJoinClick: function () {
            temp = $('#input-room').val();
            if(temp > 0) {
                App.gameId = temp;
                App.myName = $('#input-name').val() || 'anonymous';
                var data = {
                    gameId: App.gameId,
                    playerName: App.myName
                };
                IO.socket.emit('playerJoinGame', data);
            }
        },

        //data {{playerName, gameId, mySocketId }}
        playerJoinedRoom: function (data) {
            if(data.playerId == App.mySocketId) {
                // Self joined room successfully
                // Fade out welcome window
                $('#welcome').fadeOut();
                // Bind function for my icon
                $('.chat-header').on('click', '.user-profile.' + App.mySocketId, App.onIconClick);
                // Set room id and timer
                $('#roomid').html(data.gameId.toString());
                $('#clock').html('00');
            }
            //send notify message
            App.updateInfo('\'' + data.playerName + '\' joined game');
            //add icon to chat header
            App.addIcon(data);
        },

        playerDisconnect: function (playerId) {
            // send info
            App.updateInfo(App.players[playerId] + ' left game');
            // remove from profile header
            $('.user-profile.' + playerId).remove();
            $('.user-profile-span-' + playerId).remove();
            //App.removeIcon();
        },

        /* *****************************
         *                             *
         *       CHAT FUNCTIONS        *
         *                             *
         *******************************/
        onSubmit: function () {
            if($('#msg').val()){
                var data = {
                    gameId: App.gameId,
                    playerId: App.mySocketId,
                    message: $('#msg').val()
                };
                if(App.gameState == STATES.PLAY) {
                    if(App.myRole === 'guesser') {
                        if (data.message !== App.aw) {
                            IO.socket.emit('submitChat', data);
                        } else if (!App.answered) {
                            // emit add score
                            IO.socket.emit('updateScore', data);
                            App.updateInfo('Ooops!');
                            App.answered = true;
                        }
                    }
                } else {
                    IO.socket.emit('submitChat', data);
                }
                $('#msg').val('');
            }
            return false;
        },

        updateChat: function (data) {
            var div = $('#msgarea'); // required
            $('#msgarea').append($('<div class="chat-profile ' + data.playerId + '"></div>'))
                .append($('<div class="bubble"><p><span>' + App.players[data.playerId] + ': </span>' +  data.message + '</p></div>'))
                .scrollTop(div.prop("scrollHeight"));
        },

        updateInfo: function (message) {
            var div = $('#msgarea'); // required
            $('#msgarea').append($('<div class="bubble info"><p>' + message + '</p></div>'))
                .scrollTop(div.prop("scrollHeight"));
        },

        /* *****************************
         *                             *
         *       ICON FUNCTIONS        *
         *                             *
         *******************************/
        addIcon: function (data) {
            $('.chat-header').append($('<div class="user-profile ' + data.playerId + '"></div><span class="user-profile-span-' + data.playerId + '">' + data.playerName + '</span>'));
            //$('.' + data.playerId).css("background-image", "url('identicons/2.png')");  //later goal: customizable
            $('html > body').append($("<style>." + data.playerId + " {background-image: url('identicons/2.png')}</style>"));
            App.players[data.playerId] = data.playerName;
            console.log('added icon for ' + data.playerName + ', id: ' + data.playerId);
        },

        onIconClick: function () {
            var data = {
                gameId: App.gameId,
                playerId: App.mySocketId
            };
            IO.socket.emit('iconClick', data);
        },

        updateIcon: function (data) {
            //stat 0: not ready, 1: ready
            var $who =  $('.user-profile.' + data.playerId);
            console.log('data: ' + JSON.stringify(data));
            if(data.playerScore == undefined){
                $who.removeClass('hasready').removeClass('inactive').empty();
            }else{
                $who.addClass('hasready').addClass('inactive').empty().append($('<h2>' + data.playerScore + '</h2>'));
            }
        },

        /* *****************************
         *                             *
         *       READY COUNTDOWN       *
         *                             *
         *******************************/
        showReadyCountDown: function (data) {
            // Update state
            App.gameState = STATES.READY;

            // Clear canvas
            Draw.$ctx.clearRect(0, 0, Draw.$canvas.width(), Draw.$canvas.height());

            // Show ready countdown
            $('#rcd').html('');
            $('#rcdWrapper').css('visibility', 'visible');

            // Assigning roles
            if(data == App.mySocketId) {
                App.myRole = 'drawer';
            } else {
                App.myRole = 'guesser';
            }
        },

        updateScoreBoard: function (data) {
            App.gameState = STATES.ENDING;
            $('#rcd').html('');
            Object.keys(data).forEach(function (key){
                $('#rcd').append(data[key]);
            });
            // Show ready countdown
            $('#rcdWrapper').css('visibility', 'visible');
        },
        /* *****************************
         *                             *
         *        GAME COUNTDOWN       *
         *                             *
         *******************************/
        updateReadyCountDown: function (time) {
            console.log(time);
            if(App.myRole === 'drawer') {
                $('#rcd').html('Draw!<br>' + time);
            } else {
                $('#rcd').html('Guess!<br>' + time);
            }
        },

        onCountDownFinish: function (data) {
            // Update variables
            App.answered = false;
            App.gameState = STATES.PLAY;
            App.aw = data;

            // Hide wrapper
            $('#rcdWrapper').css('visibility', 'hidden');

            if(App.myRole === 'drawer') {
                $('#hint').html(data);
                App.countDown(21, 'sendGameCountDown', function () {
                    IO.socket.emit('gameCountDownFinish', {gameId: App.gameId});
                })
            } else {
                $('#hint').html('???');
            }
        },

        /* *****************************
         *                             *
         *       DRAW HEADER FUNC      *
         *                             *
         *******************************/
        updateGameCountDown: function (t) {
            $('#clock').html(t);
        },

        /* *****************************
         *                             *
         *       HELPER FUNCTION       *
         *                             *
         *******************************/
        countDown: function(sec, listenerName, callback) {
            var timeInterval = setInterval(ticTac, 1000);
            function ticTac() {
                sec--;
                IO.socket.emit(listenerName, {'gameId': App.gameId, 't': ('0' + sec).slice(-2)});
                //console.log('t: ' + ('0' + sec).slice(-2));
                if (sec <= 0) {
                    clearInterval(timeInterval);
                    callback();
                    return;
                }
            }
        }

    };

    var Draw = {
        /* *****************************
         *                             *
         *       CANVAS FUNCTION       *
         *                             *
         *******************************/
        pos: {
            fx: 0, fy: 0, tx: 0, ty: 0, color: '#000'
        },
        drawing: false,
        mov: false,
        wasout: true,
        //canvas: document.getElementById('canv'),
        //ctx: Draw.canvas.getContext('2d'),
        //canvas_parent: document.getElementById('draw'),

        init: function () {
            Draw.cacheElements();
            Draw.bindEvents();
        },

        cacheElements: function () {
            Draw.$canvas = $('#canv');
            Draw.$canvas_parent = $('#draw');
            Draw.$ctx = $('#canv')[0].getContext('2d');

            var canvas = document.getElementById('canv');
            var canvas_parent = document.getElementById('draw');
            Draw.deltax = canvas.offsetLeft + canvas_parent.offsetLeft;
            Draw.deltay = canvas.offsetTop + canvas_parent.offsetTop;

            //console.log('deltax: ' + Draw.deltax + ' ' + JSON.stringify(Draw.$canvas));
            //console.log('deltay: ' + Draw.deltay + ' ' + JSON.stringify(Draw.$canvas_parent));
        },

        bindEvents: function () {
            Draw.$canvas.mousedown(function (e) {
                e.preventDefault();
                console.log('downed');
                Draw.pos.fx = e.pageX - Draw.deltax;
                Draw.pos.fy = e.pageY - Draw.deltay;
                Draw.drawing = true;
            });

            Draw.$canvas.mouseup(function () {
                Draw.drawing = false;
            });

            var prev = $.now();
            Draw.$canvas.mousemove(function (e) {
                console.log('moved');
                if(App.myRole === 'drawer' || App.gameState !== STATES.PLAY) {
                    if ($.now() - prev > 25) {
                        Draw.pos.tx = e.pageX - Draw.deltax;
                        Draw.pos.ty = e.pageY - Draw.deltay;
                        if(Draw.drawing) {
                            IO.socket.emit('draw', {gameId: App.gameId, pos: Draw.pos});
                        }
                        prev = $.now();
                    }
                    if(Draw.drawing) {
                        Draw.pos.fx = Draw.pos.tx;
                        Draw.pos.fy = Draw.pos.ty;
                    }
                    //Draw.wasout = false;
                    //Draw.mov = true;
                    document.getElementById("zobc").innerHTML = "Coordinates: (" + Draw.pos.tx + "," + Draw.pos.ty + ")";
                    document.getElementById("canv").style.boxShadow = "0 5px 30px rgba(240, 128, 128, 0.7)";
                }
            });

            Draw.$canvas.mouseout(function () {
                Draw.drawing = false;
                if(App.myRole === 'drawer'|| App.gameState !== STATES.PLAY) {
                    document.getElementById("zobc").innerHTML = "";
                    document.getElementById("canv").style.boxShadow = "0 5px 30px rgba(0, 0, 0, 0.3)";
                }
            });
        },

        updateCanvas: function(data) {
            Draw.$ctx.beginPath();
            Draw.$ctx.lineJoin="round";
            Draw.$ctx.moveTo(data.fx, data.fy);
            Draw.$ctx.lineTo(data.tx, data.ty);
            //Draw.$ctx.quadraticCurveTo(data.tx, data.ty);
            Draw.$ctx.lineWidth = 5;
            Draw.$ctx.lineCap = 'round';
            Draw.$ctx.stroke();
        }
    };
    IO.init();
    App.init();
    Draw.init();

}($));