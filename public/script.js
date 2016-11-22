/*jslint browser: true*/
/*global $, jQuery, alert*/

$(function () {
    var socket = io();
    var name_entered = false;
    $('#wrapper').hide();
    $('.form-name').submit(function () {
        var name = $('#input-name').val();
        console.log(name);
        if(name && name.length < 10){
            socket.emit('name-input', name);
            $('#wrapper').fadeIn();
            $('#welcome').fadeOut();
            name_entered = true;
            console.log('name_entered: ' + name_entered + name);
        }
        return false;
    });
    $('.send').submit(function () {
        if($('#msg').val()){
            socket.emit('chat', $('#msg').val());
            $('#msg').val('');
        }
        return false;
    });
    socket.on('chat', function (data) {
        if(name_entered == true){
            console.log('name_entered: ' + name_entered + data.id + data.msg);
            $('#msgarea').append($('<div class="chat-profile user' + data.id + '"></div>'));
            $('#msgarea').append($('<div class="bubble"><p>' + data.msg + '</p></div>'));
            $('.user' + data.id).css("background-image", "url('identicons/" + data.id + ".png')");
            var div = $('#msgarea');
            div.scrollTop(div.prop("scrollHeight"));
        }
    });
    socket.on('info', function (msg) {
        $('#msgarea').append($('<div class="bubble info"><p>' + msg + '</p></div>'));
        var div = $('#msgarea');
        div.scrollTop(div.prop("scrollHeight"));
    });
    socket.on('addIcon', function (data) {
        if(name_entered == true){
            $('.chat-header').append($('<div class="user-profile user' + data.id + '"></div><span>' + data.name + '</span>'));
            $('.user' + data.id).css("background-image", "url('identicons/" + data.id + ".png')");
        }
    });
    
    var pos = {
        fx: 0, fy: 0, tx: 0, ty: 0, color: '#000'
    };
    
    var drawing = false, 
        mov = false,
        canvas = document.getElementById('canv');
        ctx = canvas.getContext('2d');
    
    socket.on('moving', function (data) {
        if(name_entered == true){
            ctx.beginPath();
            ctx.moveTo(data.fx, data.fy);
            ctx.lineTo(data.tx, data.ty);
            ctx.stroke();
        }
    });
    canvas.onmousedown = function (e) { console.log('mouse down'); drawing = true; };
    canvas.onmouseup = function (e) { drawing = false; };
    canvas.onmousemove = function (e) {
        pos.tx = e.pageX - canvas.offsetLeft;
        pos.ty = e.pageY - canvas.offsetTop;
        mov = true;
        document.getElementById("zobc").innerHTML="Coordinates: (" + pos.tx + "," + pos.ty + ")";
        document.getElementById("canv").style.border="5px solid #F08080";
    };
    canvas.onmouseout = function (e) {
        drawing = false;
        document.getElementById("zobc").innerHTML="";
        document.getElementById("canv").style.border="5px solid #c3c3c3";
    }
    function mainloop() {
        if(drawing && mov) {
            socket.emit('mousemove', pos);
            mov = false;
        }
        pos.fx = pos.tx;
        pos.fy = pos.ty;
        setTimeout(mainloop, 10);
    }
    mainloop();
    
});

function highlightcanvas(e) {
    x=e.clientX;
    y=e.clientY;
    document.getElementById("zobc").innerHTML="Coordinates: (" + x + "," + y + ")";
    document.getElementById("canv").style.border="2px solid #F08080";
}
function dehighlightcanvas() {
    document.getElementById("zobc").innerHTML="";
    document.getElementById("canv").style.border="2px solid #c3c3c3";
}
