/*jslint sloppy: true, plusplus:true, browser: true, unparam:true, vars:true, continue:true */
/*global $, jQuery, WebSocket, alert, prompt, connected, send */
"use strict";
/*

TO DO!!!!

1. Redesign
2. when Game Over, give nicer way to reload

## Prompt user's name

*/
var game = {
    turn: "a",
    a: {
        name : "A",
        score : 0
    },
    b: {
        name : "B",
        score : 0
    },
    message: "",
    max_score: 0,
    tw: 0,
    move: {
        type: "", // x or y
        x: "",    // coord x
        y: ""     // coord y
    }
};
function update() {
    console.log(game);
    $("#aturn").val(game.turn);
    $("#message").html(game.message);
    $("#asc").html(game.a.score);
    $("#bsc").html(game.b.score);
    $("#aname").html(game.a.name);
    $("#bname").html(game.b.name);
}
function initial() {
    /* Initialization */
    game = {
        turn: "a",
        a: {
            name : "A",
            score : 0
        },
        b: {
            name : "B",
            score : 0
        },
        message: "",
        max_score: 0,
        tw: 0,
        move: {
            type: "", // x or y
            x: "",    // coord x
            y: ""     // coord y
        }
    };
    game.message = "Loading";

    //game.message = "It's " + game.a.name + "'s turn";
    update();
    $("#log").hide();
    $("#asc").removeClass("turn");
    $("#bsc").removeClass("turn");
    $("#asc").addClass("turn");
}
function draw_table(tw) {
    var maint = "";
    var ri = 0;
    var rj = 0;
    var i, j;
    for (i = 1; i <= (tw * 2 + 1); i++) {
        maint = maint + "<tr>";
        rj = 0;
        if (i % 2 === 1) {
            ri = ri + 1;
        }
        for (j = 1; j <= (tw * 2 + 1); j++) {
            if (i % 2 === 1) {
                if (j % 2 === 1) {
                    maint = maint + "<td class='sdot game_elem'>&nbsp;</td></td>";
                } else {
                    rj = rj + 1;
                    maint = maint + "<td class='pline hline game_elem' id='linex" + rj + ri + "' onclick='x(" + rj + "," + ri + ")'>&nbsp;</td>";
                }
            } else {
                if (j % 2 === 1) {
                    rj = rj + 1;
                    maint = maint + "<td class='pline vline game_elem' id='liney" + rj + ri + "' onclick='y(" + rj + "," + ri + ")'>&nbsp;</td>";
                } else {
                    maint = maint + "<td class='box game_elem' id='box" + rj + ri + "'>&nbsp;</td>";
                }
            }
        }
        maint = maint + "</tr>";
    }
    $("#maintable").html(maint);
}
function promptu() {
    var tw = 3;

    var anam = 'A';
    if (name === "a") {
        anam = prompt('Input your name', 'A');
    }
    game.a.name = anam;

    if (name === "a") {
        tw = 3;
        if ((isNaN(tw)) || (tw > 10) || (tw < 1)) {
            while ((isNaN(tw)) || (tw > 10) || (tw < 1)) {
                tw = prompt('Input table width \n(1 ≤ width ≤ 10)', 3);
            }
        }
    }
    game.tw = tw;

    var bnam = 'B';//prompt('Input player 2 name','B');
    if (name === "b") {
        bnam = prompt('Input your name', 'B');
    }
    game.b.name = bnam;

    //send(1);

    draw_table(game.tw);

    game.max_score = tw * tw;
    var sb = "Scoreboard<br />";
    $('#sboard').html(sb + "(" + tw + "×" + tw + ")");

    $('#aname').html(anam);
    $('#bname').html(bnam);
    update();
}
function reloadpage() {
    initial();
    promptu();
}
$(document).ready(function () {
    initial();
    promptu();
    $("#toggle-log").click(function () {
        $("#log").toggle();
    });
});

function addColor(xyz) {
    var anam = game.a.name;
    var bnam = game.b.name;
    var turn = game.turn;
    //var score;
    if (turn === "a") {
        $(xyz).addClass("abox");
        game.a.score += 1;
        game.message = "Good job! It's " + anam + "'s turn again";
    } else if (turn === "b") {
        $(xyz).addClass("bbox");
        game.b.score += 1;
        game.message = "Good job! It's " + bnam + "'s turn again";
    }
    //$('#message').html(game.message);
    update();

    var ascore = game.a.score;
    var bscore = game.b.score;
    var totalscore = ascore - (-bscore);
    var maxscore = game.max_score;
    if (totalscore >= maxscore) {
        var temp = "Game Over: ";
        if (ascore > bscore) {
            temp += anam + " win! ";
        } else if (ascore < bscore) {
            temp += bnam + " win! ";
        } else { //ascore == bscore
            temp += "It's a tie! ";
        }
        game.message = temp;
        update();
        alert(temp);
    }
}
function invertTurn() {
    var anam = game.a.name;
    var bnam = game.b.name;
    var turn = game.turn;
    if (turn === "a") {
        $("#asc").removeClass("turn");
        $("#bsc").addClass("turn");
        turn = "b";
        game.message = "It's " + bnam + "'s turn";
    } else if (turn === "b") {
        $("#bsc").removeClass("turn");
        $("#asc").addClass("turn");
        turn = "a";
        game.message = "It's " + anam + "'s turn";
    }
    game.turn = turn;
    update();
}
function cbox(xyz) {
    if ($(xyz).hasClass("line")) {
        return true;
    }
    return false;
}
function checkboxx(xc, yc) {
    var cxy = "#linex" + xc         + (yc - 1);
    var dxy = "#liney" + xc         + (yc - 1);
    var exy = "#liney" + (xc + 1)   + (yc - 1);
    var fxy = "#linex" + xc         + (yc + 1);
    var gxy = "#liney" + (xc + 1)   + yc;
    var hxy = "#liney" + xc         + yc;
    var ixy;
    if ((cbox(cxy) && cbox(dxy) && cbox(exy)) || (cbox(fxy) && cbox(gxy) && cbox(hxy))) {
        if (cbox(cxy) && cbox(dxy) && cbox(exy)) {
            ixy = "#box" + xc + (yc - 1);
            addColor(ixy);
        }
        if (cbox(fxy) && cbox(gxy) && cbox(hxy)) {
            ixy = "#box" + xc + yc;
            addColor(ixy);
        }
    } else {
        invertTurn();
    }
}
function checkboxy(xc, yc) {
    var c1xy = "#liney" + (xc - 1)  + yc;
    var d1xy = "#linex" + (xc - 1)  + yc;
    var e1xy = "#linex" + (xc - 1)  + (yc + 1);
    var f1xy = "#liney" + (xc + 1)  + yc;
    var g1xy = "#linex" + xc        + yc;
    var h1xy = "#linex" + xc        + (yc + 1);
    var i1xy;
    if ((cbox(c1xy) && cbox(d1xy) && cbox(e1xy)) || (cbox(f1xy) && cbox(g1xy) && cbox(h1xy))) {
        if (cbox(c1xy) && cbox(d1xy) && cbox(e1xy)) {
            i1xy = "#box" + (xc - 1) + yc;
            addColor(i1xy);
        }
        if (cbox(f1xy) && cbox(g1xy) && cbox(h1xy)) {
            i1xy = "#box" + xc + yc;
            addColor(i1xy);
        }
    } else {
        invertTurn();
    }
}
function x(xa, ya, prev_send) {
    if (connected === 0) {
        alert("Peer not yet connected");
        return false;
    }
    if ((game.turn !== name) && (prev_send === null || prev_send === undefined)) {
        alert("It's your peer's turn!");
        return false;
    }
    var txy = "#linex" + xa + ya;
    if ($(txy).hasClass("line")) {
        game.message = "Please choose another line";
    } else {
        $(txy).addClass("line");
        $(txy).removeClass("pline");
        checkboxx(xa, ya);
    }
    update();
    game.move.type = "x";
    game.move.x = xa;
    game.move.y = ya;
    if (prev_send === null || prev_send === undefined) {
        send();
    }
}
function y(xb, yb, prev_send) {
    if (connected === 0) {
        alert("Peer not yet connected");
        return false;
    }
    if ((game.turn !== name) && (prev_send === null)) {
        alert("It's your peer's turn!");
        return false;
    }
    var sxy = "#liney" + xb + yb;
    if ($(sxy).hasClass("line")) {
        game.message = "Please choose another line";
    } else {
        $(sxy).addClass("line");
        $(sxy).removeClass("pline");
        checkboxy(xb, yb);
    }
    update();
    game.move.type = "y";
    game.move.x = xb;
    game.move.y = yb;
    if (prev_send === null || prev_send === undefined) {
        send();
    }
}
