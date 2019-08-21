function setup() {
	c = createCanvas(windowWidth, windowHeight);
	background(100);

	ix = 0
	RW = min(windowWidth, windowHeight)
	RH = RW

	colorMode(HSB,255)
}

function draw() {
	noSmooth()

	if (ix < RW)
	for (var nc = 0; nc < 5; nc++) {
		for(iy = 0; iy < RH; iy++) {
			nx = ix - 12 + 24 * noise(ix / 15, iy / 15)
			ny = iy - 12 + 24 * noise(ix / 15, iy / 15 + 2000)
			m = noise(nx / 200, ny / 200)

			h = 2.5 * sq(sq(m))
			h *= abs(noise(nx / 30, ny / 30 + 1000) - 0.5) //hill/valley noise
			h += 0.65 * (noise(nx / 300 + 1000, ny / 300) - 0.5)//

			col = color(map(h, -0.07, 0.2, 0, 255))
			stroke(col)
      // translate(sin(frameCount * 0.01 + iy) * 100, sin(frameCount * 0.01 + iy) * 100, nc);
			line(
        windowWidth / 2 + ix - iy,
        ix / 2 + iy / 2 - 400 * h,
        windowWidth / 2 + ix - iy,
        ix / 2 + iy / 2
      )
		}
		ix ++
	}
}
