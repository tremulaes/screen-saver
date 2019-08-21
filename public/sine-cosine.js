function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
  count = frameCount * 0.001;
  countSin = sin(count);
  background(40);

  rotateY(count * 10);

  for (let j = 0; j < 5; j++) {
    push();
    for (let i = 0; i < 75; i++) {
      translate(
        sin(count + j) * 100,
        sin(count + j) * 100,
        i * 0.1
      );
      rotateZ(count * 2);
      push();
      sphere(8, 6, 4);
      pop();
    }
    pop();
  }
}
