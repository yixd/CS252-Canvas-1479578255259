/*jslint browser: true*/
/*global $, jQuery, alert*/

$(function () {
    /*var c=document.getElementById("canv");
    var c = $('#canv');
    var cxt=c.getContext("2d");
    cxt.moveTo(10,20);
    cxt.lineTo(200,50);
    cxt.lineTo(12,100);
    cxt.stroke();
    var doc = $(document),
        socket = io();*/
    
});

function highlightcanvas(e) {
    x=e.clientX;
    y=e.clientY;
    document.getElementById("stat").innerHTML="Coordinates: (" + x + "," + y + ")";
    document.getElementById("canv").style.border="2px solid #F08080";
}
function dehighlightcanvas() {
    document.getElementById("stat").innerHTML="";
    document.getElementById("canv").style.border="2px solid #c3c3c3";
}
