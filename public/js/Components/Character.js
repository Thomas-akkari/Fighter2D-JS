function Character(config){
    
    /**************\
        Attributs
    \**************/
    
    //Air attributs
    this.air_acceleration = config.air_acceleration*200;
    this.air_friction = config.air_friction;
    this.air_speed = config.air_speed*200;
    this.fall_speed = config.fall_speed;
    this.gravity = config.gravity;
    
    //Jumps
    this.short_hop = config.short_hop*20;
    this.full_hop = config.full_hop;
    this.aerial_hop = config.aerial_hop;
    this.jump_squat = config.jump_squat;
    
    //Ledge Options
    this.get_up = config.get_up;
    this.ledge_jump = config.ledge_jump;
    this.ledge_roll = config.ledge_roll;
    
    //On Stage
    this.roll = config.roll;
    this.run_speed = config.run_speed;
    this.walk_speed = config.walk_speed*200;
    this.spotdodge = config.spotdodge;
    this.traction = config.traction*200;
    
    //Weight
    this.weight = config.weight;
    
    //MoveSet and Sprite
    this.sprites = [];
    this.moveset = [];
    
    //Meta
    this.current_action = "turn";
    this.current_frame = 0;
    this.can_act = true;
    this.percent = 0;
    this.isFacingRight = true;
    
    /**************\
         Méthode
    \**************/
    
    //Called at creation, init the object
    this.init = function(config){
        this.initMoveset(config.moveset);
        this.initSprites(config.sprites);
    }
    this.initMoveset = function(moveset){
        //Itère sur chaque attaque disponible
        for(var moveKey in moveset){
            //Récupère l'attaque
            var move = config.moveset[moveKey];
            this.moveset[moveKey] = new Move(move)
        }
    }
    this.initSprites = function(sprites){
       
    }
    
    //Update facing direction
    this.updateFacingDirection = function(action){
        if(this.can_act && this.sprite.body.touching.down){
             if(action == "left" && this.isFacingRight){
                 this.isFacingRight = false;
             }else if(action == "right" && !this.isFacingRight){
                 this.isFacingRight = true;
             }
        }
    }
    
    //Getters
    this.isAttacking = function(){
        return this.moveset.hasOwnProperty(this.current_action);
    }
    
    this.isLanding = function(){
        return (this.sprite.body.touching.down && !this.sprite.body.wasTouching.down)
    }
    
    //print all hitboxes/hurtboxes
    this.hitbox = function(game){
        
        //Print the body
        /*game.fillStyle(0xff0000,0.6);
        game.fillRect(this.sprite.body.x, this.sprite.body.y, this.sprite.body.width, this.sprite.body.height);*/
        
        //If i'm doing a move
        if(this.isAttacking()){
            game.fillStyle(0xffff00,0.6);
            var hit_list = this.moveset[this.current_action].frames[this.sprite.anims.currentFrame.index-1].hitboxes;
            for(var hitbox_ind in hit_list){
                var hitbox = hit_list[hitbox_ind]
                if(!this.isFacingRight){
                    game.fillRect(this.sprite.x-this.sprite.width/2+hitbox.x, this.sprite.y-this.sprite.height/2+hitbox.y, hitbox.width, hitbox.height);
                }else{
                    game.fillRect(this.sprite.x+this.sprite.width/2-hitbox.x-hitbox.width, this.sprite.y-this.sprite.height/2+hitbox.y, hitbox.width, hitbox.height);
                }
            }
        }
    }
    
    
    
    
    
    
    //Update the sprite 
    this.update = function(action){
        
        //Si le personnage atterit
        if(this.isLanding()){
            if(this.can_act == true){
                this.current_action = "light_landing"
                this.can_act = false;
            }else{
                this.current_action = "strong_landing"
                this.can_act = false;
            }
        }
        
        //Le personnage se déplace
        this.move(action);
        this.updateFacingDirection(action);
        
        //Si le personnage regarde à droite, on inverse le sprite
        if(this.isFacingRight){
            this.sprite.setFlip(true,false);
            if(action =="left"|| action == "right"){
                action = action == "left"? "right":"left";
            }
        }else{
            this.sprite.setFlip(false,false);
        }
        
        
        //Si le personnage peut effectuer une action, on la considère
        if(this.can_act == true){
            //Si l'action est une attaque ou un déplacement (pas de idle donc, pour éviter de cancel toutes les attaques
            // avec l'idle animation)
            if(this.sprite.body.touching.down){
                if(isDirection(action) || this.moveset.hasOwnProperty(action) || (isDirection(this.current_action) && action == "turn")){
                    //Si l'action est la même attaque que précedemment, on restart l'animation
                    if(action == this.current_action && this.isAttacking()){
                        this.sprite.anims.restart();
                    }
                    //On affecte l'animation
                    this.current_action = action;
                    if(this.isAttacking()){
                        this.can_act = false;
                    }
                }
            }else{
                if(this.moveset.hasOwnProperty(action)){
                    //Si l'action est la même attaque que précedemment, on restart l'animation
                    if(action == this.current_action && this.isAttacking()){
                        this.sprite.anims.restart();
                    }
                    //On affecte l'animation
                    this.current_action = action;
                    if(this.isAttacking()){
                        this.can_act = false;
                    }
                }
            }
            
        }
        
        //Play the current animation
        this.sprite.anims.play(this.constructor.name+"_"+this.current_action, true);
        
        
        //On Vérifie si l'action en cours est terminée || Doit etre fait après anims.play
        if(this.sprite != null && this.sprite.anims != null && this.sprite.anims.currentFrame != null){
            
            if(this.sprite.anims.currentFrame.textureFrame >= this.sprite.anims.currentAnim.frames.length-1){
                this.can_act = true
                if(this.sprite.body.touching.down){
                    this.current_action = "turn"
                }else{
                    this.current_action ="a_idle"
                }
            }
        }
        
        //On vérifie si l'action est cancellable (première condition) ou terminer (deuxième condition)
        // this.moveset.hasOwnProperty(this.current_action) est utilisé ici car le moveset ne contient pas les déplacements
        if(this.isAttacking()){
            if(this.sprite.anims.currentFrame.textureFrame >= this.moveset[this.current_action].FAF){
                this.can_act = true;
            }
        }
        
    }
    
    
    //Gère les déplacements
    this.move = function(action){
        //Si le joueur peut agir
        if(this.can_act){
            //On vérifie que l'action est un déplacement
            if(isDirection(action)){
                /*
                    Au sol : Affecter par 
                                -La traction
                                -Vitesse de marche/course
                    En l'air: Affecter par
                                -L'accélération aérienne
                                -vitesse aérienne maximale
                                -Gravité
                                -La friction de l'air
                */
                
                
                // Si je suis au sol
                if(this.sprite.body.touching.down){
                    if(action == "left"){
                        this.sprite.body.setVelocityX(-this.walk_speed);
                    }else if(action == "right"){
                        this.sprite.body.setVelocityX(this.walk_speed);
                    }
                    else if(action =="up"){
                        this.sprite.body.setVelocityY(-this.short_hop);
                    }
                    
                // Si je suis en l'air
                }else{
                    if(action == "left"){
                        this.sprite.body.setVelocityX(this.sprite.body.velocity.x-this.air_acceleration);
                    }else if(action == "right"){
                        this.sprite.body.setVelocityX(this.sprite.body.velocity.x+this.air_acceleration);
                    }
                    
                    // On cap la vitesse
                    if(Math.abs(this.sprite.body.velocity.x) > this.air_speed){
                        this.sprite.body.setVelocityX(this.sprite.body.velocity.x>0?this.air_speed:-this.air_speed)
                    }
                }
            }
        }
        
        // On applique la traction au sol
        if(this.sprite.body.touching.down){
            if(Math.abs(this.sprite.body.velocity.x) < this.traction){
                this.sprite.body.setVelocityX(0);
            }else{
                this.sprite.body.setVelocityX(this.sprite.body.velocity.x - (this.sprite.body.velocity.x > 0 ? this.traction : -this.traction));
            }  
        
        // On applique la friction en l'air
        }else{
            this.sprite.body.setVelocityY(this.sprite.body.velocity.y - (this.sprite.body.velocity.y > 0 ? this.air_friction : - this.air_friction));
        }
        
    }
    
    //Apply knockback and damga
    this.applyDamage = function(hit,side_hit){
        //Calcul du Knockback
        var knockback = ((((((this.percent+hit.base_damage)/10+(((this.percent+hit.base_damage)*hit.base_damage*(1*0.3))/20))*1.4*(200/(this.weight+100)))+18)*(hit.KBG/100))+hit.BKB)*1
        
        //Calcul du vecteur de push
        var push = new Victor(knockback,0);
        var angle = hit.angle       //Angle de propulsion
        if(side_hit){    //Inverser l'angle selon la direction
            angle = 180 - angle;
        }
        
        push.rotateByDeg(angle);
        
        //Application
        this.sprite.body.setVelocity(push.x,-push.y)
        this.percent += hit.base_damage
    }
    
    /***************************\
         Init the character
    \***************************/
    this.init(config);
}

function isDirection(action){
    return action == "left" || action == "right" || action == "up" || action == "down" || action == "rleft" || action == "rleft";
}
