
// an animated lever that allows the selection of a velocity
class Lever{
    constructor(x,y,w,h,minVal,maxVal){
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
        this.min = minVal;
        this.max = maxVal;
        this.val = minVal;
        this.wbar = 0.15*this.w;
        this.hovering = false;
        this.grabbed = false;
    }

    render(){
        stroke(255);
        strokeWeight(1);
        noFill();
        rect(this.x+0.5*(this.w-this.wbar),this.y,this.wbar,this.h,2);

        if(this.hovering){
            strokeWeight(1.5);
        }
        const pos = this.y+this.h*(this.max-this.val)/(this.max-this.min)
        rect(this.x,pos-0.25*this.wbar,this.w,0.5*this.wbar,5)
        strokeWeight(1);
    }

    hover(x,y){
        const pos = this.y+this.h*(this.max-this.val)/(this.max-this.min);
        if(this.grabbed){
            // update pos
            this.val = int(100*(1.0-(y-this.y)/this.h));
            if(this.val < this.min){
                this.val = this.min;
            }
            if(this.val > this.max){
                this.val = this.max;
            }
            redraw();
            return;
        }
        if((this.x < x) && (this.x+this.w > x) && (pos-this.wbar < y) && (pos+1.5*this.wbar > y)){
            if(!this.hovering){
                this.hovering = true;
                redraw();
            }
        }else{
            if(this.hovering){
                this.hovering = false;
                redraw();
            }
        }
    }

    mouseReleased(x,y){
        this.grabbed = false;
    }

    mousePressed(x,y){
        if(this.hovering){
            this.grabbed = true;
        }
    }
}