function detecteHit(player1,player2){ //player1 est toujours l'attaquant, player2 le défenseur
    var exist_collide = false;
    
    var p1_hitboxes = player1.moveset[player1.current_action].frames[player1.sprite.anims.currentFrame.index-1].hitboxes 
    var p2_hurtboxes = [{"x": player2.sprite.body.x, "y": player2.sprite.body.y, "width": player2.sprite.body.width, "height": player2.sprite.body.height}];
    
    
    var hittingBoxes = [];
    
    for(var hitboxid in p1_hitboxes){
        for(var hurtbox in p2_hurtboxes){
            
            //Hitbox
                //Récupération
            var hitbox = p1_hitboxes[hitboxid];
                //Modification
            
            
            exist_collide = DoBoxesIntersect(player1.isFacingRight, player1.sprite, hitbox, p2_hurtboxes[hurtbox])
            if(exist_collide == true){
                hittingBoxes.push({hitbox,player2});
            }
        }
    }
    
    if(hittingBoxes.length > 0){
        var lowest_prio_id = 0
        var lowest_prio = hittingBoxes[0].hitbox.priority;
    
        for(var i = 1; i < hittingBoxes.length; i++){
            if(hittingBoxes[i].hitbox.priority < lowest_prio){
                lowest_prio = hittingBoxes[i].hitbox.priority;
                lowest_prio_id = i;
            }
        }
        hittingBoxes = hittingBoxes[lowest_prio_id].hitbox;
    }
    
    
    return hittingBoxes;
}

function DoBoxesIntersect(facingRight ,position_a, a, b) {
    res = false;
    if(facingRight){
        res = (Math.abs((position_a.x+position_a.width/2 - a.x - a.width) - b.x) * 2 < (a.width + b.width)) && ((Math.abs((a.y+position_a.y-position_a.height/2) - b.y) * 2) < (a.height + b.height));
    }else{
        res = (Math.abs((a.x+position_a.x-position_a.width/2) - b.x) * 2 < (a.width + b.width)) && ((Math.abs((a.y+position_a.y-position_a.height/2) - b.y) * 2) < (a.height + b.height));
    }
    return res;
}

function checkHit(player1,player2){
    var p1_is_left_side = (player1.sprite.body.x < player2.sprite.body.x);
    
    if(player1.isAttacking()){
        var hit = detecteHit(player1,player2)
        if(hit != 0){
            player2.applyDamage(hit, p1_is_left_side);
        }
    }
    
    if(player2.isAttacking()){
        var hit = detecteHit(player2,player1)
        if(hit != 0){
            player1.applyDamage(hit,!   (p1_is_left_side));
        }
    }
}