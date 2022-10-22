// this is a web worker to render all images.

// this will store informations about the image to be rendered next
let renderContext = new Object();
renderContext.pending = false;

// use Planck's law to get chromaticity of stars given temperature and the multiplicative spectral doppler shift
// T: array of star temperatures, shift: array of doppler shifts
function starChroma(T,shift){
    const bc = 1.44e7;
    // wavelenght in nm for rgb
    const lr = 700;
    const lg = 540;
    const lb = 400;
    // make an array
    const N = T.length;
    const rgba = new Uint8ClampedArray(4*N);
    for(let i = 0; i<N; i++){
        const idx = 4*i;
        const r = 1.0/(lr*lr*lr)/(Math.exp(bc/(shift[i]*lr*T[i]))-1.0);
        const g = 1.0/(lg*lg*lg)/(Math.exp(bc/(shift[i]*lg*T[i]))-1.0);
        const b = 1.0/(lb*lb*lb)/(Math.exp(bc/(shift[i]*lb*T[i]))-1.0);
        const norm = 0.45*Math.sqrt(r*r+g*g+b*b);
        rgba[idx+3] = 255;
        rgba[idx] = 255*r/norm;
        rgba[idx+1] = 255*g/norm;
        rgba[idx+2] = 255*b/norm;
    } 
    return rgba;
}

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

        this.generateStars(json.stars.number);
    }

    generateStars(count){
        // we give each star coordinates on the sky sphere in rest frame
        this.starData = new Object();
        this.starData.count = count;
        this.starData.alphaMax = this.json.stars.alphaMax;
        this.starData.phi = new Float32Array(count);
        this.starData.cosTheta = new Float32Array(count);
        this.starData.temperature = new Float32Array(count);
        this.minLogT = 8.0;
        this.maxLogT = 9.7;
        for(let i = 0; i<count; i++){
            this.starData.phi[i] = 2.0*Math.PI*Math.random();
            // cos(Theta) is uniform on (-1,1)
            this.starData.cosTheta[i] = 2*Math.random()-1.0;
            this.starData.temperature[i] = Math.exp((this.maxLogT-this.minLogT)*Math.random()+this.minLogT);
        }

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

        // calculate the pixel scale
        const scale = 0.5*w/Math.tan(this.starData.alphaMax);
        // center
        const cx = Math.round(w/2);
        const cy = Math.round(h/2);

        // calculate the doppler spectral scaling factor
        const oneMult = new Float32Array(this.starData.count);
        const dopplerMult = new Float32Array(this.starData.count);
        oneMult.fill(1.0);
        for(let i = 0; i<this.starData.count; i++){
            // calculate lorentz based doppler
            dopplerMult[i] = (1.0+this.v*this.starData.cosTheta[i])/Math.sqrt(1.0-this.v*this.v);
        }

        // calculate star chroma
        const chromaNoD = starChroma(this.starData.temperature,oneMult);
        const chromaD = starChroma(this.starData.temperature,dopplerMult);

        // draw all the stars
        for(let n = 0; n<this.starData.count; n++){
            // transform the phi-angle by Lorentz-Trafo
            const cosPrime = (this.starData.cosTheta[n]+this.v)/(1.0+this.v*this.starData.cosTheta[n]);
            if(cosPrime > 0.0){
                const d = scale*Math.sqrt(1.0-cosPrime*cosPrime)/cosPrime;
                const y = Math.round(d*Math.sin(this.starData.phi[n]))+cy;
                const x = Math.round(d*Math.cos(this.starData.phi[n]))+cx;
                
                if( (x >= 0) && (y >= 0) ){
                    if( (x < w) && (y < h) ){
                        const idx = 4*(y*w+x);
                        const cidx = 4*n;
                        // without doppler
                        buf[idx] = chromaNoD[cidx];
                        buf[idx+1] = chromaNoD[cidx+1];
                        buf[idx+2] = chromaNoD[cidx+2];
                        buf[idx+3] = chromaNoD[cidx+3];

                        // with doppler
                        bufd[idx] = chromaD[cidx];
                        bufd[idx+1] = chromaD[cidx+1];
                        bufd[idx+2] = chromaD[cidx+2];
                        bufd[idx+3] = chromaD[cidx+3];
                    }
                }

            }
        }
    }

    // renders a planet or other motive that is passing
    motive(name){

        const info = this.json[name];

        const w = this.w;
        const h = this.h;

        const buf = this.noDopplerChannel;
        const bufd = this.DopplerChannel;

        // calculate the pixel scale
        const scale = 0.5*w/Math.tan(info.alphaMax);
        // center
        const cx = Math.round(w/2);
        const cy = Math.round(h/2);
        // center in rest frame
        const cxr = info.x0;
        const cyr = info.y0;

        for(let y = 0; y<h; y++){
            for(let x = 0; x<w; x++){
                const idx = 4*(y*w+x);
                
                const dy = (y-cy);
                const dx = (x-cx);
                const d_over_s_2 = (dy*dy+dx*dx)/(scale*scale);

                // calculate the angle wrt to the center (in the moving frame)
                const cosThetaPrime = 1.0/Math.sqrt(1.0+d_over_s_2);
                // vector direction wrt to center in moving frame
                // now transform to rest frame
                const cosTheta = (cosThetaPrime-this.v)/(this.v*cosThetaPrime+1);

                // go back to pixel data
                const d_over_s = Math.sqrt(d_over_s_2);
                const l = Math.sqrt(1.0-cosTheta*cosTheta)/cosTheta;
                const xrf = cxr+dx/d_over_s*l;
                const yrf = cyr+dy/d_over_s*l;
                
                // TODO: make sure cosTheta > 0, otherwise black

                if(  Math.sqrt((xrf-cxr)*(xrf-cxr)+(yrf-cyr)*(yrf-cyr)) % 100 < 50  ){
                    if(cosTheta > 0){
                        buf[idx+1] = 255; 
                        buf[idx+3] = 255;
                        buf[idx] = 255;
                        buf[idx+2] = 255;
                        bufd[idx+2] = 255;
                        bufd[idx+3] = 255;
                    }else{
                        buf[idx] = 255;
                        bufd[idx] = 255;
                    }
                }else{
                    buf[idx] = 255;
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
