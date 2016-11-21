/*jslint browser: true*/
/*global $, jQuery, alert*/

$(function () {
    var socket = io();
    $('form').submit(function () {
        socket.emit('chat', $('#msg').val());
        $('#msg').val('');
        return false;
    });
    socket.on('chat', function (msg) {
        $('#chatbox').append($('<li>').text(msg));
        var div = $('#msgarea');
        div.scrollTop(div.prop("scrollHeight"));
    });
    
    var pos = {
        fx: 0, fy: 0, tx: 0, ty: 0, color: '#000'
    };
    
    var drawing = false, 
        mov = false,
        canvas = document.getElementById('canv');
        ctx = canvas.getContext('2d');
    
    socket.on('moving', function (data) {
        ctx.beginPath();
        ctx.moveTo(data.fx, data.fy);
        ctx.lineTo(data.tx, data.ty);
        ctx.stroke();
    });
    canvas.onmousedown = function (e) { console.log('mouse down'); drawing = true; };
    canvas.onmouseup = function (e) { drawing = false; };
    canvas.onmousemove = function (e) {
        pos.tx = e.pageX - canvas.offsetLeft;
        pos.ty = e.pageY - canvas.offsetTop;
        mov = true;
        document.getElementById("zobc").innerHTML="Coordinates: (" + pos.tx + "," + pos.ty + ")";
        document.getElementById("canv").style.border="2px solid #F08080";
    };
    canvas.onmouseout = function (e) {
        drawing = false;
        document.getElementById("zobc").innerHTML="";
        document.getElementById("canv").style.border="2px solid #c3c3c3";
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
