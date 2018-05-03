var canJump = {
    max_jump: 3,
    current_jump: 0,
    can_jump: true,
    checkJump: function(action){
        if(this.sprite.body.touching.down){ 
            this.current_jump = 0; 
        }else{ 
            if(this.current_jump == 0){
                this.current_jump = 1;
            }
        }
        if(action != "up"){ 
            this.can_jump = true 
        }
        if(action =="up" && this.can_jump && (this.current_jump < this.max_jump)){
            this.sprite.body.setVelocityY(-this.short_hop);
            this.can_jump = false;
            if(this.current_jump>0){
                this.sprite.anims.restart()
            }
            this.current_jump += 1;
        }
    }
}