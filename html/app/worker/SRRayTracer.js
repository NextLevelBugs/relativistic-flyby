// this is a web worker to render all images.

// this will store informations about the image to be rendered next
let renderContext = new Object();
renderContext.pending = false;

// this class will take care of rendering images according to special relativity
class SRRayTracer{
    constructor(uri){
        this.operational = false;

        // a counter how many times we have rendered so far.
        this.operations = 0;

        fetch(uri)
        .then(res => res.json())
        .then(out =>
        this.buildFromJSON(out))
        .catch(err => { throw err });
    }

    buildFromJSON(json){
        this.json = json;

        console.log("worker built.")
        // load textures we need for rendering
        // TODO
    }

    // gets render context
    render(rc){
        this.operations++;

        // reserve a huge ass array for the rendered image
        this.noDopplerChannel = new Uint8ClampedArray(4*rc.width*rc.height);
        this.DopplerChannel = new Uint8ClampedArray(4*rc.width*rc.height);

        this.w = rc.width;
        this.h = rc.height;

        this.v = rc.velocity;

        // we need to make a distinction between rendering a pure star sky
        // or rendering a planet/spaceship etc.

        if(rc.motive == "Stars"){
            this.stars();
        }else{
            this.motive(rc.motive);
        }

    }

    // renders a relativistic adapted star sky
    stars(){
        const w = this.w;
        const h = this.h;

        const buf = this.noDopplerChannel;
        const bufd = this.DopplerChannel;

        for(let y = 0; y<h; y++){
            for(let x = 0; x<w; x++){
                const idx = 4*(y*w+x);
                if(  (x % 100 < 50) ^ (y % 100 < 50) ){
                    buf[idx+1] = 155; 
                    buf[idx+3] = 255;
                    bufd[idx+2] = 255;
                    bufd[idx+3] = 255;
                }else{
                    buf[idx] = 255;
                    buf[idx+3] = 255;
                }
            }
        }
    }

    // renders a planet or other motive that is passing
    motive(name){

        const w = this.w;
        const h = this.h;

        const buf = this.noDopplerChannel;
        const bufd = this.DopplerChannel;

        for(let y = 0; y<h; y++){
            for(let x = 0; x<w; x++){
                const idx = 4*(y*w+x);
                if(  (x % 100 < 50) ^ (y % 100 < 50) ){
                    buf[idx+1] = 255; 
                    buf[idx+3] = 255;
                    bufd[idx+2] = 255;
                    bufd[idx+3] = 255;
                }else{
                    buf[idx] = 255;
                    buf[idx+3] = 255;
                }
            }
        }
    }

    result(){
        return [this.noDopplerChannel,this.DopplerChannel, this.w, this.h];
    }
}

// create a renderer
const srRender = new SRRayTracer("../config/render.json");

// what happens when we get a mesage
function onMessage(e){

    renderContext.motive = e.data[0].motive;
    renderContext.velocity = e.data[0].velocity;
    renderContext.width = Math.round(e.data[0].width);
    renderContext.height = Math.round(e.data[0].height);
    renderContext.pending = true;

    srRender.render(renderContext);

    // post the result back to the main thread
    // TODO: use transferable objects to speed up 
    postMessage(srRender.result());
}

onmessage = onMessage;
