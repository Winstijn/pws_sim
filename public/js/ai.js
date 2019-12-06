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
      this.framesAlive = 0
      // this.allFitness = 0
    }
    //Overwriting the one in NN
    copy(){
      return new DrivingAI(this);
    }

    // called everyframe
    predictDrive(){
        // Put inputs here!
          if (!this.car.sensors) {this.car.sensors = [0, 0, 0, 0, 0];}

          this.inputs = [];
          let trackWith = __SIMULATOR.circleRadius * 2;
          for (var i=0; i< this.car.sensors.length; i++) {
            this.inputs.push(this.car.sensors[i]);
          }
          this.inputs.push(this.car.steer);
          this.inputs.push(this.car.accel);

          const output = this.predict(this.inputs);

          // Adding accel to the car.
          this.car.accel = -this.car.standardAccel * output[0];

          // Er mag alleen maar een kant op worden gestuurd en maar 45 graden per beslissen worden veranderd.
          this.car.steer += (output[1] - 0.5) * Math.PI / 6

          this.fitness = this.car.currentSector
          this.framesAlive++
          this.allFitness += this.fitness

          this.dDistance += Math.sqrt(Math.pow(this.car.velocityX, 2) + Math.pow(this.car.velocityY, 2));

          //console.log(`Fitness: ${this.fitness}`);
          //console.log(`Distance traveled: ${this.dDistance}`);


    }
    mutateBy(chance){
      if (Math.random() < chance) {
        this.mutate();
      }
    }
}

function firstGen() {
  if (!firstGenCalculated) {
    firstGenCalculated = true;

    for (let i = 0; i < __POPULATION; i++) {
       __SIMULATOR.cars[i] = new Car(__SIMULATOR, undefined, __SIMULATOR.spawnPoint.x, __SIMULATOR.spawnPoint.y);
    }
  }

}

function nextGen(){
  __SIMULATOR.cars = [];
  __SIMULATOR.generation++;
  let sortedArray = [];
  let evolvedArray = [];
  if (__NEURALNETWORKS.length > 1) {
    if (__NEURALNETWORKS[0].car) {
      sortedArray = winstijnSort(__NEURALNETWORKS)
    } else {
      sortedArray = __NEURALNETWORKS;
    }
    __BESTAI = sortedArray[0].copy();
    evolvedArray = evolveGen(sortedArray);
    for (let i = 0; i < __POPULATION; i++) {
      let coppiedNN = evolvedArray[i];
      coppiedNN.mutateBy(__MUTATECHANCEPERAI);

       __SIMULATOR.cars[i] = new Car(__SIMULATOR, evolvedArray[i], __SIMULATOR.spawnPoint.x, __SIMULATOR.spawnPoint.y);
     }
  } else {
    evolvedArray = __NEURALNETWORKS;
    !__SIMULATOR.spawnPoint ? __SIMULATOR.createSpawnPoint() : "";
    __SIMULATOR.cars[0] = new Car(__SIMULATOR, evolvedArray[0], __SIMULATOR.spawnPoint.x, __SIMULATOR.spawnPoint.y);

  }
  __NEURALNETWORKS = [];
}

function evolveGen(arr){
  let evolvedGen = [];
  if (__MUTATEBYTWO == true) {
    let firstBest = arr[0]
    let secondBest = arr[1];
    let combined = crossOver(firstBest, secondBest);
    if (__POPULATION < 3) {
      console.log("Mutate by two has to have at least 3 cars");
    } else {
      let mutatePercentage = [0.1, 0.01];
      let thirdOfPop = Math.floor(__POPULATION/3);
      for (var i = 0; i < mutatePercentage.length; i++) {
        for (var i = 0; i < thirdOfPop; i++) {
          let newNN = combined.copy();
          newNN.mutateAll(mutatePercentage[i]);
          evolvedGen.push(newNN);
        }
      }
      let difference = __POPULATION - evolvedGen.length;
      for (var i = 0; i < difference; i++) {
        evolvedGen.push(new DrivingAI( { in_nodes:7, hidden_nodes:8, output_nodes:2} ));
      }
    }
    return evolvedGen;


  } else {
    let n = __POPULATION;
    let evolveable = Math.floor((1 + Math.sqrt(8*n))/2);
    let survivors = arr.slice(0, evolveable);
    let crossOverPotential = (evolveable*(evolveable -1))/2;
    let multiplyer = __SIMULATOR.canvas.random(-0.1, 0.1);

    if (crossOverPotential < n) {
      let difference = n - crossOverPotential;
      for (var i = 0; i < difference; i++) {
        let bestNN = arr[0].copy();
        bestNN.mutateBy(1);
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

// TODO: Explain in PWS.
function winstijnSort(arr){
  const sorted = arr.sort( (ai, bi) => {
      if (ai.car.currentSector == bi.car.currentSector){
        return ai.car.sectorTime < bi.car.sectorTime ? 1 : -1
      }
      return ai.car.currentSector > bi.car.currentSector ? 1 : -1
  }).reverse()

  // console.log("==== Generation Results =====")
  // console.log("BEST NN:")
  // console.log("Sector:", sorted[0].car.currentSector, "time:", sorted[0].car.sectorTime)
  // console.log("")
  // console.log("WORST NN:")
  // console.log("Sector:", sorted[sorted.length - 1].car.currentSector, "time:", sorted[arr.length - 1].car.sectorTime)
  return sorted
}

function addNN(car) {
  __NEURALNETWORKS.unshift(car.ai);
}

function saveNeuralNet() {
  if (__SELECTEDNN == undefined) {
    console.log(__BESTAI.serialize());
  } else {
    console.log(__SIMULATOR.cars[__SELECTEDNN].ai.serialize());
  }
}

function loadNeuralNet() {
    //TODO: implement loading in neuralnetworks
    var input = prompt("Input ai", "An ai object");
    if (input == null || input == "") {
      //
    } else {
      loadedNN = deserialize(input);

    }
    __NEURALNETWORKS = [];
    if (__EVOLVEFURTHER) {
      for (var i = 0; i < __POPULATION; i++) {
        __NEURALNETWORKS[i] = loadedNN;
      }
    } else {
      __NEURALNETWORKS[0] = loadedNN.copy();
      __POPULATION = 1;
    }
    __SIMULATOR.casualties = 0;
    nextGen();


}
function nextNeuralnet() {
  if (__SELECTEDNN == undefined) {
      __SELECTEDNN = 0;
  } else if (__SELECTEDNN == __POPULATION -1) {
      __SELECTEDNN = 0
  } else {
      __SELECTEDNN++;
  }
}

function previousNeuralNet() {
  if (__SELECTEDNN == 0) {
    __SELECTEDNN = __POPULATION-1;
  } else if (__SELECTEDNN == undefined) {
    __SELECTEDNN = __POPULATION-1;
  } else {
    __SELECTEDNN--;
  }
}

$(document).ready( () => {
  __EVOLVEFURTHER = true;
  __EVOLVEDNN = [];
  __NEURALNETWORKS = [];
  __SELECTEDNN = undefined;
  firstGenCalculated = false;
  __MUTATECHANCEPERELEMENT = 0.5;
  __MUTATECHANCEPERAI = 1;
  __MUTATEBYTWO = false;

});
