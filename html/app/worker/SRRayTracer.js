// this is a web worker to render all images.

// this will store informations about the image to be rendered next
let renderContext = new Object();
renderContext.pending = false;

// this class will take care of rendering images according to special relativity
class SRRayTracer{
    constructor(uri){
        this.operational = false;

        fetch(uri)
        .then(res => res.json())
        .then(out =>
        this.buildFromJSON(out))
        .catch(err => { throw err });
    }

    buildFromJSON(json){
        this.json = json;

        // load textures we need for rendering
        // TODO
    }

    // get ad render context
    render(rc){
        console.log("rendering..");
    }

    result(){
        return 42;
    }
}

// create a renderer
const srRender = new SRRayTracer("../config/render.json");

// what happens when we get a mesage
function onMessage(e){
    renderContext.motive = e["motive"];
    renderContext.velocity = e["velocity"];
    renderContext.pending = true;
    srRender.render(renderContext);
    // post the result back to the main thread
    postMessage(srRender.result());
}

onmessage = onMessage;
