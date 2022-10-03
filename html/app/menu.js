
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

      this.itemHeight = 4.5*this.hunit;
  
      // how many motives/items are there in the menu?
      this.targetItems = Object.keys(this.json.target).length;

      // load the previous images asyncronously
      this.prev = new ImageCache(this.json.target,"img");
      
      // also fetch the cached background images
      this.cache = new ImageCache(this.json.target,"cache");

      // On off button for doppler effect
      const dopplerSize = 45;
      this.dopplerY = this.hunit*(8+this.json.style.marginTop)+this.itemHeight*(this.targetItems+2.0);
      this.doppler = new OnOffSwitch((this.json.style.marginLeft+0.5)*this.wunit,this.dopplerY,dopplerSize,false);

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
        fill(0,0,0,200);
        stroke(255);
        rect(xO,yO,w,h,10);
        noStroke();
  
        // display current selection
        fill(149, 225, 248);
        textSize(4*this.hunit);
        text(this.json.target[this.selection].name,xO+0.5*this.wunit,yO+5*this.hunit);
  
        // planet/target list
        noStroke();
        const itemHeight = this.itemHeight;
        let yoff = yO+8*this.hunit;
        let xoff = xO+3.4*this.wunit;
        fill(180);
        textSize(2*this.hunit);
        text("motive to fly by",xO+0.5*this.wunit,yoff);
        fill(255);
        for (let i = 0; i<this.targetItems; i++){
          if(this.prev.isAvailable(i)){
            image(this.prev.getImage(i),xO+0.5*this.wunit, yoff+0.5*itemHeight-this.hunit,itemHeight,itemHeight)
          }
          yoff += itemHeight;
          textSize(2*this.hunit);
          if(this.highlight == i){
            textSize(2.4*this.hunit);
          }
          text(this.json.target[i].name,xoff,yoff);
        }
        noStroke();
  
        // render the doppler switch
        this.doppler.render();
        // and the text above it
        fill(180);
        textSize(2*this.hunit);
        text("Doppler Effect",xO+0.75*this.wunit+this.doppler.size,this.dopplerY+0.5*this.doppler.h+0.8*this.hunit);
        fill(255);

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
        
      // react to mouse hover on the switch
      this.doppler.hover(x,y);

    
      const xO = this.json.style.marginLeft*this.wunit;
      const yO = this.hunit*this.json.style.marginTop;
      const w = this.wunit*this.json.style.width;
      const h = this.hunit*this.json.style.height;
  
      // first check if we are inside the menu at all, if not there is nothing to do
      if((xO < x) && (xO+w > x) && (yO < y) && (yO+h > y)){
        // check if any highlighting is necessary for items in the target list
        const lxO = xO+0.5*this.wunit;
        const lyO = yO+8*this.hunit;
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
      // react to clicks on the switch
      this.doppler.click(x,y);

      // if we have a highlight and it is not the current selection, change that
      if( (this.highlight > -1) && (this.highlight<this.targetItems)){
        if(this.selection != this.highlight){
          this.selection = this.highlight;
          // request a redraw
          redraw();
        }
      }
    }
  
    backgroundAvailable(){
        if(!this.built){
            return false;
        }
        return this.cache.isAvailable(this.selection);
    }

    getBackground(){
        return this.cache.getImage(this.selection);
    }

  }