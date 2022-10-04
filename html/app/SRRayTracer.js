// this is a web worker to render all images.

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
}

// create a renderer
const srRender = new SRRayTracer("config/render.json");
console.log("works");