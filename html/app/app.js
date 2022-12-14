// the menu to be used for user input
let menu;
// the Webworker to generate images
const worker = new Worker("app/worker/SRRayTracer.js");

// function to nicely display the rendered image
function displayRenderedImage(){

  noStroke();
  // draw background image
  if(menu.backgroundAvailable()){
    image(menu.getBackground(),0,0,width,height);
  }

  // draw the lower % with a gradient in opacity by overlaying a dark rect
  // (yes this is a weird solution but its very fast..)
  const startfrac = 0.96;
  const steps = 50;
  const dheight = (1.0-startfrac)*height/steps;
  const alpha = 0.94;
  let transparancy = 255;
  for (let i = 0; i<steps;i++){
    transparancy *= alpha;
    fill(0,0,0,255-transparancy);
    rect(0,1+int(startfrac*height+i*dheight),width,int(startfrac*height+(i+1)*dheight)-int(startfrac*height+i*dheight))
  }

}

function preload(){
}

function setup() {
  let cv = createCanvas(windowWidth, windowHeight*1.02);
  cv.position(0,0);
  cv.parent("render");
  menu = new Menu("app/config/menu.json", worker);
  worker.onmessage = (event) => {
    menu.workerResult(event);
  };
  worker.onerror = (event) => {
    console.log('Error in rendering worker.');
  }
  noLoop();
}

function draw() {
  background(0);
  // draw the rendered image
  displayRenderedImage();

  // draw the menu
  menu.render();

}

function mouseMoved(){
  // check if we need to update any menu animations
  menu.mouseHover(mouseX,mouseY);
}

function mouseClicked(){
  // check if we have to change some settings
  menu.mouseClick(mouseX,mouseY);
}

function mousePressed(){
  menu.mousePressed(mouseX,mouseY);
}

function mouseReleased(){
  menu.mouseReleased(mouseX,mouseY);
}

function mouseDragged(){
  menu.mouseHover(mouseX,mouseY);
}

