class Dog{
    constructor(){
        this.sound = "wouf"
    }
    talk(){
        console.log(this);
        console.log(this.sound);
    }
}

const balou = new Dog()

balou.talk()

$("#test").click(balou.talk)