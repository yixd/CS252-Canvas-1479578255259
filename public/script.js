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

            IO.socket.on('updateIcon', App.updateIcon);
            IO.socket.on('showReadyCountDown', App.showReadyCountDown);
            IO.socket.on('updateGameCountDown', App.updateGameCountDown);
            IO.socket.on('updateChat', App.updateChat);
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
        answer: '',
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
                //self joined room successfully
                //fade out welcome window
                $('#welcome').fadeOut();
                //bind function for my icon
                $('.chat-header').on('click', '.user-profile.' + App.mySocketId, App.onIconClick);
            }
            //send notify message
            App.updateInfo('\'' + data.playerName + '\' joined game');
            //add icon to chat header
            App.addIcon(data);
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
                    message: $('#msg').val(),
                };
                if(App.gameState == STATES.PLAY) {
                    if(data.message !== App.answer) {
                        IO.socket.emit('submitChat', data);
                    } else {
                        // emit add score
                    }
                } else {
                    IO.socket.emit('submitChat', data);
                }
                $('#msg').val('');
            }
            return false;
        },

        updateChat: function (data) {
            var div = $('#msgarea');
            $('#msgarea').append($('<div class="chat-profile ' + data.playerId + '"></div>'))
                .append($('<div class="bubble"><p><span>' + App.players[data.playerId] + ': </span>' +  data.message + '</p></div>'))
                .scrollTop(div.prop("scrollHeight"));
        },

        updateInfo: function (message) {
            var div = $('#msgarea');
            $('#msgarea').append($('<div class="bubble info"><p>' + message + '</p></div>'))
                .scrollTop(div.prop("scrollHeight"));
        },

        /* *****************************
         *                             *
         *       ICON FUNCTIONS        *
         *                             *
         *******************************/
        addIcon: function (data) {
            $('.chat-header').append($('<div class="user-profile ' + data.playerId + '"></div><span>' + data.playerName + '</span>'));
            $('.' + data.playerId).css("background-image", "url('identicons/1.png')"); //later goal: customizable
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
            App.gameState = STATES.READY;
            $('#rcdWrapper').css('visibility', 'visible');
            // Assigning roles
            if(data == App.mySocketId) {
                App.myRole = 'drawer';
            } else {
                App.myRole = 'guesser';
            }
            IO.socket.on('updateReadyCountDown', App[App.myRole].updateReadyCountDown);
            IO.socket.on('countDownFinish', App[App.myRole].onCountDownFinish);
        },

        drawer: {
            /* *****************************
             *             FOR             *
             *            DRAWER           *
             *******************************/
            updateReadyCountDown: function (time) {
                console.log(time);
                $('#rcd').html(time + 'Draw turn!');
            },
            onCountDownFinish: function (data) {
                App.gameState = STATES.READY;
                $('#rcdWrapper').css('visibility', 'hidden');
                $('#hint').html(data);
                App.answer = data;
                App.countDown(21, 'sendGameCountDown', function(){
                    IO.socket.emit('gameCountDownFinish');
                })
            }
        },

        guesser: {
            /* *****************************
             *             FOR             *
             *            GUESSER          *
             *******************************/
            updateReadyCountDown: function (time) {
                console.log(time);
                $('#rcd').html(time + 'Guess turn!');
            },
            onCountDownFinish: function (data) {
                App.gameState = STATES.READY;
                $('#rcdWrapper').css('visibility', 'hidden');
                $('#hint').html('???');
                App.answer = data;
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
    IO.init();
    App.init();

    /* *****************************
     *                             *
     *       CANVAS FUNCTION       *
     *                             *
     *******************************/


}($));


/*



    var pos = {
        fx: 0, fy: 0, tx: 0, ty: 0, color: '#000'
    };
    
    var drawing = false, 
        mov = false,
        wasout = true;
        canvas = document.getElementById('canv'),
        ctx = canvas.getContext('2d'),
        canvas_parent = document.getElementById('draw');
    
    socket.on('moving', function (data) {
        if(name_entered == true){
            ctx.beginPath();
            ctx.moveTo(data.fx, data.fy);
            ctx.lineTo(data.tx, data.ty);
            ctx.stroke();
        }
    });
    canvas.onmousedown = function (e) { drawing = true; };
    canvas.onmouseup = function (e) { drawing = false; };
    canvas.onmousemove = function (e) {
        pos.tx = e.pageX - canvas.offsetLeft - canvas_parent.offsetLeft;
        pos.ty = e.pageY - canvas.offsetTop - canvas_parent.offsetTop;
        if(drawing && wasout) {
            pos.fx = pos.tx;
            pos.fy = pos.ty;
            wasout = false;
        }
        mov = true;
        document.getElementById("zobc").innerHTML="Coordinates: (" + pos.tx + "," + pos.ty + ")";
        document.getElementById("canv").style.boxShadow="0 5px 30px rgba(240, 128, 128, 0.7)";
    };
    canvas.onmouseout = function (e) {
        wasout = true;
        document.getElementById("zobc").innerHTML="";
        document.getElementById("canv").style.boxShadow="0 5px 30px rgba(0, 0, 0, 0.3)";
    }

    function mainloop() {
        if(drawing && mov) {
            socket.emit('mousemove', pos);
            mov = false;
        }
        pos.fx = pos.tx;
        pos.fy = pos.ty;
        setTimeout(mainloop, 1);
    }
    mainloop();
    
});
