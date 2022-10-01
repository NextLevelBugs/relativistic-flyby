
// takes care of the interactive menu
class Menu {
  // gets a uri to a descriptive json file
  constructor(uri){
    this.built = false;

    this.hunit = 0.01*height;
    this.wunit = 0.01*width;

    fetch(uri)
    .then(res => res.json())
    .then(out =>
    this.buildFromJSON(out))
    .catch(err => { throw err });
  }

  buildFromJSON(json){
    this.json = json;
    this.built = true;
    // we should redraw now that we have information to draw the menu
    redraw();
  }

  render(){
    // only draw if we have read the json config
    if(this.built){

      const xO = this.json.style.marginLeft*this.wunit;
      const yO = this.hunit*this.json.style.marginTop;
      const w = this.wunit*this.json.style.width;
      const h = this.hunit*this.json.style.height;

      // boundary
      fill(0);
      stroke(255);
      rect(xO,yO,w,h,20);
      noStroke();

      // planet/target list
      fill(0);
      stroke(255);
      rect(xO+this.wunit,yO+this.hunit,w-2*this.wunit,h-2*this.hunit,20)
      noStroke();

    }
  }

  // returns px width of menu including left and right margin
  getFullWidth(){
    if(!this.built){
      return 0;
    }
    return this.wunit*(this.json.style.marginLeft+this.json.style.marginRight+this.json.style.width);
  }

}

// the menu to be used for user input
let menu;

function preload(){
  img = loadImage('img/deep_field.jpg');
}

function setup() {
  let cv = createCanvas(windowWidth, windowHeight*0.8);
  cv.position(0,0);
  cv.parent("render");
  menu = new Menu("app/menu.json");
  noLoop();
}

function draw() {
  background(0);

  // draw the menu
  menu.render();

  // get region where we want to render the view
  const minW = menu.getFullWidth();

  fill(255,0,0);
  image(img,minW,0,width-minW,height);

}
