var nbCircles = 64;
var circles = [];
var myColor;
var rMax;
var dMin;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);
  fill(0, 60);
  rMax = max(width, height) / 1.5;
  dMin = max(width, height) / 3.5;

  for (var i = 0; i < nbCircles; i++) {
    circles.push(new Circle(
      random(rMax),
      random(-width/3, width/3),
      random(-height/3, height/3)
    ));
  }
  myColor = new Color();
}

function draw() {
  noStroke();
  rect(0, 0, width, height);
  translate(width/2, height/2);
  myColor.update();
  for (var j = 0; j < nbCircles; j++) {
    circles[j].update();
    for (var i = j+1; i < nbCircles; i++) {
      connect(circles[j], circles[i]);
    }
  }
}

function connect(c1, c2) {
  var d, x1, y1, x2, y2, r1 = c1.radius, r2 = c2.radius;
  var rCoeff = map(min(abs(r1), abs(r2)), 0, rMax, .08, 1);
  var n1 = c1.nbLines, n2 = c2.nbLines;
  for (var i = 0; i < n1; i++) {
    x1 = c1.x + r1 * cos(i * TWO_PI / n1 + c1.theta);
    y1 = c1.y + r1 * sin(i * TWO_PI / n1 + c1.theta);
    for (var j = 0; j < n2; j++) {
      x2 = c2.x + r2 * cos(j * TWO_PI / n2 + c2.theta);
      y2 = c2.y + r2 * sin(j * TWO_PI / n2 + c2.theta);

      d = dist(x1, y1, x2, y2);
      if (d < dMin) {
        stroke(myColor.R + r2/1.5, myColor.G + r2/2.2, myColor.B + r2/1.5, map(d, 0, dMin, 140, 0) * rCoeff);
        line(x1, y1, x2, y2);
      }
    }
  }
}

function Circle(radius, x, y) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.theta = 0;
  this.timer = 0;
	this.minLines = 1;
	this.maxLines = 2;
  this.nbLines = random(this.minLines, this.maxLines);
	this.lineVelocity = random(1) < .5 ? 1 : -1;
	this.lineAcc = random(100, 250);
  this.rotSpeed = (random(1) < .5 ? 1 : -1) * random(.005, .034);
  this.radSpeed = (random(1) < .5 ? 1 : -1) * random(.3, 1.4);

  this.update = function(){
    this.theta += this.rotSpeed;
    this.radSpeed *= abs(this.radius += this.radSpeed) > this.rMax ? -1 : 1;
		if (this.timer >= this.lineAcc) {
			this.nbLines = this.nbLines + this.lineVelocity;
			this.timer = 0;
			if (this.nbLines > this.maxLines) {
				this.lineVelocity = -1;
			} else if (this.nbLines < this.minLines) {
				this.lineVelocity = 1;
			}
		}
		this.timer++;
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
