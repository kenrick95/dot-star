/*jslint sloppy: true, plusplus:true, browser: true, unparam:true, vars:true, continue:true */
/*global $, jQuery, WebSocket, game, update, x ,y */
"use strict";
// Initialization
var ws = new WebSocket("ws://nodejs-kenrick95.rhcloud.com:8000");
var name;
var msg_before = "";
var connected = 0;
var hosting = true;

function scroll_bottom() {
    // Scroll to bottom of #log
    var log_area = document.getElementById("log");
    log_area.scrollTop = log_area.scrollHeight;
}

function log(who, msg, time) {
    if (time === null || time === undefined) {
        var date = new Date();
        time = date.toISOString();
    }
    var readable_date = new Date(time);
    var readable_time = readable_date.toUTCString();

    if (who === null) {
        who = "Information";
    }
    var format_msg = ">> ";
    format_msg += who;
    format_msg += " &lt;";
    format_msg += readable_time;
    format_msg += "&gt; ";
    format_msg += msg;
    format_msg += "<br />";

    msg_before = who;
    $("#log").html($("#log").html() + format_msg);
    console.log(who + " <" + time + "> " + msg);
    scroll_bottom();
}

var connections = {};
ws.onopen = function () {
    connected++;
    game.message = "It's " + game.a.name + "'s turn";
    update();
    //send(1);
};
ws.onclose = function () {
    connected--;
    game.message = "Game Over: Peer disconnected";
    update();
};

ws.onmessage = function (event) {
    console.log(event);
    var msg_data = JSON.parse(event.data);
    if (!msg_data.msg) {
        return false;
    }
    var msg_data_data  = msg_data.msg;
    console.log(msg_data_data);

    //if (msg_data.msg.init) {
    game.turn = msg_data.msg.turn;
        //game.tw = msg_data.msg.tw;
    if (name === "b") {
        game.a.name = msg_data.msg.a.name;  
    } else if (name === "a") {
        game.b.name = msg_data.msg.b.name;  
    }
    //} else {
    game.move = msg_data.msg.move;
    //}

    log(game.turn, JSON.stringify(msg_data_data));
    if (game.move.type === "x") {
        x(game.move.x, game.move.y, true);
    } else if (game.move.type === "y") {
        y(game.move.x, game.move.y, true);
    }
};

if (hosting) { // host
    name = "a";
} else { // client
    name = "b";
}

// onload
window.onload = function () {
    log(null, "Peer-to-peer Dots and Boxes game with WebRTC; works in Firefox 24");
};

function send(init) {
    var date = new Date();
    var time = date.toISOString();
    var send_info;
    if (init === null || init === undefined) {
        send_info = {
            init: false,
            turn: name,
            a: {
                name : game.a.name
            },
            b: {
                name : game.b.name
            },
            move: game.move
        };
    } else if (init === 1) {
        send_info = {
            init: true,
            turn: name,
            a: {
                name : game.a.name
            },
            b: {
                name : game.b.name
            },
            tw: game.tw
        };
    }

    var send_msg = '{ "name": "' + name + '",'
                 + '  "msg" : ' + JSON.stringify(send_info) + ','
                 + '  "time" : "' + time + '" }';

    var data = JSON.stringify({type: "text", message: send_msg, author: name, time: new Date()});
    log("Me", data, time);
    ws.send(data);
}
