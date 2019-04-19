var game;
var FPS = 60;
var maxScore = 0;

var images = {};

var speed = function(fps){
    FPS = parseInt(fps);
}

var loadImages = function(sources, callback){
    var num = 0;
    var loaded = 0;
    var imgs = {};
    for(var i in sources){
        num++;
        imgs[i] = new Image();
        imgs[i].src = sources[i];
        imgs[i].onload = function(){
            loaded++;
            if(loaded == num){
                callback(imgs);
            }
        }
    }
}

var Bird = function(json){
    this.x = 80;
    this.y = 250;
    this.width = 40;
    this.height = 30;

    this.alive = true;
    this.gravity = 0;
    this.velocity = 0.3;
    this.jump = -6;

    this.init(json);
}

Bird.prototype.init = function(json){
    for(var i in json){
        this[i] = json[i];
    }
}

Bird.prototype.init = function(json){
	for(var i in json){
		this[i] = json[i];
	}
}

Bird.prototype.flap = function(){
	this.gravity = this.jump;
}

Bird.prototype.update = function(){
	this.gravity += this.velocity;
    this.y += this.gravity;
    //console.log(this.y);
}

Bird.prototype.isDead = function(height, pipes){
	if(this.y >= height || this.y + this.height <= 0){
		return true;
	}
	for(var i in pipes){
		if(!(
			this.x > pipes[i].x + pipes[i].width ||
			this.x + this.width < pipes[i].x || 
			this.y > pipes[i].y + pipes[i].height ||
			this.y + this.height < pipes[i].y
			)){
			return true;
        }
    }
}

var Pipe = function(json){
	this.x = 0;
	this.y = 0;
	this.width = 50;
	this.height = 40;
	this.speed = 3;

	this.init(json);
}

Pipe.prototype.init = function(json){
	for(var i in json){
		this[i] = json[i];
	}
}

Pipe.prototype.update = function(){
	this.x -= this.speed;
}

Pipe.prototype.isOut = function(){
	if(this.x + this.width < 0){
		return true;
	}
}

var Game = function(){
	this.pipes = [];
	this.bird = [];
	this.score = 0;
	this.canvas = document.querySelector("#flappy");
	this.ctx = this.canvas.getContext("2d");
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	this.spawnInterval = 90;
	this.interval = 0;
	this.backgroundSpeed = 0.5;
	this.backgroundx = 0;
    this.maxScore = 0;
}

Game.prototype.start = function(){
	this.interval = 0;
	this.score = 0;
	this.pipes = [];
    this.bird = new Bird();
    this.canvas.addEventListener("mousedown",doMouseDown,false);
}

Game.prototype.update = function(){
	this.backgroundx += this.backgroundSpeed;
	if(this.bird.length > 0){
		for(var i = 0; i < this.pipes.length; i+=2){
			if(this.pipes[i].x + this.pipes[i].width > this.birds[0].x){
				nextHoll = this.pipes[i].height/this.height;
				break;
			}
		}
	}

    if(this.bird.alive){
        this.bird.update();
        if(this.bird.isDead(this.height, this.pipes)){
            this.bird.alive = false;
            if(this.isItEnd()){
                this.start();
            }
        }
    }

	for(var i = 0; i < this.pipes.length; i++){
		this.pipes[i].update();
		if(this.pipes[i].isOut()){
			this.pipes.splice(i, 1);
			i--;
		}
	}

	if(this.interval == 0){
		var deltaBord = 50;
		var pipeHoll = 120;
		var hollPosition = Math.round(Math.random() * (this.height - deltaBord * 2 - pipeHoll)) +  deltaBord;
		this.pipes.push(new Pipe({x:this.width, y:0, height:hollPosition}));
		this.pipes.push(new Pipe({x:this.width, y:hollPosition+pipeHoll, height:this.height}));
	}

	this.interval++;
	if(this.interval == this.spawnInterval){
		this.interval = 0;
	}

	this.score++;
	this.maxScore = (this.score > this.maxScore) ? this.score : this.maxScore;
	var self = this;

	setTimeout(function(){
		self.update();
	}, 1000/FPS);
}

Game.prototype.isItEnd = function(){
    if(this.bird.alive){
        return false;
    }
	return true;
}

Game.prototype.display = function(){
	this.ctx.clearRect(0, 0, this.width, this.height);
	for(var i = 0; i < Math.ceil(this.width / images.background.width) + 1; i++){
		this.ctx.drawImage(images.background, i * images.background.width - Math.floor(this.backgroundx%images.background.width), 0)
	}

	for(var i in this.pipes){
		if(i%2 == 0){
			this.ctx.drawImage(images.pipetop, this.pipes[i].x, this.pipes[i].y + this.pipes[i].height - images.pipetop.height, this.pipes[i].width, images.pipetop.height);
		}else{
			this.ctx.drawImage(images.pipebottom, this.pipes[i].x, this.pipes[i].y, this.pipes[i].width, images.pipetop.height);
		}
	}

	this.ctx.fillStyle = "#FFC600";
	this.ctx.strokeStyle = "#CE9E00";
    if(this.bird.alive){
        this.ctx.save(); 
        this.ctx.translate(this.bird.x + this.bird.width/2, this.bird.y + this.bird.height/2);
        this.ctx.rotate(Math.PI/2 * this.bird.gravity/20);
        this.ctx.drawImage(images.bird, -this.bird.width/2, -this.bird.height/2, this.bird.width, this.bird.height);
        this.ctx.restore();
    }

	this.ctx.fillStyle = "white";
	this.ctx.font="20px Oswald, sans-serif";
	this.ctx.fillText("Score : "+ this.score, 10, 25);
	this.ctx.fillText("Max Score : "+this.maxScore, 10, 50);

	var self = this;
	requestAnimationFrame(function(){
		self.display();
	});
}

function doMouseDown(){
    game.bird.flap();
}

function GameStart(){
	var sprites = {
		bird:"https://raw.githubusercontent.com/imuncle/Funny/master/Flappy/imgs/bird.png",
		background:"https://raw.githubusercontent.com/imuncle/Funny/master/Flappy//imgs/background.png",
		pipetop:"https://raw.githubusercontent.com/imuncle/Funny/master/Flappy//imgs/pipetop.png",
		pipebottom:"https://raw.githubusercontent.com/imuncle/Funny/master/Flappy//imgs/pipebottom.png"
	}

	var start = function(){
		game = new Game();
		game.start();
		game.update();
		game.display();
	}

	loadImages(sprites, function(imgs){
		images = imgs;
		start();
	})
}

GameStart();