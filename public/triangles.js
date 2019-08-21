var LINE_THICKNESS = 15;

var loaded = false;
var OLD_DARK, OLD_LIGHT, DARK, LIGHT, NEW_DARK, NEW_LIGHT;
var tris = [];
var timer, stage;

function preload(){
	var script = document.createElement('script');
  script.src = 'lib/delauney.js';
  script.onload = function(){
    loaded = true;
    initializeTriangulation();
  }
  document.body.appendChild(script);
}

function setup(){
  createCanvas(windowWidth, windowHeight);
  DARK = color(random(0, 120), random(0, 120), random(0, 120));
  LIGHT = color(random(80, 255), random(80, 255), random(80, 255));

  timer = 360;
  stage = 'triangle';
}

function initializeTriangulation(){
  if(!loaded) return;

  count = 0;
  tris = [];
  var pts = [];
  // push canvas rect points
  pts.push(createVector(0, 0));
  pts.push(createVector(width, 0));
  pts.push(createVector(width, height));
  pts.push(createVector(0, height));

  // add a certain nb of pts proportionally to the size of the canvas
  // ~~ truncates a floating point number and keeps the integer part, like floor()
  var n = ~~ (width / 300 * height / 300);
  for(var i = 0; i < n; i ++){
    pts.push(createVector(~~ random(width), ~~ random(height)));
  }

  // Now, let's use Delaunay.js
  // Delaunay.triangulate expect a list of vertices (which should be a bunch of two-element arrays, representing 2D Euclidean points)
  // and it will return you a giant array, arranged in triplets, representing triangles by indices into the passed array
  // Array.map function let us create an Array of 2 elements arrays [ [x,y],[x,y],..] from our array of PVector [ PVector(x,y), PVector(x,y), ... ]
  var triangulation = Delaunay.triangulate(pts.map(function(pt){
    return [pt.x, pt.y];
  }));

  // create Triangles object using indices returned by Delaunay.triangulate
  for(var i = 0; i < triangulation.length; i += 3){
    tris.push(new Triangle(
      pts[triangulation[i]],
      pts[triangulation[i + 1]],
      pts[triangulation[i + 2]]
    ));
  }
}

// class for keeping triangles from 3 PVectors
function Triangle( _a, _b, _c ){
  // PVectors
  this.a = _a;
  this.b = _b;
  this.c = _c;

  // used for fill using lerpColor
  this.r = random(0.8);

  // used for drawing lines on triangles
  // number of lines to draw proportionnally to the triangle size
  this.n = ~~(dist(
    _a.x, _a.y,
    (this.b.x + this.c.x) / 2, (this.b.y + this.c.y) / 2
  ) / random(25, 50)) + 0;
  // direction point for the lines
  this.drawTo = ~~ random(3);

  this.draw = function(){
    noStroke();
    fill(lerpColor(LIGHT, DARK, this.r));

    triangle(this.a.x, this.a.y, this.b.x, this.b.y, this.c.x, this.c.y);

    switch(this.drawTo){
      case 0:
        this.drawLines(this.a, this.b, this.c);
        break;
      case 1:
        this.drawLines(this.c, this.a, this.b);
        break;
      case 2:
        this.drawLines(this.b, this.a, this.c);
        break;
    }

    stroke(DARK);
    strokeJoin(BEVEL);
    strokeWeight(LINE_THICKNESS);
    noFill();
    triangle(this.a.x, this.a.y, this.b.x, this.b.y, this.c.x, this.c.y);
  };

  this.drawLines = function(from, to1, to2){
    var c = cos(timer / 360 * TWO_PI) / 2;

    for(var i = 1; i <= this.n; i++){
      var p1 = createVector(
        lerp(from.x, to1.x, (i - 1) / this.n),
        lerp(from.y, to1.y, (i - 1) / this.n)
      );
      var p2 = createVector(
        lerp(from.x, to2.x, (i - 1) / this.n),
        lerp(from.y, to2.y, (i - 1) / this.n)
      );
      var p3 = createVector(
        lerp(from.x, to2.x, (i - 0.5 + c) / this.n),
        lerp(from.y, to2.y, (i - 0.5 + c) / this.n)
      );
      var p4 = createVector(
        lerp(from.x, to1.x, (i - 0.5 + c) / this.n),
        lerp(from.y, to1.y, (i - 0.5 + c) / this.n)
      );

      noStroke();
      fill(DARK);
      quad(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
    }
  }
}

function draw(){
  update();

  // console.log('[' + stage + '] old: ' + OLD_DARK + ' :: current: ' + DARK)
  switch(stage) {
    case 'triangle':
      background(DARK);
      tris.forEach(t => t.draw());
      break;
    case 'transition':
      OLD_DARK = DARK;
      OLD_LIGHT = LIGHT;
      DARK = color(random(0, 120), random(0, 120), random(0, 120));
      LIGHT = color(random(80, 255), random(80, 255), random(80, 255));

      background(OLD_DARK);
      initializeTriangulation();
      break;
    case 'blend':
      background(lerpColor(DARK, OLD_DARK, timer / 20));
      break;
  }
}

function update() {
  timer--;
  if (timer <= 0) {
    switch(stage){
      case 'triangle':
        stage = 'transition';
        timer = 1;
        break;
      case 'transition':
        stage = 'blend';
        timer = 20;
        break;
      case 'blend':
        stage = 'triangle';
        timer = 360;
        break;
    }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  initializeTriangulation();
}
