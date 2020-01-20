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
        this.webGL = true
        this.trainingMode = true;
        this.showDebug = true;
        this.realLife = true;
        this.realCar = true
        this.resolution = {width: this.realLife ? 1400 : 700, height: 700}

        // Variables for creations of xtracks and cars.
        this.tracks = []
        this.trackPoints = []
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

        // Creating separate canvas to draw the track on. For performance reasons!
        // TODO: PWS!
        this.trackCanvas = this.canvas.createGraphics( this.resolution.width * pc.pixelDensity() , this.resolution.height * pc.pixelDensity(), this.webGL ? "webgl" : 'p2d' )
        this.canvas.createCanvas( this.resolution.width , this.resolution.height , this.webGL ? "webgl" : 'p2d');
        this.canvas.frameRate(this.frameRate);
        this.canvas.pixelDensity(2);
        this.trackCanvas.pixelDensity(2);


        if (this.webGL) {
            this.fontRegular = this.canvas.loadFont('fonts/Regular.otf');
            this.canvas.textFont(this.fontRegular)
        }
        this.carImage = this.canvas.loadImage('images/tesla.png');

        $("#center").append(this.canvas.canvas)
    }

    // Called everytime a frame needs to be rendered.
    // For documentation about drawing you can look up p5.js.
    // Never forget that order of render is important!

    // TODO:
    // THIS BREAKS PERFORMANCE?
    // var pixels = __SIMULATOR.canvas.drawingContext.getImageData(0, 0, __SIMULATOR.canvas.width * __SIMULATOR.canvas.pixelDensity(), __SIMULATOR.canvas.height * __SIMULATOR.canvas.pixelDensity());

    draw(){
        if (this.webGL) this.canvas.translate(-0.5 * this.canvas.width, -0.5 * this.canvas.height)
        // this.editingTrack ? this.canvas.noCursor() : this.canvas.cursor();

        this.canvas.background(this.backgroundColor);
        this.drawTrack();

        if (this.showDebug) this.drawDebugText();

        // Interface and listeners and such when editing track.
        this.drawCars();
        if (this.editingTrack) this.drawTrackEditing();
    }

    drawCars(){
        var mouseOnCanvas = this.canvas.mouseX > 0 & this.canvas.mouseX < this.resolution.width && this.canvas.mouseY > 0 && this.canvas.mouseY < this.resolution.height;

        if (!this.editingTrack && this.canvas.mouseIsPressed && mouseOnCanvas){
          this.setSpawnPoint();
          this.trainingMode ? firstGen() : this.spawnControlableCar()
        }
        if (__SIMULATOR.casualties >= __POPULATION) {
          __SIMULATOR.casualties = 0;
          nextGen();
        } else {
          for (let i = 0; i < this.cars.length; i++) {
              this.cars[i].draw();
          }
        }

    }

    drawDebugText(){
        // if (this.webGL) this.canvas.textFont('Source Code Pro');
        var offset = 11, currentOffset = 10
        this.canvas.textSize(10);
        this.canvas.fill(255);
        this.canvas.noStroke();
        this.canvas.text('wingine v0.4.1', 10, currentOffset += offset);
        this.canvas.text('fps: ' + Math.round(this.canvas.frameRate()), 10, currentOffset += offset);
        // this.canvas.text('mouseX: ' + Math.round(this.canvas.mouseX) + ", mouseY: " + Math.round(this.canvas.mouseY), 10, currentOffset += offset);
        // this.canvas.text('Currently inside track: ' + !this.outOfTrack( this.canvas.mouseX, this.canvas.mouseY ) , 10, currentOffset += offset);
        
        // Text in Freemode
        if (!this.trainingMode && this.cars.length > 0) this.canvas.text('Sector: ' + this.cars[0].currentSector, 10, currentOffset += offset);
        if (!this.trainingMode && this.cars.length > 0) this.canvas.text('Speed: ' +  Math.round(this.cars[0].distanceInLastFrame) + "m/s", 10, currentOffset += offset);
        if (!this.trainingMode && this.cars.length > 0) this.canvas.text('Actual Steer: ' +  this.cars[0].steer.toFixed(3) + " rad.", 10, currentOffset += offset);
        if (!this.trainingMode && this.cars.length > 0) this.canvas.text('Desired Steer: ' +  this.cars[0].desiredSteer.toFixed(3) + " rad.", 10, currentOffset += offset);
        if (!this.trainingMode && this.cars.length > 0) this.canvas.text('Rotation Angle: ' +  Math.round(this.cars[0].rotationAngle) + " rad.", 10, currentOffset += offset);
        if (!this.trainingMode && this.cars.length > 0) this.canvas.text('Rotation Speed: ' +  Math.round(this.cars[0].rotationVelocity) + " rad/s", 10, currentOffset += offset);

        if (!this.trainingMode && this.cars.length > 0) this.canvas.text('FREEMODE', 10, currentOffset += offset);

        if (this.trainingMode) this.canvas.text('Generation: ' + this.generation, 10, currentOffset += offset);
        if (this.editingTrack) this.canvas.text('TRACK_EDITING MODE', 10, currentOffset += offset);
    }

    // #region Track Code
    // would love to have this code in a class but it might be better to have it here :)

    // Draw the current track to the buffer.
    // Helps a lot with performance because circles do not have to be drawn every time!
    // P.S. Could be used in the Pixelhobby Designer!
    drawTrackBuffer(){
        if (this.trackCanvas) {
            this.trackCanvas.background(this.backgroundColor);
            if (!this.tracks[this.trackIndex]) return
            for (let i = 0; i < this.tracks[this.trackIndex].length; i++) {
                const c = this.tracks[this.trackIndex][i]
                this.trackCanvas.noStroke()
                this.trackCanvas.fill(this.trackColor)
                this.trackCanvas.circle(c[0], c[1], this.circleRadius, this.circleRadius)
            }
        }
    }

    drawTrack(){
        // Draw all circles that create the track.
        if (!this.tracks[this.trackIndex]) return
        if (this.editingTrack) this.drawTrackBuffer()
        this.canvas.image(this.trackCanvas, -0.5 * this.canvas.pixelDensity() * this.canvas.width,  -0.5 * this.canvas.pixelDensity() * this.canvas.height);

        // For drawing the points on the track that make out the sectors.
        if (this.showDebug && this.trackPoints.length > 0) {
            this.canvas.push()

            for (let i = 0; i < this.trackPoints.length; i++) {
                const point = this.trackPoints[i]

                const setPointStroke = () => {
                    this.canvas.stroke('purple');
                    this.canvas.strokeWeight(5 * this.canvas.pixelDensity());
                }
                setPointStroke();

                if (this.spawnPoint && i == this.spawnPoint.sectorID) {
                    // Ik weet het lelijke code, maar anders kon ik de kleur niet veranderen.
                    // Kleur voor de spawnpoint
                    this.canvas.stroke('magenta');
                    this.canvas.strokeWeight(7 * this.canvas.pixelDensity());
                    this.canvas.point(point[0], point[1]);
                    setPointStroke();
                } else {
                    this.canvas.point(point[0], point[1]);
                }
            }

            // Kleur voor de huidige sector punt.
            if (this.cars.length > 0 && !this.trainingMode) {
                this.canvas.stroke('orange');
                this.canvas.strokeWeight(7 * this.canvas.pixelDensity());

                const closestPoint = this.findClosestSector(this.cars[0].x, this.cars[0].y);
                this.canvas.point(closestPoint[0], closestPoint[1]);
            }

            this.canvas.pop();
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

        // drawingContext.getImageData(0, 0, width * pixelDensity(), height * pixelDensity());
        // Happens in code, but why does it slow down when called?

        // Also slows down?
        // var pixels = this.canvas.drawingContext.getImageData(0, 0, this.canvas.width * this.canvas.pixelDensity(), this.canvas.height * this.canvas.pixelDensity());

        this.log('Saving all the rendered pixels to save and reduce calculation overhead.')
        // pixelDensity() * pixelDensity() * 700x700 *
        // length of array from the trackPixels.
        __TRACK_INDEX = this.trackIndex
        __TRACK_PIXELS = this.reduceTrackPixels(this.canvas.pixels)

        // Separates the track in multiple points
        this.calculateTrackPoints();
        this.editingTrack = false
    }


    // TODO: make track downloadable!
    importTrack(trackJSON){
        const trackId = this.tracks.length == 0 ? 0 : this.tracks.length - 1;
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

                if (this.webGL){
                    // WebGL had a differnt viewbuffer coordinate system.
                    // Begins in the left bottom corner.
                    reduced[y * this.resolution.width + x] = pixels[ (pixels.length - y * pixelDensity * pixelDensity * 4 * this.resolution.width) + x * pixelDensity * 4 ]
                } else {
                    // Begins in the left top corner.
                    reduced[y * this.resolution.width + x] = pixels[ y * pixelDensity * pixelDensity * 4 * this.resolution.width + x * pixelDensity * 4 ]
                }
                
                // TODO: Use bits instead of 8 bytes in __TRACK_PIXELS
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators
                // In the future uses flags and store as single bits, 0 or 1.
                // Might be faster in the future if needed.
            }
        }
        this.log('Reduced trackPixels from', pixels.length, "to", reduced.length, "bytes.")
        return reduced
    }

    calculateTrackPoints(){
        var circles = this.tracks[this.trackIndex].slice()
        var points = []
        for (let i = 0; i < circles.length; i++) {
            const point = circles[i]
            var distanceNextPoint = 0
            var pointIndex = i
            var allPointsFinished = false
            var possibleNextPoint
            while (distanceNextPoint < this.circleRadius / 16 && !allPointsFinished) {
                pointIndex++
                possibleNextPoint = circles[pointIndex]
                if (possibleNextPoint) distanceNextPoint = Math.round( Math.sqrt(  Math.pow(Math.round(point[0] - possibleNextPoint[0]), 2 )  + Math.pow(Math.round(point[1] - possibleNextPoint[1]), 2 ) ) )
                if (!possibleNextPoint) allPointsFinished = true
            }

            if (possibleNextPoint) {
                points.push(possibleNextPoint)
            }
            i = pointIndex
        }
        this.trackPoints = points
        return points
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

    setSpawnPoint(){
        if (!this.spawnPoint) {
            if (this.trackPoints.length == 0) { alert("Track Point are not calculated"); return}
            const point = this.findClosestSector(__SIMULATOR.canvas.mouseX, __SIMULATOR.canvas.mouseY);
            this.spawnPoint = {
                x: point[0],
                y: point[1],
                sectorID: this.trackPoints.indexOf(point)
              }
        }
    }

    createSpawnPoint(){
        if (!this.spawnPoint) {
            if (this.trackPoints.length == 0) { alert("Track Point are not calculated"); return}
            const point = this.trackPoints[0];
            this.spawnPoint = {
                x: point[0],
                y: point[1],
                sectorID: 0
              }
        }
    }

    findClosestSector(x, y){
        if (!this.trackPoints) return "No track points."

        var lowestDistance = Infinity
        var closestPoint = [0,0]
        for (let i = 0; i < this.trackPoints.length; i++) {
            const point = this.trackPoints[i];

            // Testing the distance methods.
            const distanceToCar = Math.pow(point[0] - x, 2) + Math.pow(point[1] - y, 2) 
            if (distanceToCar < lowestDistance) {
                lowestDistance = distanceToCar
                closestPoint = point
            }
        }    
        // debugger
        return closestPoint
    }


    // #endregion Track Logic

   
    spawnControlableCar(){
        // if (this.cars.length == 0){
            this.cars[0] = new Car(__SIMULATOR, undefined, __SIMULATOR.spawnPoint.x, __SIMULATOR.spawnPoint.y);
        // }
    }

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
        this.color = [this.sim.canvas.random(255), this.sim.canvas.random(255), this.sim.canvas.random(255)];
        if (ai) { this.ai = ai; this.ai.car = this; } else { this.ai = new DrivingAI( { in_nodes: 5, hidden_nodes:8, output_nodes:2, car: this } );}
        
        // Properties of the car.
        // Need to be realistic and tested.
        // 1 PIXEL = 1 CM in the current scale!
        this.width = 20
        this.height = 40 // 40
        this.wheelBaseLength = 40 - 10
        this.invicible = !this.sim.trainingMode && true;
        this.maxSteer = Math.PI / 3 // Maximale hoek de een wiel kan maken
        this.steerSpeed = this.maxSteer / 0.5 // Snelheid dat de stuuras kan veranderen per seconde.
       
        // TODO:
        // Add max steering angle
        // Add steering speed.
        // Add reaction time, etc.

        // MOVEMENT: 
        this.x = Math.round(x);
        this.y = Math.round(y);
        this.velocityX = 0; // In Pixels per Frame.
        this.velocityY = 0; // in Pixels per Frame.
        this.accel = 0 // In Pixels per Frame per Frame

        // TODO: REWORK THIS!
        // Acceleration and Resistance for the movement of the car.
        this.accelResistance = 1 // Decay of 1 pixel per frame per frame per frame
        this.standardAccel = 10
       
        // SECTOR:
        this.currentSector = 0
        this.sectorTime = 0 

        //STEERING MECHANICS:
        this.desiredSteer = 0 // We have control of this!
        this.steer = 0 // Actual wheel position of the car. (Stuur- as)
        this.rotationAngle = Math.PI / 2
        this.rotationVelocity = 0

        // Distance car has travalled in last frame. aka speed.
        this.distanceInLastFrame = 0 
        this.steerChanges = [0]
        this.averageSteerChange = 0
    }

    // Drawing car 60 times a second.
    // Placing of functions is fital in this function.
    // Watch out and test before changing something here.
    draw(){
        // If it's dead, don't render it.
        if(!this.isAlive) return

        // Check if car is in a wall, because we kill it, if it is!
        this.collisionDetection();
        this.sim.canvas.fill(0);

        // Drawing actual car at X and Y positions
        this.drawCar();

        if (!__SIMULATOR.paused){
          // Calculate distances from the walls!
          this.calculateDistances();
          this.findCurrentSector();

          // Controlling one vehicle with the keys!

          if (this.sim.trainingMode){
              if (this.sim.canvas.frameCount % 15) this.ai.predictDrive()
          } else {
              this.checkControls()
          }

          // Updating pixelPositions and values.
          this.updatePhysics();
        }

        this.updateAverageSteerChanges()

    }

    drawCar(){
        // This translate and rotate needs to be explained!
        // The Pop and Push reset the translate and rotate for the next car!
        // The pop and push might not be the best solution!
        this.sim.canvas.push()

        this.sim.canvas.rectMode(this.sim.canvas.CENTER)
        // this.sim.canvas.imageMode(this.sim.canvas.CENTER)
        this.sim.canvas.translate(this.x, this.y);
        this.sim.canvas.rotate(this.rotationAngle)

        if (this.sim.realCar) {
            this.sim.canvas.tint(...this.color);
            this.sim.canvas.image(this.sim.carImage, -this.height / 2, -this.width / 2,this.height, this.width)
        } else {
            this.sim.canvas.rect(0 , 0, this.height, this.width);
        }

        this.sim.canvas.pop();
    }


    updatePhysics(){
        this.x = this.velocityX + this.x
        this.y = this.velocityY + this.y
        this.distanceInLastFrame = Math.sqrt( Math.pow(this.velocityX , 2) + Math.pow(this.velocityY, 2) )

        // Steering Physics:
        // https://asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html
        this.updateSteer();
        const steerRadius = this.wheelBaseLength / Math.sin(this.steer)
        this.rotationVelocity = this.distanceInLastFrame / steerRadius 
        this.rotationAngle += this.rotationVelocity

        // Accelartion needs to be computed to compontents.
        // Needs to be reworked.
        this.velocityX = this.accel * Math.cos( this.rotationAngle );
        this.velocityY = this.accel * Math.sin( this.rotationAngle );

        // Decay accelaration.

        // TODO: Explain in PWS!
        // Er is een weerstand en die geldt voor het acceleren!
        if (this.accel > 0) {
            (this.accel - this.accelResistance < 0 || this.accel == 0) ? this.accel = 0 : this.accel -= this.accelResistance
        } else {
            (this.accel - this.accelResistance > 0 || this.accel == 0) ? this.accel = 0 : this.accel += this.accelResistance
        }

        this.checkSteerPhysics();
    }

    // Update the steer value to the desired one. 
    // Do this with the speed the steering wheel is able to steer.
    updateSteer(){
        if (this.desiredSteer == this.steer) return

        // Check if the steerspeed needs to be negative.
        // + Use deltaTime to not depend on frames.     
        const negativeSpeed = this.desiredSteer < this.steer
        const steerSpeed = negativeSpeed ? -this.steerSpeed : this.steerSpeed
        const newSteer = this.steer + steerSpeed * this.sim.canvas.deltaTime

        // Set the steer to the desired steer if the new steer has reached.
        if (negativeSpeed && newSteer <= this.desiredSteer ) { this.steer = this.desiredSteer; if (!this.sim.trainingMode) this.desiredSteer = 0; return }
        if (!negativeSpeed && newSteer >= this.desiredSteer ){ this.steer = this.desiredSteer; if (!this.sim.trainingMode) this.desiredSteer = 0; return }

        // Set the steer to the steer that has changed.
        // Only gets called when the steer desired is not reached.
        this.steer = newSteer
    }

    setSteer(deltaSteer){
        // When in Training mode the AI gives 0 - 1 for steering.
        if (this.sim.trainingMode) deltaSteer = (deltaSteer - 0.5) * 2 * this.maxSteer
    
        const negative = deltaSteer < 0
        // New Desired steer
        const newDesiredSteer = this.desiredSteer + deltaSteer

        // Check for bounndries of the steer.
        if (negative && newDesiredSteer < -this.maxSteer ) { this.desiredSteer = -this.maxSteer; this.addToSteerTotal(); return }
        if (!negative && newDesiredSteer > this.maxSteer ) { this.desiredSteer = this.maxSteer; this.addToSteerTotal(); return }

        // Set the new desiredSteer.
        this.desiredSteer = newDesiredSteer
        this.addToSteerTotal();
    }   

    addToSteerTotal(){
        this.steerChanges.push(Math.abs(this.steer - this.desiredSteer))
    }

    updateAverageSteerChanges(){
        this.averageSteerChange = this.steerChanges.reduce((acc, val) => acc + val) / this.steerChanges.length
    }

    // TODO: Explain, why this is needed. We kunnen niet zomaar overal sturen!
    checkSteerPhysics(){
        return
        if (this.sim.canvas.frameCount % 2 == 0){
            if ( Math.abs(this.steer - this.lastSteer) > (Math.PI / 4) ) {
                console.log("[AI Trainer] Removed car which does weird movement with steer!")
                this.suicide();
            }

            this.lastSteer = this.steer
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

        var front = this.calculateDistance( -Math.cos( this.rotationAngle ), -Math.sin( this.rotationAngle ) )
        var frontLeft = this.calculateDistance( -Math.cos( this.rotationAngle - Math.PI / 4 ), -Math.sin( this.rotationAngle - Math.PI / 4))
        var frontRight = this.calculateDistance( -Math.cos( this.rotationAngle + Math.PI / 4 ), -Math.sin( this.rotationAngle + Math.PI / 4))
        var left = this.calculateDistance( -Math.cos( this.rotationAngle - Math.PI / 2 ), -Math.sin( this.rotationAngle - Math.PI / 2))
        var right = this.calculateDistance( -Math.cos( this.rotationAngle + Math.PI / 2 ), -Math.sin( this.rotationAngle + Math.PI / 2))

        this.sensors = [front, frontLeft, frontRight, left, right]
        // var right = this.calculateDistance( -halfWidth * Math.cos( this.steer +  Math.PI / 2),  -halfHeight * Math.sin( this.steer  + Math.PI / 2),  -Math.cos( this.steer + Math.PI / 2 ), -Math.sin( this.steer + Math.PI / 2)  )
        if (!this.sim.trainingMode) this.showDebugDistances(front ,frontLeft, frontRight, left, right );
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
        if (!this.sim.trainingMode && this.sim.showDebug)this.sim.canvas.line(startX, startY, x, y);
        return distance

    }

    // Really important for AI!
    findCurrentSector(){
        const closestPoint = this.sim.findClosestSector(this.x, this.y)
        const pointID = this.sim.trackPoints.indexOf(closestPoint)
        const spawnSector = this.sim.spawnPoint.sectorID
        const relativeIndex = pointID - spawnSector
        const oldSector = this.currentSector
        this.currentSector = relativeIndex >= 0 ? relativeIndex : relativeIndex + this.sim.trackPoints.length 

        // When AI is sneaky and tries to go reverse! 
        // TODO: Describe in PWS. 
        // Cars will turns backwards for more points! Sneaaaky
        if (this.sim.trainingMode && (this.currentSector < oldSector || (oldSector == 0 && this.currentSector == this.sim.trackPoints.length - 1))){
            console.log("[AI Trainer] Removing one car that went backwards!")
            this.suicide();
            this.currentSector = oldSector
            return
        }

        // Registeren wanneer ze in de sector zijn. 
        if (this.currentSector != oldSector){
            this.sectorTime = this.ai.framesAlive || 0
        }
            
        return this.currentSector
    }

    suicide(){
        if (this.invicible) return
        this.isAlive = false
        this.sim.casualties += 1
        addNN(this);
    }

    checkControls(){
            // We are not using a switch because we want to support multiple button presses!

            // Press: S (going backwards)
            if (this.sim.canvas.keyIsDown(83) ) this.accel = this.standardAccel

            // Press: W (going forward)
            if (this.sim.canvas.keyIsDown(87)) this.accel = -this.standardAccel

            // Press: A (steering left)
            if (this.sim.canvas.keyIsDown(65)) this.setSteer(-Math.PI / 6)

            // Press: D (steering right)
            if (this.sim.canvas.keyIsDown(68)) this.setSteer(+Math.PI / 6)
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
          this.suicide();
          if (!this.sim.trainingMode && !this.invicible) setTimeout(this.sim.spawnControlableCar.bind(this.sim), 500)
          break;
        }
      }

      if (this.isAlive && this.ai && this.ai.framesAlive > 20 && this.distanceInLastFrame < 1) {
          this.suicide();
          console.log("[AI Trainer] Removing car that went too slow!")
      }

    }

}


$(document).ready( () => {
    __SIMULATOR = new Simulator();
    __POPULATION = 150;

    // For debugging:
    // __SIMULATOR.importTrack(circleTrack);
    // setTimeout( () => __SIMULATOR.saveCurrentTrack(), 1500)
})


// String protoypes:
String.prototype.upcase = function(){
    return this[0].toUpperCase() + this.substring(1)
}

String.prototype.reverse = function(){
    return this.split("").reverse().toString().replace(/,/g, "")
}
