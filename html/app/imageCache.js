
class ImageCache{
    // motives is an array of objects with key given by key, where cache refers to the image file to be loaded
    constructor(motives, key){
        this.len = Object.keys(motives).length;
        this.available = new Array();
        // load images
        this.img = new Array();
        let self = this;
        for (let i = 0; i<this.len; i++){
            this.available.push(false);
            this.img.push(loadImage(motives[i][key], function(loadedImage) {
                self.available[i] = true;
                redraw();
            }));
        }
    }

    isAvailable(id){
        return this.available[id];
    }

    getImage(id){
        return this.img[id];
    }
  }
  