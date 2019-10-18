//
//  PWS AI
//  ai.js
//
//  Created by Fyor Klein Gunnewiek
//  Copyright © 2019 Kaziaat B.V. All rights reserved.
//


// Example for Fyor.
class DrivingAI extends NeuralNetwork {

    constructor(settings) {
        // Calling NeuralNetworks constructor!
        super(5, 6, 2);


        this.car = settings.car
        this.inputs = [];
        this.fitness = 0;

    }

    // called everyframe
    predictDrive(){
        // Put inputs here!
        if (__SIMULATOR.casualties == __POPULATION) {
          nextGen();
        } else {
          this.inputs[0] = this.car.x / __SIMULATOR.resolution.width;
          this.inputs[1] = this.car.y / __SIMULATOR.resolution.height;
          this.inputs[2] = this.car.velocityX / __SIMULATOR.resolution.width;
          this.inputs[3] = this.car.velocityY / __SIMULATOR.resolution.height;
          this.inputs[4] = this.car.steer;
          const output = this.predict(this.inputs);

          this.car.accel = -this.car.standardAccel * output[0]
          this.car.steer = output[1] * Math.PI
        }
    }
    genGenGen(){
      //Generate Genes of Generation
      //Ik hou van deze functie naam!
    }

    nextGen(){
      evolveGen()
      for (let i = 0; i < __POPULATION; i++) {
         __SIMULATOR.cars[i] = new Car(__SIMULATOR, undefined, __SIMULATOR.canvas.mouseX, __SIMULATOR.canvas.mouseY);
       }
    }

    evolveGen(){

    }

    // Saving AI to a string!
    save(){
        //this.serialize()
    }

}

function firstGen() {
  for (let i = 0; i < __POPULATION; i++) {
     __SIMULATOR.cars[i] = new Car(__SIMULATOR, undefined, __SIMULATOR.spawnPoint.x, __SIMULATOR.);
   }
}

$(document).ready( () => {
    //firstGen()
    this.fitness++
    /*
    for (let i = 0; i < __POPULATION; i++) {

    }*/
    //__SIMULATOR_CANVAS.start(ais)

})
