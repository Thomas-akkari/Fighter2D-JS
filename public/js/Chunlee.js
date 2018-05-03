 function Chunlee(config){
    //Character.call(this,config)
    Object.assign(this,new Character(config),canJump)
     
    //Update the update function
    var fnCode = this.update.toString() ;
    fnCode = fnCode.replace(/\}$/,"this.checkJump(action);\n}")  
    this.update = window.eval( "("+fnCode+")" )
 }