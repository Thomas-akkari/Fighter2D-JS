var socket; 
var game;

var hitbox = hitbox || {};
var minia;

var canvas_width = window.innerWidth * window.devicePixelRatio;
var canvas_height = window.innerHeight * window.devicePixelRatio -3;

var player1_percent = 0;
var player2_percent = 0;

var jump = 0;
var stopJump = true;

var UPDATE_TICKRATE = 120;
var previousUpdateTick = Date.now();
var previousDrawTick = Date.now();
var lastDrawTick = Date.now();


var updateDelta = 0;
var simulationStep = 0;
var drawDelta;


var config = {
    type: Phaser.AUTO,
    parent: "gameDiv",
    width: 800,
    height: canvas_height,
    backgroundColor: 0x00FF00,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 700 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var gameProperties = { 
	gameWidth: 4000,
	gameHeight: 4000,
	game_elemnt: "gameDiv",
	in_game: false,
};





// Read a JSON file and send the content in the callback function
function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

var player; 
var player2; 

readTextFile("public/config/character/akuma/akuma.json", function(text){
        var data = JSON.parse(text);
        readTextFile("public/config/character/chunlee/chunlee.json", function(text){
            var data = JSON.parse(text);
            player2 = new Chunlee(data);
            game = new Phaser.Game(config);
            //window.playSfx("theme"); // Joue une thème musical en boucle (je l'ai enlevé car vite ennuyant)
        });
    player = new Akuma(data);
});











function preload (){
    this.load.image('sky', 'public/img/sky.png');
    this.load.image('ground', 'public/img/platform.png');
    
    //Akuma ressources 
    this.load.image('Akuma_minia', 'public/config/character/akuma/akuma_minia.png');
    this.load.spritesheet('Akuma_S_idle', 'public/config/character/akuma/sheets/S_idle.png', { frameWidth: 640, frameHeight: 512});
    this.load.spritesheet('Akuma_S_Walk_Forward', 'public/config/character/akuma/sheets/S_Walk_Forward.png', { frameWidth: 640, frameHeight: 512});
    this.load.spritesheet('Akuma_S_Walk_Backward', 'public/config/character/akuma/sheets/S_Walk_Backward.png', { frameWidth: 640, frameHeight: 512});
    this.load.spritesheet('Akuma_S_Jump_In_Place', 'public/config/character/akuma/sheets/S_Jump_In_Place.png', { frameWidth: 640, frameHeight: 512});
    this.load.spritesheet('Akuma_S_Crouch', 'public/config/character/akuma/sheets/S_Crouch.png', { frameWidth: 640, frameHeight: 512});
    this.load.spritesheet('Akuma_S_Kick', 'public/config/character/akuma/sheets/S_Kick.png', { frameWidth: 640, frameHeight: 512});
    this.load.spritesheet('Akuma_A_Idle', 'public/config/character/akuma/sheets/A_Idle.png', { frameWidth: 640, frameHeight: 512});
    this.load.spritesheet('Akuma_light_landing', 'public/config/character/akuma/sheets/S_landing_light.png', { frameWidth: 640, frameHeight: 512});
    this.load.spritesheet('Akuma_strong_landing', 'public/config/character/akuma/sheets/S_landing_strong.png', { frameWidth: 640, frameHeight: 512});
    
    //ChunLee Ressources
    this.load.image('Chunlee_minia', 'public/config/character/chunlee/Chunlee_minia.png');
    this.load.spritesheet('ChunLee_S_idle', 'public/config/character/chunlee/sheets/S_idle.png', { frameWidth: 640, frameHeight: 512});
    this.load.spritesheet('ChunLee_S_Walk_Forward', 'public/config/character/chunlee/sheets/S_Walk_Forward.png', { frameWidth: 640, frameHeight: 512});
    this.load.spritesheet('ChunLee_S_Walk_Backward', 'public/config/character/chunlee/sheets/S_Walk_Backward.png', { frameWidth: 640, frameHeight: 512});
    this.load.spritesheet('ChunLee_S_Jump_In_Place', 'public/config/character/chunlee/sheets/S_Jump_In_Place.png', { frameWidth: 640, frameHeight: 512});
    this.load.spritesheet('ChunLee_S_Crouch', 'public/config/character/chunlee/sheets/S_Crouch.png', { frameWidth: 640, frameHeight: 512});
    this.load.spritesheet('ChunLee_S_Kick', 'public/config/character/chunlee/sheets/S_Kick.png', { frameWidth: 640, frameHeight: 512});
    this.load.spritesheet('ChunLee_A_Idle', 'public/config/character/chunlee/sheets/A_Idle.png', { frameWidth: 640, frameHeight: 512});
    this.load.spritesheet('ChunLee_light_landing', 'public/config/character/chunlee/sheets/S_landing_light.png', { frameWidth: 640, frameHeight: 512});
    this.load.spritesheet('ChunLee_strong_landing', 'public/config/character/chunlee/sheets/S_landing_strong.png', { frameWidth: 640, frameHeight: 512});
    
}

function create (){
    console.log("client started");
    
    
    //Plateformes
    platforms = this.physics.add.staticGroup();
    platforms.create(320, 508, 'ground');
    platforms.create(480, 508, 'ground');
    
    //Personnages
    player.sprite = this.physics.add.sprite(200, 360, 'Akuma_S_idle');
    player.sprite.enableBody = true;
    player.sprite.body.setSize(55,110);
    player.sprite.body.setOffset(290,276);
    
    //Personnages
    player2.sprite = this.physics.add.sprite(500, 360, 'Akuma_S_idle');
    player2.sprite.enableBody = true;
    player2.sprite.body.setSize(55,110);
    player2.sprite.body.setOffset(290,276);
    player2.isFacingRight = false;
    
    hitbox = this.add.graphics(); 
    minia = this.add.graphics(); 
    
    //Akuma anims
    this.anims.create({
        key: 'Akuma_left',
        frames: this.anims.generateFrameNumbers('Akuma_S_Walk_Forward', { start: 0, end: -1 }),
        frameRate: 15,
        repeat: -1
    });

    this.anims.create({
        key: 'Akuma_turn',
        frames: this.anims.generateFrameNumbers('Akuma_S_idle', {start: 0, end: 6}),
        frameRate: 14,
        repeat: -1
    });

    this.anims.create({
        key: 'Akuma_right',
        frames: this.anims.generateFrameNumbers('Akuma_S_Walk_Backward', { start: 0, end: -1 }),
        frameRate: 15,
        repeat: -1
    });
    
    this.anims.create({
        key: 'Akuma_up',
        frames: this.anims.generateFrameNumbers('Akuma_S_Jump_In_Place', { start: 0, end: -1 }),
        frameRate: 12,
        repeat: 0
    });
    this.anims.create({
        key: 'Akuma_crouch',
        frames: this.anims.generateFrameNumbers('Akuma_S_Crouch', { start: 0, end: -1 }),
        frameRate: 12,
        repeat: 0
    });
    this.anims.create({
        key: 'Akuma_a_idle',
        frames: this.anims.generateFrameNumbers('Akuma_A_Idle', { start: 0, end: -1 }),
        frameRate: 12,
        repeat: 0
    });
    this.anims.create({
        key: 'Akuma_kick',
        frames: this.anims.generateFrameNumbers('Akuma_S_Kick', { start: 0, end: 6 }),
        frameRate: 14,
        repeat: 0
    });
    this.anims.create({
        key: 'Akuma_light_landing',
        frames: this.anims.generateFrameNumbers('Akuma_light_landing', { start: 0, end: -1 }),
        frameRate: 15,
        repeat: 0
    });
    this.anims.create({
        key: 'Akuma_strong_landing',
        frames: this.anims.generateFrameNumbers('Akuma_strong_landing', { start: 0, end: -1 }),
        frameRate: 15,
        repeat: 0
    });
    
    
    //Chunlee anims
    this.anims.create({
        key: 'Chunlee_left',
        frames: this.anims.generateFrameNumbers('ChunLee_S_Walk_Forward', { start: 0, end: -1 }),
        frameRate: 15,
        repeat: -1
    });

    this.anims.create({
        key: 'Chunlee_turn',
        frames: this.anims.generateFrameNumbers('ChunLee_S_idle', {start: 0, end: 6}),
        frameRate: 14,
        repeat: -1
    });

    this.anims.create({
        key: 'Chunlee_right',
        frames: this.anims.generateFrameNumbers('ChunLee_S_Walk_Backward', { start: 0, end: -1 }),
        frameRate: 15,
        repeat: -1
    });
    
    this.anims.create({
        key: 'Chunlee_up',
        frames: this.anims.generateFrameNumbers('ChunLee_S_Jump_In_Place', { start: 0, end: -1 }),
        frameRate: 12,
        repeat: 0
    });
    this.anims.create({
        key: 'Chunlee_crouch',
        frames: this.anims.generateFrameNumbers('ChunLee_S_Crouch', { start: 0, end: -1 }),
        frameRate: 12,
        repeat: 0
    });
    this.anims.create({
        key: 'Chunlee_a_idle',
        frames: this.anims.generateFrameNumbers('ChunLee_A_Idle', { start: 0, end: -1 }),
        frameRate: 12,
        repeat: 0
    });
    this.anims.create({
        key: 'Chunlee_kick',
        frames: this.anims.generateFrameNumbers('ChunLee_S_Kick', { start: 0, end: 6 }),
        frameRate: 14,
        repeat: 0
    });
    this.anims.create({
        key: 'Chunlee_light_landing',
        frames: this.anims.generateFrameNumbers('ChunLee_light_landing', { start: 0, end: -1 }),
        frameRate: 15,
        repeat: 0
    });
    this.anims.create({
        key: 'Chunlee_strong_landing',
        frames: this.anims.generateFrameNumbers('ChunLee_strong_landing', { start: 0, end: -1 }),
        frameRate: 15,
        repeat: 0
    });
    
    
    this.physics.add.collider(player.sprite, platforms);
    this.physics.add.collider(player2.sprite, platforms);
    
    //Clavier
    cursors = this.input.keyboard.createCursorKeys();
    zqsd = this.input.keyboard.addKeys( { 'up': Phaser.Input.Keyboard.KeyCodes.Z, 'down': Phaser.Input.Keyboard.KeyCodes.S, 'left': Phaser.Input.Keyboard.KeyCodes.Q, 'right': Phaser.Input.Keyboard.KeyCodes.D } );    
    
    
    player1_minia = this.add.sprite(250,580,player.constructor.name+"_minia").setScale(0.3)
    player2_minia = this.add.sprite(550,580,player2.constructor.name+"_minia").setScale(0.3)
    
    player1_percent = this.add.text(230,620,'O%',{ fontSize: '32px', fill: '#fff' })
    player2_percent = this.add.text(530,620,'O%',{ fontSize: '32px', fill: '#fff' })
    
    
    /*socket = io.connect("http://localhost:2000/");
    socket.on("connect", onSocketConnected);
    socket.on("new_enemyPlayer", onNewPlayer);
    socket.on("ennemy_move", onEnnemyMove);
    socket.on("remove_player", removePlayer);*/
}

function update (){
   var a = Date.now();
    if (a >= previousUpdateTick + 1000 / UPDATE_TICKRATE) {
        updateDelta = (a - previousUpdateTick) / 1000;
        previousUpdateTick = a;
        simulationStep++;
        gameLoop();
    }
    previousDrawTick = lastDrawTick;
    lastDrawTick = a;
    drawDelta = lastDrawTick - previousDrawTick;
    draw();
    
}

function gameLoop(){
    var action = "turn";
    
    if (zqsd.left.isDown || cursors.left.isDown ) 
    {
        action = "left";
    }
    else if(cursors.down.isDown || zqsd.down.isDown){
        action = "kick";
    }
    else if (cursors.right.isDown || zqsd.right.isDown)  
    {
        action = "right";
    }
    if ( (cursors.up.isDown || zqsd.up.isDown)){
        action = "up"
    }
    /*if (stopJump == true && (cursors.up.isDown || zqsd.up.isDown) && jump < 2)
    {
        action = "up";
        stopJump = false;
        jump++;
    }
    if(stopJump == false && ((cursors.up.isUp && zqsd.up.isUp) || player.sprite.body.touching.down)){
        stopJump = true;
    }
    if(player.sprite.body.touching.down){
        jump = 0;
    }else{
        if(jump == 0){
            jump = 1;
        }
        
    }*/
    
    
    
    player.update(action);
    player2.update("turn");
    
    checkHit(player,player2);
    
    //socket.emit("move_player", {id: player.id, x: player.x, y: player.y, action: action});
    checkDeath();
}

function checkDeath(){
    if(player.sprite.body.y >= this.canvas_height ){
        console.log("dead");
        player.sprite.body.x = 200
        player.sprite.body.y = 360
        player.percent = 0
    }
    
    if(player2.sprite.body.y >= this.canvas_height ){
        console.log("dead");
        player2.sprite.body.x = 200
        player2.sprite.body.y = 360
        player2.percent = 0
    }
}

function draw(){
    hitbox.clear();
    
    player.hitbox(hitbox);
    player1_percent.setText(player.percent+"%");
    
    player2.hitbox(hitbox);
    player2_percent.setText(player2.percent+"%");
}

/* Not used anymore, was there for the server 

function findPlayerById(idc){
    var res = null;
    ennemies.children.iterate(function (child) {
        if(child.id == idc){
            res = child;
        }
    });
    return res;
}

function onNewPlayer(data){
    console.log("new ennemy");
    
}

function onEnnemyMove(data){
	var movePlayer = findPlayerById(data.id); 
	if (movePlayer == null) {
		return;
	}
    movePlayer.anims.play(data.action, true);
	movePlayer.x = data.x; 
	movePlayer.y = data.y; 
}

function removePlayer(data){
    var removeP = findPlayerById(data.id);
    if(removeP != null){
        ennemies.remove(removeP)
        removeP.destroy();
    }
}
//call this function when the player connects to the server.
function onSocketConnected(data) {
	console.log("Connected to server");
    player.id = socket.id;
    socket.emit("new_player",{x: player.x, y: player.y});
}*/

function swapPlayers(){
    var tmp = player 
    player = player2 
    player2 = tmp
}
