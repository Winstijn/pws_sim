//
//  PWS AI
//  ai.js
//
//  Created by Fyor Klein Gunnewiek
//  Copyright © 2019 Kaziaat B.V. All rights reserved.
//

class DrivingAI extends NeuralNetwork {

    // constructor(in_nodes, hidden_nodes, output_nodes, car) {
    constructor(settings){
      settings instanceof DrivingAI ? super(settings) : super(settings.in_nodes, settings.hidden_nodes, settings.output_nodes)
      this.inputs = [];
      this.fitness = 0;
      this.dDistance = 0;
      this.car = settings.car;

    }
    //Overwriting the one in NN
    copy(){
      return new DrivingAI(this);
    }

    // called everyframe
    predictDrive(){
        // Put inputs here!
        if (__SIMULATOR.casualties == __POPULATION) {
          __SIMULATOR.casualties = 0;
          nextGen();
        } else {
          if (!this.car.sensors) {this.car.sensors = [0, 0, 0, 0, 0];}

          this.inputs = [];
          let trackWith = __SIMULATOR.circleRadius * 2;
          for (var i=0; i< this.car.sensors.length; i++) {
            this.inputs.push(this.car.sensors[i] / trackWith);
          }
          this.inputs.push(this.car.steer);
          this.inputs.push(this.car.accel);

          const output = this.predict(this.inputs);

          this.car.accel = -this.car.standardAccel * output[0];
          this.car.steer = output[1] * Math.PI;
          this.fitness++;
          this.dDistance += Math.abs(this.car.accel);

          console.log(`Fitness: ${this.fitness}`);
          console.log(`Distance traveled: ${this.dDistance}`);

        }
    }
}

function firstGen() {
  if (!firstGenCalculated) {
    firstGenCalculated = true;
    __SIMULATOR.spawnPoint = {
      x: __SIMULATOR.canvas.mouseX,
      y: __SIMULATOR.canvas.mouseY
    }
    for (let i = 0; i < __POPULATION; i++) {
       __SIMULATOR.cars[i] = new Car(__SIMULATOR, undefined, __SIMULATOR.spawnPoint.x, __SIMULATOR.spawnPoint.y);
    }
  }

}

function nextGen(){
  let sortedArray = [];
  if (__NEURALNETWORKS.length > 1) {
    console.log("dies reon");
    sortedArray = selectionSort(__NEURALNETWORKS);
  } else {
    sortedArray = __NEURALNETWORKS;
  }
  __NEURALNETWORKS = [];
  testNN = sortedArray[0];

  evolveGen();

__SIMULATOR.cars = []
  for (let i = 0; i < __POPULATION; i++) {
    let multiplyer = Math.random();
    let coppiedNN = sortedArray[i].copy();
    //coppiedNN.mutate(x => x);
    coppiedNN.mutate(x => x);
     __SIMULATOR.cars[i] = new Car(__SIMULATOR, coppiedNN, __SIMULATOR.spawnPoint.x, __SIMULATOR.spawnPoint.y);
   }
   //__SIMULATOR.cars.unshift(new Car(__SIMULATOR, testNN.copy(), __SIMULATOR.spawnPoint.x, __SIMULATOR.spawnPoint.y, 200))

}

function evolveGen(){
  for (var i = 0; i < __NEURALNETWORKS.length; i++) {

  }

}

//Source https://khan4019.github.io/front-end-Interview-Questions/sort.html
function selectionSort(arr){
  var minIdx, temp,
      len = arr.length;
  for(var i = 0; i < len; i++){
    minIdx = i;
    for(var  j = i+1; j<len; j++){
      let arr1 = arr[j].fitness + 2* Math.round(arr[j].dDistance);
      let arr2 = arr[minIdx].fitness + 2* Math.round(arr[minIdx].dDistance);
       if(arr1>arr2){
          minIdx = j;
       }
    }
    temp = arr[i];
    arr[i] = arr[minIdx];
    arr[minIdx] = temp;
  }
  return arr;
}


function addNN(car) {
  __NEURALNETWORKS.unshift(car.ai);
}

$(document).ready( () => {
  __EVOLVEDNN = [];
  __NEURALNETWORKS = [];
  firstGenCalculated = false;
})
