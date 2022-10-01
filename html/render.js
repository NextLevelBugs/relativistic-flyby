let frames = 0;


function setup() {
  let cv = createCanvas(windowWidth, windowHeight*0.8);
  cv.position(0,0);
  cv.parent("render");
  noLoop();
}

function draw() {
  background(frames%255);
  frames++;
}
