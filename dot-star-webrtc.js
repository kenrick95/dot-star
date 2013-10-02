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

/*
var localvideo = document.getElementById("local");
var remotevideo = document.getElementById("remote");


function bindStream(stream, element) {
	// I still dunno what this is
  if ("mozSrcObject" in element) {
    element.mozSrcObject = stream;
  } else {
    element.src = webkitURL.createObjectURL(stream);
  }
  element.play();
};
*/

// Initialization
var brokerSession = null;
var brokerUrl = 'https://mdsw.ch:8080';
var hosting = true;
var options;
var connected_name = Array();
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
  
  game.message = "Peer connected";
  update();
  game.message = "It's " + game.a.name + "'s turn";
  update();
  
  connection.ondisconnect = function() {
	if (connected_name[connection.id] == null)
    	log(null,'disconnected: ' + connection.id)
	else
    	log(null,'disconnected: ' + connected_name[connection.id] + ' ['+ connection.id +']');
    delete connections[connection.id];
	connected--;
	game.message = "Game Over: Peer disconnected";
	update();
  };
  connection.onerror = function(error) {
    console.error(error);
  };
  
  
  //bindStream(connection.streams['local'], localvideo);
  //bindStream(connection.streams['remote'], remotevideo);

  connection.onmessage = function(label, msg) {
	  //var msg_parsed = msg.data.split('*');
	  console.log(msg.data);
	  msg_data = JSON.parse(msg.data);
	  console.log(msg_data);
	  
	  msg_data_data  = msg_data.msg;
	  if (connected_name[connection.id] == null) {
	  	log(null,  "'" + connection.id + "' is '" + msg_data.name + "'");
	  	connected_name[connection.id] = msg_data.name;
		
	  } else if (connected_name[connection.id] != msg_data.name) {
	  	log(null,  "'" + connected_name[connection.id] + " has changed name to '" + msg_data.name + "'");
	  	connected_name[connection.id] = msg_data.name;
	  }
	  
	  game.turn = msg_data.msg.turn;
	  if (name == "b") {
		game.a.name = msg_data.msg.a.name;	
	  } else if (name == "a") {
		game.b.name = msg_data.msg.b.name;	
	  }
	  game.move = msg_data.msg.move;

	  log(connected_name[connection.id], JSON.stringify(msg_data_data));
	  if (game.move.type == "x")
	  {
		  x(game.move.x, game.move.y, true);
	  }
	  else if (game.move.type == "y")
	  {
		  y(game.move.x, game.move.y, true);
	  }
  };
  /*
  var buff = new Uint8Array([1, 2, 3, 4]);
  connection.send('reliable', buff.buffer);
  */
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

    //var div = document.getElementById('host');
    //div.innerHTML = '<a href="' + url.join('?') + '">connect</a>';
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
	log(null, "Peer-to-peer Dots and Boxes game with WebRTC; works in Firefox 25");
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

function send() {
    
	
	var date = new Date();
	time = date.toISOString();
	
	send_info = {
		turn: name,
		a: {
			name : game.a.name
		},
		b: {
			name : game.b.name
		},
		move: game.move
	};
	
    var ids = Object.keys(connections);
	var send_msg = '{ "name": "' + name + '",'
				 + '  "msg" : ' + JSON.stringify(send_info) + ','
				 + '  "time" : "' + time + '" }';
				 
    log("Me", JSON.stringify(send_info), time);
    ids.forEach(function(id) {
      connections[id].send('reliable', send_msg);
    });

}
