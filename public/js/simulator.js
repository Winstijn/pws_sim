//
//  PWS AI
//  simulator.js
//
//  Created by Winstijn Smit
//  Copyright © 2019 Kaziaat B.V. All rights reserved.
//

// We will work with classes!
// This simulator will probably work with Chrome only because we intent to use it like that.
class Simulator {
    
    // TODO: Make simulator customisable with an init function!
    constructor() {
        this.log("Starting a simulator instance...")

        // Canvas variables
        var initObject = this.createP5InitObject("setup", "draw")
        this.canvas = new p5( initObject )
        this.webGL = false
        this.showDebug = true
        this.resolution = {width: 700, height: 700}
        
        // Variables for creations of tracks and cars.
        this.tracks = []
        this.cars = []
        this.trackColor = 255
        this.backgroundColor = 120
        this.trackIndex = 0
        this.editingTrack = true
        this.frameRate = 60


        this.log("Finished initializing the simulator!")
    }

    // Setup of the p5.js instance.
    setup(){
        this.log("p5.js libary setting up!")
        this.canvas.createCanvas( this.resolution.width , this.resolution.height , this.webGL ? "webgl" : 'p2d');
        this.canvas.noCursor();
        this.canvas.frameRate(this.frameRate);

        $("#center").append(this.canvas.canvas)
    }

    // Called everytime a frame needs to be rendered.
    // For documentation about drawing you can look up p5.js.
    // Never forget that order of render is important!
    draw(){
        if (this.webGL) this.canvas.translate(-0.5 * this.canvas.width, -0.5 * this.canvas.height)
        this.canvas.background(this.backgroundColor);
        if (this.showDebug) this.drawDebugText();
    
        // Interface and listeners and such when editing track. 
        this.drawTrack();
        this.drawCars();
        if (this.editingTrack) this.drawTrackEditing();
    }

    drawCars(){
        // debugging only
        if (!this.editingTrack && this.canvas.mouseIsPressed && !this.cars[0]){
            this.cars[0] = new Car(this, undefined, this.canvas.mouseX, this.canvas.mouseY);
        }
        for (let i = 0; i < this.cars.length; i++) {
            this.cars[i].draw();            
        }
    
    }

    drawDebugText(){ 
        // if (this.webGL) this.canvas.textFont('Source Code Pro');
        var offset = 11, currentOffset = 10
        this.canvas.textSize(10);
        this.canvas.fill(255);
        this.canvas.noStroke();
        this.canvas.text('wingine v0.2.1', 10, currentOffset += offset);
        this.canvas.text('fps: ' + Math.round(this.canvas.frameRate()), 10, currentOffset += offset);
        this.canvas.text('mouseX: ' + this.canvas.mouseX + ", mouseY: " + this.canvas.mouseY, 10, currentOffset += offset);
        this.canvas.text('Currently inside track: ' + !this.outOfTrack( this.canvas.mouseX, this.canvas.mouseY ) , 10, currentOffset += offset);
        if (this.editingTrack) this.canvas.text('TRACK_EDITING MODE', 10, currentOffset += offset);
    }

    // #region Track Code
    // would love to have this code in a class but it might be better to have it here :)

    drawTrack(){
        // Draw all circles that create the track.
        if (!this.tracks[this.trackIndex]) return
        this.canvas.noStroke()

        for (let i = 0; i < this.tracks[this.trackIndex].length; i++) {
            const c = this.tracks[this.trackIndex][i]
            this.canvas.fill(this.trackColor)
            this.canvas.circle(c[0], c[1], 100, 100)
        }
    }
    
    drawTrackEditing(){

        // Create track at index!
        if (!this.tracks[this.trackIndex]) {
            this.tracks[this.trackIndex] = []
            this.canvas.cursor();
        }
        
        // When moused is pressed, add a circle to the track.
        // TODO: Optimize with typed arrays, or even without a nested array.
        if (this.canvas.mouseIsPressed){
            var circle = new Uint16Array(2)
            circle[0] = Math.round(this.canvas.mouseX); circle[1] = Math.round(this.canvas.mouseY);
            this.tracks[this.trackIndex].push(circle);
        }

        // Current circle when moving the mouse.
        this.canvas.stroke(0);
        this.canvas.circle(this.canvas.mouseX, this.canvas.mouseY, 100, 100)  
    }

    saveCurrentTrack(){

        // Drawing the current track from scratch.
        // Should happen in one frame :)
        this.canvas.background(this.backgroundColor);
        this.drawTrack();

        this.canvas.loadPixels();
        this.log('Saving all the rendered pixels to save and reduce calculation overhead.')
        // pixelDensity() * pixelDensity() * 700x700 *  
        // length of array from the trackPixels.
        __TRACK_INDEX = this.trackIndex
        __TRACK_PIXELS = this.reduceTrackPixels(this.canvas.pixels)

        this.editingTrack = false
        alert("Saved track!");
    }


    // TODO: make track downloadable!
    importTrack(trackJSON){
        const trackId = this.tracks.length - 1;
        const json = JSON.parse(trackJSON);
        const track = [];

        // Doing a try, because a lot of things can go wrong here!
        try {
            this.log('Loading in a saved track into application!');
            for (let i = 0; i < json.length; i++){
                track.push( this.createCircleArray( Number(json[i]["0"]), Number( json[i]["1"]) ) )
            }

            this.tracks[trackId] = track
            this.trackIndex = trackId

        } catch {
            alert("You have loaded an invalid track!");
        }

    }


    // #endregion 

    // #region Track Logic 

    // Removing all the unnessacary information from the pixelArray.
    reduceTrackPixels(pixels) {
        // The UInt8ClampedArray will give a big performance boost because it is a typed array.
        var reduced = new Uint8ClampedArray( this.resolution.width * this.resolution.height );
        var pixelDensity = this.canvas.pixelDensity();
        for (let y = 0; y < this.resolution.height; y++) {
            for (let x = 0; x < this.resolution.width; x++) {
                // TODO: Golden line and should be mentioned in the PWS!
                // A sort of translation key between the two arrays.
                reduced[y * this.resolution.width + x] = pixels[ y * pixelDensity * pixelDensity * 4 * this.resolution.width + x * pixelDensity * 4 ]

                // TODO: Use bits instead of 8 bytes in __TRACK_PIXELS
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators
                // In the future uses flags and store as single bits, 0 or 1.
                // Might be faster in the future if needed.
            }            
        }
        this.log('Reduced trackPixels from', pixels.length, "to", reduced.length, "bytes.")
        return reduced
    }

    // Important function!
    // Declares if coordinate is in track or not!
    outOfTrack(x, y){
        if (this.editingTrack) return true
        // This code will run so much, it needs to be optimized! Look at bitwise flags for future optimasation.

        // TODO: Golden line and should be mentioned in the PWS!
        // for (let i = 0; i < 1000000; i++) {
        //     __TRACK_PIXELS[ Math.round(x) + Math.round(y) * this.resolution.width] == this.backgroundColor
        // }

        return __TRACK_PIXELS[ Math.round(x) + Math.round(y) * this.resolution.width] == this.backgroundColor
    }

    // #endregion 

    // Fyor gives me his Generation instance.
    trainGeneration(generation) {
       // 
    }    

    log(...args) {
        console.log("[Simulator]", ...args)
    }

    // Initializing the p5.js object with this Simulator class.
    // Passing through all the functions in this Class.
    // I don't think Fyor would understand this at all, lol.
    // PERFECT USE OF JAVASCRIPT!
    createP5InitObject(...functions){
        return pc => {
            functions.forEach( name => {
                if (this[name]) pc[name] = () => this[name]()
            })
        }     
    }
    
}

// Car that drives
class Car {

    // Should be an object.
    constructor(sim, ai, x, y, color = 20){
        this.sim = sim
        this.ai = ai
        this.x = Math.round(x);
        this.y = Math.round(y);
        this.color = color 
        // this.canvas = this.sim.canvas
    }
        
    // Drawing car
    draw(){
        this.sim.canvas.fill(this.color);
        this.sim.canvas.rect(this.x, this.y, 60, 30);
    }

}  


$(document).ready( () => {
    __SIMULATOR = new Simulator()
})


// String protoypes:   
String.prototype.upcase = function(){
    return this[0].toUpperCase() + this.substring(1)
}

String.prototype.reverse = function(){
    return this.split("").reverse().toString().replace(/,/g, "")
}

