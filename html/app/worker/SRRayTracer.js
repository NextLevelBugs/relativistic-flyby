// this is a web worker to render all images.

// this will store informations about the image to be rendered next
let renderContext = new Object();
renderContext.pending = false;

// this class will take care of rendering images according to special relativity
class SRRayTracer{
    constructor(uri){
        this.operational = false;

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

    // get ad render context
    render(rc){
        this.operations++;
    }

    result(){
        return [this.operations,this.operations+1];
    }
}

// create a renderer
const srRender = new SRRayTracer("../config/render.json");

// what happens when we get a mesage
function onMessage(e){
    
    renderContext.motive = e.data[0].motive;
    renderContext.velocity = e.data[0].velocity;
    renderContext.width = e.data[0].width;
    renderContext.height = e.data[0].height;
    renderContext.pending = true;

    srRender.render(renderContext);

    // post the result back to the main thread
    postMessage(srRender.result());
}

onmessage = onMessage;
