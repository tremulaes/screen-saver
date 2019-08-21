var inc = 0.01;
var scl = 20;
var cols, rows;
var zoff = 0;
var flowfield;
var particles = [];
var color;
var colorFlowfield;

function setup() {
  createCanvas(windowWidth, windowHeight);
  cols = floor(width/scl);
  rows = floor(height/scl);
  flowfield = new Array(cols * rows);
	colorFlowfield = new Array(cols * rows);
  for(var i = 0; i < 1200; i++){
    particles[i] = new Particle();
  }
	color = new Color();
  background(20);
}

function draw() {
  var yoff = 0;
  for (var y = 0; y < rows; y++) {
    var xoff = 0;
    for (var x = 0; x < cols; x++) {
      var index = x + y * cols;
      var angle = noise(xoff, yoff, zoff) * TWO_PI * 4;
      var v = p5.Vector.fromAngle(angle);
      v.setMag(0.2);
      flowfield[index] = v;
      xoff += inc;
    }
    yoff += inc;
    zoff += 0.0005;
  }
	color.update();
  for(var i = 0; i < particles.length; i++){
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show(color);
  }
}

function Color(){
	this.R = random(20, 255);
	this.G = random(20, 255);
	this.B = random(20, 255);
	this.minSpeed = .2;
	this.maxSpeed = .8;
	this.Rspeed = (random(1) > .5 ? 1 : -1) * random(this.minSpeed, this.maxSpeed);
	this.Gspeed = (random(1) > .5 ? 1 : -1) * random(this.minSpeed, this.maxSpeed);
	this.Bspeed = (random(1) > .5 ? 1 : -1) * random(this.minSpeed, this.maxSpeed);

	this.update = function(){
		this.Rspeed = ((this.R += this.Rspeed) > 255 || (this.R < 20)) ? -this.Rspeed : this.Rspeed;
    this.Gspeed = ((this.G += this.Gspeed) > 255 || (this.G < 20)) ? -this.Gspeed : this.Gspeed;
    this.Bspeed = ((this.B += this.Bspeed) > 255 || (this.B < 20)) ? -this.Bspeed : this.Bspeed;
	};
};

function Particle(){
	this.pos = createVector(random(-20,0),random(0, height/2-100));
	this.vel = createVector(0,0);
  this.acc = createVector(0,0);
  this.prevPos = this.pos.copy();
  this.maxspeed = 5;
	this.transparency = random(15, 35);

  this.update = function(){
    this.vel.add(this.acc);
    this.vel.limit(this.maxspeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  this.follow = function(vectors){
    var x = floor(this.pos.x / scl);
    var y = floor(this.pos.y / scl);
    var index = x + y * cols;
    var force = vectors[index];
    this.applyForce(force);
  }

  this.applyForce = function(force){
    this.acc.add(force);
  }

  this.show = function(color){
		noStroke();
    stroke(color.R, color.B, color.G, this.transparency);
    strokeWeight(1);
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    this.updatePrev();
  }

  this.updatePrev = function(){
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }

  this.edges = function(){
    if(this.pos.x > width) {
      this.pos.x = 0;
      this.updatePrev();
    }
    if(this.pos.x < 0) {
      this.pos.x = width;
      this.updatePrev();
    }
    if(this.pos.y > height) {
      this.pos.y = 0;
      this.updatePrev();
    }
    if(this.pos.y < 0) {
      this.pos.y = height;
      this.updatePrev();
    }
  }
}
