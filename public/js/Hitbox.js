function Hitbox(config){
    
    this.x = config.x;
    this.y = config.y;
    
    this.width = config.width;
    this.height = config.height;;
    
    this.priority = config.priority; // Lower is better
    this.base_damage = config.base_damage;
    this.angle = config.angle;
    this.BKB = config.BKB;
    this.WBKB = config.WBKB;
    this.KBG = config.KBG;
    
}