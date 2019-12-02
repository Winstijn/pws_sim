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
        this.webGL = false;
        this.showDebug = true;
        this.resolution = {width: 700, height: 700}

        // Variables for creations of tracks and cars.
        this.tracks = []
        this.cars = []
        this.trackColor = 255
        this.circleRadius = 90
        this.backgroundColor = 120
        this.trackIndex = 0
        this.editingTrack = true;
        this.paused = false;
        this.frameRate = 60
        this.casualties = 0;
        this.generation = 1;

        var initObject = this.createP5InitObject("setup", "draw");
        this.canvas = new p5( initObject );

        this.log("Finished initializing the simulator!")

    }

    // Setup of the p5.js instance.
    setup(pc){
        this.log("p5.js libary setting up!")
        this.canvas = pc;

        this.canvas.createCanvas( this.resolution.width , this.resolution.height , this.webGL ? "webgl" : 'p2d');
        this.canvas.frameRate(this.frameRate);

        $("#center").append(this.canvas.canvas)
    }

    // Called everytime a frame needs to be rendered.
    // For documentation about drawing you can look up p5.js.
    // Never forget that order of render is important!
    draw(){
        if (this.webGL) this.canvas.translate(-0.5 * this.canvas.width, -0.5 * this.canvas.height)
        // this.editingTrack ? this.canvas.noCursor() : this.canvas.cursor();
        this.canvas.background(this.backgroundColor);
        if (this.showDebug) this.drawDebugText();

        // Interface and listeners and such when editing track.
        this.drawTrack();
        this.drawCars();
        if (this.editingTrack) this.drawTrackEditing();
    }

    drawCars(){
        var mouseOnCanvas = this.canvas.mouseX > 0 & this.canvas.mouseX < this.resolution.width && this.canvas.mouseY > 0 && this.canvas.mouseY < this.resolution.height;

        if (!this.editingTrack && this.canvas.mouseIsPressed && mouseOnCanvas){
          firstGen();
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
        this.canvas.text('mouseX: ' + Math.round(this.canvas.mouseX) + ", mouseY: " + Math.round(this.canvas.mouseY), 10, currentOffset += offset);
        this.canvas.text('Currently inside track: ' + !this.outOfTrack( this.canvas.mouseX, this.canvas.mouseY ) , 10, currentOffset += offset);
        this.canvas.text('Generation: ' + this.generation, 10, currentOffset += offset);

        if (this.editingTrack) this.canvas.text('TRACK_EDITING MODE', 10, currentOffset += offset);
    }

    // #region Track Code
    // would love to have this code in a class but it might be better to have it here :)

    drawTrack(){
        // Draw all circles that create the track.
        if (!this.tracks[this.trackIndex]) return

        for (let i = 0; i < this.tracks[this.trackIndex].length; i++) {
            const c = this.tracks[this.trackIndex][i]
            this.canvas.noStroke()
            this.canvas.fill(this.trackColor)
            this.canvas.circle(c[0], c[1], this.circleRadius, this.circleRadius)
        }

        // Disabled for now!
        // Lines between the circles!
        if (this.showDebug && false) {
            for (let i = 0; i < this.tracks[this.trackIndex].length; i++) {
                const c = this.tracks[this.trackIndex][i]
                const nextC = this.tracks[this.trackIndex][i + 1]
                if (nextC) {
                    this.canvas.stroke(20);
                    this.canvas.fill(70)
                    this.canvas.line(c[0], c[1], nextC[0], nextC[1])
                }
            }
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
            this.tracks[this.trackIndex].push( this.createCircleArray( this.canvas.mouseX, this.canvas.mouseY ) );
        }

        // Current circle when moving the mouse.
        this.canvas.stroke(0);
        this.canvas.circle(this.canvas.mouseX, this.canvas.mouseY, this.circleRadius, this.circleRadius)
    }

    // Refactored because this code is used multiple times.
    createCircleArray(x, y){
        var circle = new Uint16Array(2)
        circle[0] = Math.round(x); circle[1] = Math.round(y);
        return circle
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
        // alert("Saved track!");
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


    exportTrack(trackId){
      var currentTrack = __SIMULATOR.tracks[trackId];
      var trackArray = [];
      for(var circle of currentTrack){
        trackArray.push({
          "0": circle[0],
          "1": circle[1]
        })
      }
      const exportedTrack = JSON.stringify(trackArray);

      console.log(exportedTrack);
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

    // #endregion Track Logic


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
              if (this[name]) pc[name] = () => this[name](pc)
          })
        }
    }

}

// Car that drives
// TODO: Explain in PWS!
class Car {

    // Input should be an object.
    constructor(sim, ai, x, y, color){
        // console.log(x)
        this.sim = sim;
        this.isAlive = true;
        if (ai) {
          this.ai = ai;
          this.ai.car = this;
        } else {
          this.ai = new DrivingAI( { in_nodes:7, hidden_nodes:8, output_nodes:2, car: this } );
        }
        this.x = Math.round(x);
        this.y = Math.round(y);
        this.velocityX = 0; // In Pixels per Frame.
        this.velocityY = 0; // in Pixels per Frame.
        this.accel = 0 // In Pixels per Frame per Frame

        // Needs to be recalculated for in the real world!
        this.accelResistance = 0.25 // Decay of 1 pixel per frame per frame per frame
        this.standardAccel = 2

        if (color) {
          this.color = color;
        } else{
          this.color = 20
        }
        this.width = 20
        this.height = 30


        // Still needs to be thought of!
        this.steer = Math.PI / 2 // Radians!
    }

    // Drawing car 60 times a second.
    // Placing of functions is fital in this function.
    // Watch out and test before changing something here.
    draw(){
        // If it's dead, don't render it.
        if(!this.isAlive) return

        // Check if car is in a wall, because we kill it, if it is!
        this.collisionDetection();

        this.sim.canvas.fill(this.color);
        // this.sim.canvas.translate( Math.cos(this.steer), Math.sin(this.steer) )

        // Drawing actual car at X and Y positions
        this.drawCar();

        if (!__SIMULATOR.paused){
          // Calculate distances from the walls!
          this.calculateDistances();

          // Controlling one vehicle with the keys!
          //this.checkControls();
          this.ai.predictDrive();

          // Updating pixelPositions and values.
          this.updatePhysics();
        }
        if (__SELECTEDNN != undefined && __SIMULATOR.paused && __SIMULATOR.cars[__SELECTEDNN] == this) {
          console.log("color");
          this.color = 100;
        } else {
          this.color = 20;
        }
    }

    drawCar(){
        // This translate and rotate needs to be explained!
        // The Pop and Push reset the translate and rotate for the next car!
        // The pop and push might not be the best solution!
        this.sim.canvas.push()

        this.sim.canvas.rectMode(this.sim.canvas.CENTER)
        this.sim.canvas.translate(this.x, this.y);
        this.sim.canvas.rotate(this.steer)
        this.sim.canvas.rect(0 , 0, this.height, this.width);

        this.sim.canvas.pop();
    }


    updatePhysics(){
        this.x = this.velocityX + this.x
        this.y = this.velocityY + this.y

        // Accelartion needs to be computed to compontents
        this.velocityX = this.accel * Math.cos( this.steer );
        this.velocityY = this.accel * Math.sin( this.steer );

        // Decay accelaration.

        // TODO: Explain in PWS!
        // Er is een weerstand en die geldt voor het acceleren!
        if (this.accel > 0) {
            (this.accel - this.accelResistance < 0 || this.accel == 0) ? this.accel = 0 : this.accel -= this.accelResistance
        } else {
            (this.accel - this.accelResistance > 0 || this.accel == 0) ? this.accel = 0 : this.accel += this.accelResistance
        }

    }

    // Pfft hell of a function
    // TODO: Uitleggen in het PWS
    calculateDistances(){
        const halfWidth = this.width / 2
        const halfHeight = this.height / 2

        // Front, with a (0, 1) vector
        // Need to think of a way to richtingsvector.
        this.sim.canvas.stroke(126)
        // Wat een clusterfuck
        // var front = this.calculateDistance( -halfWidth * Math.cos( this.steer ), -halfHeight * Math.sin( this.steer ),  -Math.cos( this.steer ), -Math.sin( this.steer ) )
        // var left = this.calculateDistance( - halfWidth * Math.cos( this.steer - Math.PI / 2),  -halfHeight * Math.sin( this.steer - Math.PI / 2),  -Math.cos( this.steer - Math.PI / 2 ), -Math.sin( this.steer - Math.PI / 2)  )

        var front = this.calculateDistance( -Math.cos( this.steer ), -Math.sin( this.steer ) )
        var frontLeft = this.calculateDistance( -Math.cos( this.steer - Math.PI / 4 ), -Math.sin( this.steer - Math.PI / 4))
        var frontRight = this.calculateDistance( -Math.cos( this.steer + Math.PI / 4 ), -Math.sin( this.steer + Math.PI / 4))
        var left = this.calculateDistance( -Math.cos( this.steer - Math.PI / 2 ), -Math.sin( this.steer - Math.PI / 2))
        var right = this.calculateDistance( -Math.cos( this.steer + Math.PI / 2 ), -Math.sin( this.steer + Math.PI / 2))

        this.sensors = [front, frontLeft, frontRight, left, right]
        // var right = this.calculateDistance( -halfWidth * Math.cos( this.steer +  Math.PI / 2),  -halfHeight * Math.sin( this.steer  + Math.PI / 2),  -Math.cos( this.steer + Math.PI / 2 ), -Math.sin( this.steer + Math.PI / 2)  )
        //this.showDebugDistances(front ,frontLeft, frontRight, left, right );
    }

    showDebugDistances(front ,frontLeft, frontRight, left, right){
        if (!this.sim.showDebug) return
        var offset = 11, currentOffset = 10
        this.sim.canvas.push();
        this.sim.canvas.textSize(10);
        this.sim.canvas.fill(255);
        this.sim.canvas.noStroke();
        this.sim.canvas.textAlign(this.sim.canvas.RIGHT);
        this.sim.canvas.text('Car Distances', this.sim.canvas.width - 10, currentOffset += offset);
        this.sim.canvas.text('front: ' + Math.round(front) , this.sim.canvas.width - 10, currentOffset += offset);
        this.sim.canvas.text('frontLeft: ' + Math.round(frontLeft) , this.sim.canvas.width - 10, currentOffset += offset);
        this.sim.canvas.text('frontRight: ' + Math.round(frontRight) , this.sim.canvas.width - 10, currentOffset += offset);
        this.sim.canvas.text('left: ' + Math.round(left) , this.sim.canvas.width - 10, currentOffset += offset);
        this.sim.canvas.text('right: ' + Math.round(right) , this.sim.canvas.width - 10, currentOffset += offset);
        this.sim.canvas.pop();

        // this.sim.canvas.text('Currently inside track: ' + !this.outOfTrack( this.sim.canvas.mouseX, this.sim.canvas.mouseY ) , 10, currentOffset += offset);
    }

    // Input a richtingsvector and starting point!
    // Making small steps
    calculateDistance(vecX, vecY){
        // Starting point, vec
        var distance = 0
        var startX = this.x, startY = this.y
        var x = startX, y = startY

        while ( !this.sim.outOfTrack( x, y ) ) {
            x += vecX; y += vecY;
        }
        distance = Math.sqrt( Math.pow( startX - x , 2) + Math.pow( startY - y, 2) );
        //this.sim.canvas.line(startX, startY, x, y);
        return distance

    }

    checkControls(){
            // We are not using a switch because we want to support multiple button presses!

            // Press: S (going backwards)
            if (this.sim.canvas.keyIsDown(83) ) this.accel = this.standardAccel

            // Press: W (going forward)
            if (this.sim.canvas.keyIsDown(87)) this.accel = -this.standardAccel

            // Press: A (steering left)
            if (this.sim.canvas.keyIsDown(65)) this.steer -= Math.PI / 64

            // Press: D (steering right)
            if (this.sim.canvas.keyIsDown(68)) this.steer += Math.PI / 64
    }


    //Collision detection system for the car itself.
    collisionDetection(){
      var halfWidth = 0.5*this.width;
      var halfHeight = 0.5*this.height;

      //Car coordinates
      var topLeft = {
        x:this.x - halfWidth+this.velocityX,
        y:this.y - halfHeight+this.velocityY
      }

      var topRight = {
        x:this.x + halfWidth+this.velocityX,
        y:this.y - halfHeight+this.velocityY
      }

      var bottomLeft = {
        x:this.x - halfWidth+this.velocityX,
        y:this.y + halfHeight+this.velocityY
      }

      var bottomRight = {
        x:this.x + halfWidth+this.velocityX,
        y:this.y + halfHeight+this.velocityY
      }

      var points = [topLeft, topRight, bottomLeft, bottomRight];
      // Check for in track
      var point;
      for(point of points){
        if (__SIMULATOR.outOfTrack(point.x, point.y)) {
          this.isAlive = false;
          __SIMULATOR.casualties += 1
          addNN(this);
          break;
        }
      }

      let minSpeed = (Math.abs(this.velocityX) + Math.abs(this.velocityY));
      if (this.isAlive && this.ai && this.ai.fitness > 20 && minSpeed < 1) {
          this.isAlive = false;
          __SIMULATOR.casualties += 1
          addNN(this);
          console.log("Someone was too slow")
      }

    }

}


$(document).ready( () => {
    __SIMULATOR = new Simulator();
    __POPULATION = 50;


    // For debugging:
    __SIMULATOR.importTrack(testTrack2);
    setTimeout( () => __SIMULATOR.saveCurrentTrack(), 200)
})


// String protoypes:
String.prototype.upcase = function(){
    return this[0].toUpperCase() + this.substring(1)
}

String.prototype.reverse = function(){
    return this.split("").reverse().toString().replace(/,/g, "")
}
