/*
	Andor Salga
	Aug. 2017

	Procedural Isometric Terrain Generator

	- TODO:
	 - fix 'translate' jitter
	 - add water
	 - add trees
	 - add deformation
	 - fix shading
	 - add proper mouse interaction
	 - add world edges
*/

'use strict';

let f = 0;
const zHeight = 11;
const rowLength = 40;

let z_dataArr;
let rows = [];

const tileRatioX = 2;
const tileRatioY = 1;
const tileSize = 8;

const tileSizeY = tileSize * tileRatioY;
const tileSizeX = tileSize * tileRatioX;


let shadeLight,
    shadeNeutral,
    shadeDark,
    lineColor;

/*
 */
function setup() {
    createCanvas(windowWidth, windowHeight);
  
    noiseSeed(0);
    noiseDetail(1, 1);

    // Easier to work with the folds in multi-dimensional array format.
    z_dataArr = [];

    let shade = 80;
    shadeLight = color(200);
    shadeNeutral = color(100);
    shadeDark = color(50);
    lineColor = color(shade, .80 * 255, .50 * 255);
}

function mousePressed(){
  noiseSeed(millis());
}

/*
    1) Start at 'top', iterate over first 2 rows
    2) split up in cases
    3) get indices
    4) draw triangle
*/
function drawFilledTriangles() {

    let rowTop = 0,
        rowBottom = 1;
    // stroke(255, 250, 25, 15);

    for (; rowBottom < z_dataArr.length; ++rowTop, ++rowBottom) {

        let r1 = z_dataArr[rowTop];
        let r2 = z_dataArr[rowBottom];

        for (let p = 0; p < rowLength - 1; ++p) {

            let p0 = {
                x: rows[rowTop].xVals[p],
                y: rows[rowTop].yVals[p]
            };
            let p1 = {
                x: rows[rowTop].xVals[p + 1],
                y: rows[rowTop].yVals[p + 1]
            };
            let p2 = {
                x: rows[rowBottom].xVals[p + 1],
                y: rows[rowBottom].yVals[p + 1]
            };
            let p3 = {
                x: rows[rowBottom].xVals[p],
                y: rows[rowBottom].yVals[p]
            };

            // QUAD
            if (!tileFoldsVertically(r1, r2, p) && !tileFoldsHorizontally(r1, r2, p)) {

                if (quadFacingUp(r1, r2, p)) {
                    fill(shadeNeutral);
                }
                //
                else if (quadFacingEast(r1, r2, p) || quadFacingSouth(r1, r2, p)) {
                    fill(shadeLight);
                }
                //
                else if (quadFacingWest(r1, r2, p) || quadFacingNorth(r1, r2, p)) {
                    fill(shadeDark);
                }

                drawQuad(p0, p1, p2, p3);
            }
            // TRIANGLE FOLDS NORTH/SOUTH / VERTICALLY
            else if (tileFoldsVertically(r1, r2, p)) {
                if (triPointingWestFacingUp(r1, r2, p)) {
                    fill(shadeNeutral);
                    tri(p0, p1, p3);

                    if (r2[p + 1] > r1[p]) { // faces West
                        fill(shadeDark);
                    } else if (r1[p + 1] > r2[p + 1]) { // Faces East
                        fill(shadeLight);
                    }

                    tri(p1, p2, p3);
                } else if (triPointingEastFacingUp(r1, r2, p)) {
                    fill(shadeNeutral);
                    tri(p1, p2, p3);

                    if (r1[p] < r2[p + 1]) { // Faces West
                        fill(shadeDark);
                    } else { // Faces East
                        fill(shadeLight);
                    }
                    tri(p0, p1, p3);
                } else if (triPointingEastFacingWest(r1, r2, p)) {
                    fill(255, 0, 0);
                    tri(p0, p1, p3);
                }
            } else if (tileFoldsHorizontally(r1, r2, p)) {

                if (triPointingNorthFacingUp(r1, r2, p)) {
                    fill(shadeNeutral);
                    tri(p0, p1, p2);

                    if (r2[p] < r1[p + 1]) { // Faces South
                        fill(shadeDark);
                    } else { // Faces North
                        fill(shadeDark);
                    }
                    tri(p0, p2, p3);
                } else if (triPointingNorthFacingSouth(r1, r2, p)) {
                    fill(shadeDark);
                    tri(p0, p1, p2);

                    if (r2[p] < r1[p + 1]) { // Faces up
                        fill(shadeNeutral);
                    } else { // Faces North??
                        //??
                    }
                    tri(p0, p2, p3);
                } else if (triPointingNorthFacingNorth(r1, r2, p)) {
                    fill(shadeDark);
                    tri(p0, p1, p2);

                    if (r2[p] > r1[p + 1]) { // Faces up
                        fill(shadeNeutral);
                    }
                    // TODO: add condition here
                    tri(p0, p2, p3);
                }
            }
        }
    }
}

/*
 */
function drawVerticalGrid() {
    // stroke(255, 255, 255, 40);/
    for (let y = 0; y < height; y += tileSize * tileRatioY) {
        line(0, y, width, y);
    }
    for (let x = 0; x < width; x += tileSize * tileRatioX) {
        line(x, 0, x, height);
    }
}

/*
	X line is consistently tileSize length
 */
function worldToScreenSpace() {

    rows = [];
    let xVals = [],
        yVals = [];

    // 1) PROCESS
    for (let r = 0; r < z_dataArr.length; ++r) {

        for (let c = 0; c < z_dataArr[0].length; ++c) {

            let x = c * tileSizeX;
            let y = -c * tileSizeY;

            y -= zHeight * z_dataArr[r][c];

            x += tileSizeX * r;
            y += tileSizeY * r;

            xVals.push(x);
            yVals.push(y);
        }

        // If we reach the end, take all data and push onto rows
        //if ((i + 1) % rowLength === 0) {
        rows.push({
            xVals: xVals.slice(),
            yVals: yVals.slice()
        });
        xVals = [];
        yVals = [];
    }
}

/*
	A fold occurs when a tile's diagonal opposite sides
	has the same levels, but the other sides have different sides.
*/
function drawFoldLines() {
    let rowTop = 0,
        rowBottom = 1;

    for (; rowBottom < z_dataArr.length; ++rowTop, ++rowBottom) {
        //
        for (let p = 0; p < rowLength; ++p) {

            let r1 = z_dataArr[rowTop];
            let r2 = z_dataArr[rowBottom];

            // North/South connection needs a fold?
            if ((r1[p] === r2[p + 1]) &&
                (r1[p + 1] !== r2[p])) {

                let x1 = rows[rowTop].xVals[p];
                let y1 = rows[rowTop].yVals[p];

                let x2 = rows[rowBottom].xVals[p + 1];
                let y2 = rows[rowBottom].yVals[p + 1];
                stroke(lineColor);
                line(x1, y1, x2, y2);
            }

            // East/West connection
            else if ((r1[p + 1] === r2[p]) &&
                (r1[p] !== r2[p + 1])) {

                let x1 = rows[rowTop].xVals[p + 1];
                let y1 = rows[rowTop].yVals[p + 1];

                let x2 = rows[rowBottom].xVals[p];
                let y2 = rows[rowBottom].yVals[p];
                stroke(lineColor);
                line(x1, y1, x2, y2);
            }
        }
    }
}


/*

*/
function drawWorldEdges() {
    // Start at the left edge of the world
    // connect all the tiles on touching the West side
    // of the world

    // let rowTop = 0,
    //     rowBottom = 1;

    // stroke(255, 0, 0);
    // for (; rowBottom < z_dataArr.length; ++rowTop, ++rowBottom) {

    //     let r1 = z_dataArr[rowTop];
    //     let r2 = z_dataArr[rowBottom];

    //     for (let p = 0; p < rowLength - 1; ++p) {

    //         let p0 = {
    //             x: rows[rowTop].xVals[p],
    //             y: rows[rowTop].yVals[p]
    //         };
    //         let p1 = {
    //             x: rows[rowTop].xVals[p + 1],
    //             y: rows[rowTop].yVals[p + 1]
    //         };
    //         let p2 = {
    //             x: rows[rowBottom].xVals[p + 1],
    //             y: rows[rowBottom].yVals[p + 1]
    //         };
    //         let p3 = {
    //             x: rows[rowBottom].xVals[p],
    //             y: rows[rowBottom].yVals[p]
    //         };
}

/*
 */
function renderData() {
    // Draw lines West to East
    for (let r = 0; r < rows.length; ++r) {
        let xVals = rows[r].xVals;
        let yVals = rows[r].yVals;

        for (let i = 0; i < xVals.length - 1; ++i) {
            // stroke(150, 220, 150);
            //stroke(lineColor);
            // stroke(255, 0, 0);
            // line(xVals[i], yVals[i], xVals[i + 1], yVals[i + 1]);
        }

        // for (let i = 0; i < xVals.length; ++i) {
        // ellipse(xVals[i], yVals[i], 5, 5);
        // }
    }

    // Connect the lines
    // Draw lines North to South
    for (let i = 0; i <= rowLength - 1; ++i) {
        for (let r = 0; r < rows.length - 1; ++r) {
            let x1 = rows[r].xVals[i];
            let y1 = rows[r].yVals[i];

            let x2 = rows[r + 1].xVals[i];
            let y2 = rows[r + 1].yVals[i];

            // stroke(255, 0, 0);
            //  line(x1, y1, x2, y2);
        }
    }
}

/*
 */
function drawFrontSlash() {
    push();
    translate(0, 32);
  //  stroke(0, 128, 128, 250);
	stroke(255);
	
    for (let x = 0, y = height / 2; x < width / 2 + 1; x += tileSize * tileRatioX, y += tileSize * tileRatioY) {
        line(x, y, x + width / 2, y - height / 2);
    }
    pop();
}

/*
 */
function drawBackSlash() {
    // stroke(0, 128, 128, 250);
	stroke(255);

    let x = 0,
        y = height / 2;

    for (; x < width / 2 + 1; x += tileSize * tileRatioX,
        y -= tileSize * tileRatioY) {
        line(x, y,
            x + (width / 2),
            y + height / 2
        );
    }
}


/*
 */
function draw() {
    colorMode(RGB);
    // background(133, 166, 199);
	background(0);

    let step = 1; //(tileSize * tileRatioX) / 1;

    z_dataArr = [];
    // colorMode(HSB);

    for (let x = 0; x < rowLength; ++x) {
        z_dataArr.push([]);
        for (let y = 0; y < rowLength; ++y) {

            let n = ceil(
                noise(
                    floor(((mouseX * 100 / width) + x / 2)) * .15, //+ ((1 / step) + x) / 8,
                    floor(((-mouseY * 100 / height) + y / 2)) * .15
                    //floor(millis() / 10) * .00001
                    //((frameCount / 32) + y) / 15,
                ) * 12);

            z_dataArr[x].push(n);
        }
    }
    push();

    translate(-rowLength * (tileRatioX * tileSize) + (width/2), height / 2 + 64);
    //   translate(-(frameCount) % step, -(frameCount / 2) % (step / 2));
    worldToScreenSpace();
    renderData();
    drawFilledTriangles();
    //drawFoldLines();
    pop();
}
