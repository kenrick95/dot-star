/* jQuery TextFill */
; (function($) {
	/**
	* Resizes an inner element's font so that the inner element completely fills the outer element.
	* @author Russ Painter WebDesign@GeekyMonkey.com
	* @version 0.1
	* @param {Object} Options which are maxFontPixels (default=40), innerTag (default='span')
	* @return All outer elements processed
	* @example <div class='mybigdiv filltext'><span>My Text To Resize</span></div>
	*/
	$.fn.textfill = function(options) {
		var defaults = {
			maxFontPixels: 40,
			innerTag: 'span'
		};
		var Opts = jQuery.extend(defaults, options);
		return this.each(function() {
			var fontSize = Opts.maxFontPixels;
			var ourText = $(Opts.innerTag + ':visible:first', this);
			var maxHeight = $(this).height();
			var maxWidth = $(this).width();
			var textHeight;
			var textWidth;
			do {
				ourText.css('font-size', fontSize);
				textHeight = ourText.height();
				textWidth = ourText.width();
				fontSize = fontSize - 1;
			} while ((textHeight > maxHeight || textWidth > maxWidth) && fontSize > 3);
		});
	};
})(jQuery);
/*

TO DO!!!!

1. if A turn, then B cannot move [ DONE ]
2. when A finish moving, send to B which move did A move [ DONE ]
3. when Game Over, give nicer way to reload

*/
$(document).ready(function() {
	$('.jtextfill').textfill({ maxFontPixels: 36, innerTag: 'td' });
	initial();
	promptu();
	$("#yname").html(name);
});
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
	move: {
		type: "", // x or y
		x: "",    // coord x
		y: ""     // coord y
	}
};
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
		move: {
			type: "", // x or y
			x: "",    // coord x
			y: ""     // coord y
		}
	};
	game.message = "It's " + game.a.name + "'s turn";
	update();
	/*
	$("#aturn").val(game.turn);
	$("#asc").html(game.a.score);
	$("#bsc").html(game.b.score);
	$("#message").html(game.message);
	var anam = $("#aname").html();
	var bnam = $("#bname").html();
	*/
	
	$("#asc").removeClass("turn");
	$("#bsc").removeClass("turn");
	$("#asc").addClass("turn");
}
function update() {
	console.log(game);
	$("#aturn").val(game.turn);
	$("#message").html(game.message);
	$("#asc").html(game.a.score);
	$("#bsc").html(game.b.score);
	$("#aname").html(game.a.name);
	$("#bname").html(game.b.name);
		
}
function reloadpage() {
	initial();
	promptu();
}
function x(xa,ya, prev_send) {
	if (((game.turn != name) && (prev_send == null)) || (connected == 0)) {
		alert("It's your peer's turn!");
		return false;	
	}
	var txy="#linex"+xa+""+ya;
	if ($(txy).hasClass("line")) {
		game.message = "Please choose another line";
	} else {
		$(txy).addClass("line");
		$(txy).removeClass("pline");
		checkboxx(xa,ya);
	}
	update();
	game.move.type = "x";
	game.move.x = xa;
	game.move.y = ya;
	if (prev_send == null) {
		send();
	}
}
function y(xb,yb, prev_send) {
	if (((game.turn != name) && (prev_send == null)) || (connected == 0)) {
		alert("It's your peer's turn!");
		return false;	
	}
	var sxy="#liney"+xb+""+yb;
	if ($(sxy).hasClass("line")) {
		game.message = "Please choose another line";
	} else {
		$(sxy).addClass("line");
		$(sxy).removeClass("pline");
		checkboxy(xb,yb);
	}
	update();
	game.move.type = "y";
	game.move.x = xb;
	game.move.y = yb;
	if (prev_send == null) {
		send();
	}
}
function checkboxx(xc,yc) {
	var cxy="#linex"+xc+""+(yc-1);
	var dxy="#liney"+xc+""+(yc-1);
	var exy="#liney"+(xc+1)+""+(yc-1);
	var fxy="#linex"+xc+""+(yc+1);
	var gxy="#liney"+(xc+1)+""+yc;
	var hxy="#liney"+xc+""+yc;
	if ((cbox(cxy) && cbox(dxy) && cbox(exy)) || (cbox(fxy) && cbox(gxy) && cbox(hxy))) {
		if (cbox(cxy) && cbox(dxy) && cbox(exy)) {
			var ixy="#box"+xc+(yc-1);
			addColor(ixy);
		}
		if (cbox(fxy) && cbox(gxy) && cbox(hxy)) {
			var ixy="#box"+xc+yc;
			addColor(ixy);
		}
	} else {
		invertTurn();
	}
}
function checkboxy(xc,yc) {
	var c1xy="#liney"+(xc-1)+""+yc;
	var d1xy="#linex"+(xc-1)+""+yc;
	var e1xy="#linex"+(xc-1)+""+(yc+1);
	var f1xy="#liney"+(xc+1)+""+yc;
	var g1xy="#linex"+xc+""+yc;
	var h1xy="#linex"+xc+""+(yc+1);
	if ((cbox(c1xy) && cbox(d1xy) && cbox(e1xy)) || (cbox(f1xy) && cbox(g1xy) && cbox(h1xy))) {
		if (cbox(c1xy) && cbox(d1xy) && cbox(e1xy)) {
			var i1xy="#box"+(xc-1)+yc;
			addColor(i1xy);
		}
		if (cbox(f1xy) && cbox(g1xy) && cbox(h1xy)) {
			var i1xy="#box"+xc+yc;
			addColor(i1xy);
		}
	} else {
		invertTurn();
	}
}
function cbox(xyz) {
	if ($(xyz).hasClass("line")) {
		return true;
	} else {
		return false;
	}
}
function addColor(xyz) {
	/*var anam = $("#aname").html();
	var bnam = $("#bname").html();
	var turn = $("#aturn").val();*/
	var anam = game.a.name;
	var bnam = game.b.name;
	var turn = game.turn;
	//var score;
	if (turn == "a") {
		//score = $('#asc').html();
		$(xyz).addClass("abox");
		game.a.score += 1;
		//$('#asc').html(score-(-1));
		game.message = "Good job! It's " + anam + "'s turn again";
	} else if (turn=="b") {
		//score = $('#bsc').html();
		$(xyz).addClass("bbox");
		game.b.score += 1;
		//$('#bsc').html(score-(-1));
		game.message = "Good job! It's " + bnam + "'s turn again";
	}
	//$('#message').html(game.message);
	update();
	
	var ascore = game.a.score;
	var bscore = game.b.score;
	var totalscore = ascore-(-bscore);
	var maxscore = game.max_score;
	if (totalscore >= maxscore) {
		var temp="Game Over: Reload page to start a new game.";
		if (ascore > bscore) {
			temp = anam + " win! " + temp;
		} else if (ascore<bscore) {
			temp = bnam + " win! " + temp;
		} else {
			temp = "It's a tie! " + temp;
		}
		alert(temp);
		update();
	}
}
function invertTurn() {
	/*var anam = $("#aname").html();
	var bnam = $("#bname").html();
	var turn = $("#aturn").val();*/
	var anam = game.a.name;
	var bnam = game.b.name;
	var turn = game.turn;
	if (turn=="a") {
		$("#asc").removeClass("turn");
		$("#bsc").addClass("turn");
		turn = "b";
		game.message = "It's " + bnam + "'s turn";
	} else if (turn=="b") {
		$("#bsc").removeClass("turn");
		$("#asc").addClass("turn");
		turn = "a";
		game.message = "It's " + anam + "'s turn";
	}
	game.turn = turn;
	update();
	//$("#aturn").val(turn);
}
function promptu() {
	var tw = 3;
	/*if ((isNaN(tw))||(tw>10)||(tw<1)) {
		while ((isNaN(tw))||(tw>10)||(tw<1)) {
			tw = prompt('Input table width \n(input natural number ≤ 10)',8);
		}
	}*/
	var anam = 'A';//prompt('Input player 1 name','A');
	game.a.name = anam;
	var bnam = 'B';//prompt('Input player 2 name','B');
	game.b.name = bnam;
	var maint="";
	var ri = 0;
	var rj = 0;
	for (var i=1;i<=(tw*2+1);i++) {
		maint=maint + "<tr>";
		rj=0;
		if (i%2==1) {
			ri=ri+1;
		}
		for (var j=1;j<=(tw*2+1);j++) {
			
			if (i%2==1) {
				if (j%2==1) {
					maint=maint+"<td width='8' height='8' align='center' valign='middle' class='sdot'>&nbsp;</td></td>";
				} else {
					rj=rj+1;
					maint=maint+"<td width='50' height='8' align='center' valign='middle' class='pline' id='linex"+rj+ri+"' onclick='x("+rj+","+ri+")'>&nbsp;</td>";
				}
			} else {
				if (j%2==1) {
					rj=rj+1;
					maint=maint+"<td width='8' height='50' align='center' valign='middle' class='pline' id='liney"+rj+ri+"' onclick='y("+rj+","+ri+")'>&nbsp;</td>";
				} else {
					maint=maint+"<td width='50' height='50' align='center' valign='middle' class='box' id='box"+rj+ri+"'>&nbsp;</td>";
				}
			}
		}
		maint=maint+"</tr>";
	}
	game.max_score = tw*tw;
	$("#amax").val(tw*tw);
	$("#maintable").html(maint);
	var sb="Scoreboard<br />"
	$('#sboard').html(sb+"("+tw+"×"+tw+")");
	
	$('#aname').html(anam);
	$('#bname').html(bnam);
	update();
	$('.jtextfill').textfill();
}