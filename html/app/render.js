
// takes care of the interactive menu
class Menu {
  // gets a uri to a descriptive json file
  constructor(uri){
    this.built = false;

    this.hunit = 0.01*height;
    this.wunit = 0.01*width;

    this.highlight = -1;
    this.selection = 0;

    fetch(uri)
    .then(res => res.json())
    .then(out =>
    this.buildFromJSON(out))
    .catch(err => { throw err });
  }

  buildFromJSON(json){
    this.json = json;

    // we need to fetch the preview images for the menu
    this.targetItems = Object.keys(this.json.target).length;
    this.prevImage = new Array();
    for (let i = 0; i<this.targetItems; i++){
      // redraw the canvas later once a new image has arrived
      this.prevImage.push(loadImage(this.json.target[i].img, function(loadedImage) {
        redraw();
      }));
    }
    
    // mark the build as ready so we can draw
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
      rect(xO,yO,w,h,10);
      noStroke();

      // display current selection
      fill(149, 225, 248);
      textSize(4*this.hunit);
      text(this.json.target[this.selection].name,xO+0.5*this.wunit,yO+5*this.hunit);

      // planet/target list
      noStroke();
      const itemHeight = 4*this.hunit;
      this.itemHeight = itemHeight;
      let yoff = yO+10*this.hunit;
      let xoff = xO+2.5*this.wunit;
      fill(180);
      textSize(2*this.hunit);
      text("objects to fly by",xO+0.5*this.wunit,yoff);
      fill(255);
      for (let i = 0; i<this.targetItems; i++){
        // check if image is loaded yet
        if(this.prevImage[i].width > 1){
          image(this.prevImage[i],xO+0.5*this.wunit, yoff+0.5*itemHeight-this.hunit,itemHeight,itemHeight)
        }
        yoff += itemHeight;
        textSize(2*this.hunit);
        if(this.highlight == i){
          textSize(2.4*this.hunit);
        }
        text(this.json.target[i].name,xoff,yoff);
      }
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

  // react to mouse hovering events
  // x,y: coordinates on screen
  mouseHover(x,y){

    const xO = this.json.style.marginLeft*this.wunit;
    const yO = this.hunit*this.json.style.marginTop;
    const w = this.wunit*this.json.style.width;
    const h = this.hunit*this.json.style.height;

    // first check if we are inside the menu at all, if not there is nothing to do
    if((xO < x) && (xO+w > x) && (yO < y) && (yO+h > y)){
      // check if any highlighting is necessary for items in the target list
      const lxO = xO+0.5*this.wunit;
      const lyO = yO+10*this.hunit;
      const lw = w-this.wunit;
      const lh = this.itemHeight*this.targetItems+0.5*this.itemHeight-this.hunit;
      if((lxO < x) && (lxO+lw > x) && (lyO < y) && (lyO+lh > y)){
        const hl = int((y-lyO)/this.itemHeight);
        if(hl != this.highlight){
          this.highlight = hl;
          redraw();
        }
      }else{
        if(this.highlight > -1){
          this.highlight = -1;
          redraw();
        }
      }
    }else{
      if(this.highlight > -1){
        this.highlight = -1;
        redraw();
      }
    }

  }

  // on mouse click
  mouseClick(x,y){
    // if we have a highlight and it is not the current selection, change that
    if( (this.highlight > -1) && (this.highlight<this.targetItems)){
      if(this.selection != this.highlight){
        this.selection = this.highlight;
        // request a redraw
        redraw();
      }
    }
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

function mouseMoved(){
  // check if we need to update any menu animations
  menu.mouseHover(mouseX,mouseY);
}

function mouseClicked(){
  // check if we have to change some settings
  menu.mouseClick(mouseX,mouseY);
}