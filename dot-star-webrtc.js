function log(who, msg, time) {
	
	if (time == null)
	{
		var date = new Date();
		time = date.toISOString();
	}
	readable_date = new Date(time);
	readable_time = readable_date.toUTCString();
	
	if (who == null) {
		who = "Information";
	}
	format_msg = ">> ";
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

// Initialization
var brokerSession = null;
var brokerUrl = 'https://mdsw.ch:8080';
var hosting = true;
var options;
var name;
var msg_before = "";
var connected = 0;

// If "client", connect to "host"
if(window.location.search) {
	var params = window.location.search.substring(1).split('&');
	for(var i = 0; i < params.length; ++ i) {
		if(params[i].match('^webrtc-session')) {
			brokerSession = params[i].split('=')[1];
			hosting = false;
		} else if(params[i].match('^webrtc-broker')) {
			brokerUrl = params[i].split('=')[1];
		}
	}
}

console.log('broker', brokerUrl);
var peer = new Peer(brokerUrl, {video: false, audio: false});
window.connections = {};
peer.onconnection = function(connection) {
	
	log(null, 'connected: ' + connection.id);
	connections[connection.id] = connection;
	connected ++;
	
	//game.message = "Peer connected";
	//update();
	game.message = "It's " + game.a.name + "'s turn";
	update();
	//send(1);
	
	connection.ondisconnect = function() {
		log(null,'disconnected: ' + connection.id);
		delete connections[connection.id];
		connected--;
		game.message = "Game Over: Peer disconnected";
		update();
	};
	connection.onerror = function(error) {
		console.error(error);
	};
	
	
	connection.onmessage = function(label, msg) {
		msg_data = JSON.parse(msg.data);
		msg_data_data  = msg_data.msg;
		
		//if (msg_data.msg.init) {
			game.turn = msg_data.msg.turn;
			//game.tw = msg_data.msg.tw;
			if (name == "b") {
				game.a.name = msg_data.msg.a.name;	
			} else if (name == "a") {
				game.b.name = msg_data.msg.b.name;	
			}
		//} else {
			game.move = msg_data.msg.move;
		//}
		
		log(game.turn, JSON.stringify(msg_data_data));
		if (game.move.type == "x")
		{
			x(game.move.x, game.move.y, true);
		}
		else if (game.move.type == "y")
		{
			y(game.move.x, game.move.y, true);
		}
	};
};
peer.onerror = function(error) {
	console.error(error);
};


if(hosting) { // host
	console.log('hosting');
	peer.listen({metadata:{name:'data-demo'}});
	peer.onroute = function(route) {
		var url = window.location.toString().split('?');
		url[1] = url[1] || '';
		var params = url[1].split('&');
		params.push('webrtc-session=' + route);
		url[1] = params.join('&');
		
		log(null, 'Send <a href="' + url.join('?') + '">this link</a> to other peer so that he/she can connect to you');
		game.message = 'Send <a href="' + url.join('?') + '">this link</a> to other peer';
		update();
	}
	name = "a";
} else { // client
	peer.connect(brokerSession);
	name = "b";
}

// onload
window.onload = function() {
	log(null, "Peer-to-peer Dots and Boxes game with WebRTC; works in Firefox 24");
};

// disconnect before unload
window.onbeforeunload = function() {
	var ids = Object.keys(connections);
	ids.forEach(function(id) {
		connections[id].close();
	});
	peer.close();
};

function scroll_bottom() {
	// Scroll to bottom of #log
	var log_area = document.getElementById("log");
	log_area.scrollTop = log_area.scrollHeight;
}

function send(init) {
    
	
	var date = new Date();
	time = date.toISOString();
	
	if (init == null)
	{
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
	}
	else if (init == 1)
	{
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
	
    var ids = Object.keys(connections);
	var send_msg = '{ "name": "' + name + '",'
				 + '  "msg" : ' + JSON.stringify(send_info) + ','
				 + '  "time" : "' + time + '" }';
				 
    log("Me", JSON.stringify(send_info), time);
    ids.forEach(function(id) {
		connections[id].send('reliable', send_msg);
    });

}
