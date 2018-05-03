var express = require('express');
var app = express();
var serv = require('http').createServer(app); 
var io = require('socket.io')(serv);


app.get('/',function(req, res, next) {
	res.sendFile(__dirname + '/public/index.html');
});
app.use('/public',express.static(__dirname + '/public'));

//listen on port 2000
serv.listen(2000);
console.log("Server started.");


//Liste des joueurs
var playerLst = [];
var Player = function(startX, startY){
    this.x = startX;
    this.y = startY;
}

function findPlayerIndById(idc){
    var res = null;
    
    for(var i = 0; i < playerLst.length; i++){
        if(playerLst[i].id == idc){
            res = i
        }
    }
    return res;
}

//Called when there's a new Player
function onNewPlayer(data){
    console.log("New Player detected, id="+this.id);
	//new player instance
    
	var newPlayer = new Player(data.x, data.y);
	newPlayer.id = this.id; 	
	
    //information to be sent to all clients except sender
	var current_info = {
		id: newPlayer.id, 
		x: newPlayer.x,
		y: newPlayer.y
	}; 
	
	//send to the new player about everyone who is already connected. 	
	for (i = 0; i < playerLst.length; i++) {
		existingPlayer = playerLst[i];
		var player_info = {
			id: existingPlayer.id,
			x: existingPlayer.x,
			y: existingPlayer.y			
		};
		console.log("pushing player");
		//send message to the sender-client only
		this.emit("new_enemyPlayer", player_info);
	}
	
	//send message to every connected client except the sender
	this.broadcast.emit('new_enemyPlayer', current_info);
	console.log("");
	playerLst.push(newPlayer); 
}

function removePlayer(data){
    //Info console
    console.log("deconnexion du joueur : "+this.id);
    
    //On prévient les autres joueurs de la déconenxion
    var player_info = {
        id: this.id,
        x: data.x,
        y: data.y	
    }
    this.broadcast.emit('remove_player',player_info);
    
    //On retire le joueur du serveur
    var removeP = findPlayerIndById(this.id);
    if(removeP != null){
        playerLst.splice(removeP,1);
    }
}

function movePlayer(data){
    //Envoie la nouvelle position aux autres joueurs
    this.broadcast.emit("ennemy_move",data);
    /*playerLst[findPlayerIndById(data.id)].x = data.x;
    playerLst[findPlayerIndById(data.id)].y = data.y;*/
}
// listen for a connection request from any client
io.sockets.on('connection', function(socket){
    
    socket.on("new_player", onNewPlayer);
    socket.on("move_player", movePlayer);
    socket.on("disconnect", removePlayer);
    console.log("");
});
