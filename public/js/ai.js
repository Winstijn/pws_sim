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

          //console.log(`Fitness: ${this.fitness}`);
          //console.log(`Distance traveled: ${this.dDistance}`);

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
  let evolvedArray = [];
  if (__NEURALNETWORKS.length > 1) {
    sortedArray = selectionSort(__NEURALNETWORKS);
    evolvedArray = evolveGen(sortedArray);
  } else {
    evolvedArray = __NEURALNETWORKS;
  }
  __NEURALNETWORKS = [];
  //testNN = sortedArray[0];


__SIMULATOR.cars = []
  for (let i = 0; i < __POPULATION; i++) {
    let coppiedNN = evolvedArray[i];
    let randomNmbr = Math.random();
    if (randomNmbr < 1) {
      let multiplyer = __SIMULATOR.canvas.random(-1, 1);
      coppiedNN.mutate(x => x*multiplyer);
    }

     __SIMULATOR.cars[i] = new Car(__SIMULATOR, evolvedArray[i], __SIMULATOR.spawnPoint.x, __SIMULATOR.spawnPoint.y);
   }
   //__SIMULATOR.cars[0] = new Car(__SIMULATOR, sortedArray[0].copy(), __SIMULATOR.spawnPoint.x, __SIMULATOR.spawnPoint.y, 180);
    //let newNN = crossOver(sortedArray[0], sortedArray[1]);
   //__SIMULATOR.cars.unshift(new Car(__SIMULATOR, testNN.copy(), __SIMULATOR.spawnPoint.x, __SIMULATOR.spawnPoint.y, 200))
}

function evolveGen(arr){
  let n = __POPULATION;
  let evolvedGen = [];
  let evolveable = Math.floor((1 + Math.sqrt(8*n))/2);
  let survivors = arr.slice(0, evolveable+1);
  let crossOverPotential = (evolveable*(evolveable -1))/2;
  let multiplyer = __SIMULATOR.canvas.random(-0.1, 0.1);

  if (crossOverPotential < n) {
    let difference = n - crossOverPotential;
    for (var i = 0; i < difference; i++) {
      let bestNN = arr[0].copy();
      bestNN.mutate(x => x * multiplyer)
      evolvedGen.push(bestNN)
    }
  }
  for (var i = 0; i < survivors.length-1; i++) {
    for (var j = i+1; j < survivors.length; j++) {
      evolvedGen.push(crossOver(arr[i], arr[j]));
    }
  }
  return evolvedGen;
}

function crossOver(a, b) {
  let networkA = a.copy();
  let networkB = b.copy();

  networkA.bias_h = networkA.bias_h.combine(networkB.bias_h);
  networkA.bias_o = networkA.bias_o.combine(networkB.bias_o);
  networkA.weights_ho = networkA.weights_ho.combine(networkB.weights_ho);
  networkA.weights_ih = networkA.weights_ih.combine(networkB.weights_ih);
  return networkA;
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
