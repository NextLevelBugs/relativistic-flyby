// a on off switch, animated for binary settings
class OnOffSwitch{
    constructor(x,y,size,initial=false){
        this.x = x;
        this.y = y;
        this.size = size;
        this.state = initial;
        this.bs = 0.4*size;
        this.h = 0.55*size;
        this.hovering = false;
    }

    render(){
        if(!this.state){
            stroke(127,50,50);
        }else{
            stroke(50,127,50);
        }
        if(this.hovering){
            strokeWeight(1.5);
        }
        noFill();
        rect(this.x,this.y,this.size,this.h,this.h*0.5);
        if(this.state){
            // on
            ellipse(this.x+0.5*this.h,this.y+0.5*this.h,this.bs);
        }else{
            // off
            ellipse(this.x+this.size-0.5*this.h,this.y+0.5*this.h,this.bs);
        }
        strokeWeight(1);
        stroke(255);
        noStroke();
        fill(255);
    }

    // checks if mouse hovers over it and adjusts animation
    hover(x,y){
        if((this.x < x) && (this.x+this.size>x) && (this.y < y) && (this.y+this.h > y)){
            if(!this.hovering){
                // user started hovering so redraw
                this.hovering = true;
                redraw();   
            }
        }else{
            if(this.hovering){
                // no longer hovering so.. redraw
                this.hovering = false;
                redraw();
            }
        }
    }

    // react to click events
    click(x,y){
        if(this.hovering){
            this.state = !this.state;
            redraw();
        }
    }

}