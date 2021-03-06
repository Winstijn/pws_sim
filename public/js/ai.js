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
          for (var i=0; i< this.car.sensors.length; i++) {
            var distance = this.car.sensors[i] 
            this.inputs.push( distance > 1200 ? 1200 : distance);
          }
          // this.inputs.push(this.car.steer);
          // this.inputs.push(this.car.accel);
          // if (this.car == __SIMULATOR.cars[0]) console.log(this.inputs) 

          // Push inputs through neural network to get outputs
          const output = this.predict(this.inputs);

          // Adding accel to the car.
          // this.car.accel = -this.car.standardAccel * output[0];
          this.car.accelerator = output[0]
          // Er mag alleen maar een kant op worden gestuurd en maar 45 graden per beslissen worden veranderd.
          // this.car.steer += (output[1] - 0.5) * Math.PI / 6
          this.car.setSteer(output[1])

          this.fitness = this.car.currentSector
          this.framesAlive++
          this.allFitness += this.fitness

          this.dDistance += Math.sqrt(Math.pow(this.car.velocityX, 2) + Math.pow(this.car.velocityY, 2));
    }

    mutateBy(chance){
      if (Math.random() < chance) {
        this.mutate();
      }
    }
}

function firstGen() {
  __OLDPOP = __POPULATION
  if (!firstGenCalculated) {
    firstGenCalculated = true;

    for (let i = 0; i < __POPULATION; i++) {
       __SIMULATOR.cars[i] = new Car(__SIMULATOR, undefined, __SIMULATOR.spawnPoint.x, __SIMULATOR.spawnPoint.y);
    }
  }

}

function nextGen(){
  // Reset array for next generation
  __SIMULATOR.cars = [];
  let sortedArray = [];
  let evolvedArray = [];

  if (__NEURALNETWORKS.length > 1 && __EVOLVEFURTHER) {
    // Next generation from large pool

    __SIMULATOR.generation++;
    if (__NEURALNETWORKS[0].car && __NEURALNETWORKS[0].car.currentSector) {
      sortedArray = winstijnSort(__NEURALNETWORKS);
      __BESTAI = sortedArray[0].copy();
      evolvedArray = evolveGen(sortedArray);

      for (let i = 0; i < __POPULATION; i++) {
        let tempCopy = evolvedArray[i].copy();
        tempCopy.mutateBy(__MUTATECHANCEPERAI);
        evolvedArray[i] = tempCopy;
       }

       sortedArray = evolvedArray;
    } else {
      sortedArray = __NEURALNETWORKS
    }

    for (let i = 0; i < __POPULATION; i++) {
      let copy = sortedArray[i].copy();
       __SIMULATOR.cars[i] = new Car(__SIMULATOR, sortedArray[i], __SIMULATOR.spawnPoint.x, __SIMULATOR.spawnPoint.y);
     }
  } else if (__NEURALNETWORKS.length == 1 && __EVOLVEFURTHER) {
    // Continue with evolution from 1 neural network

    __POPULATION = __OLDPOP;
    for (var i = 0; i < __POPULATION; i++) {
      let copyAI = __NEURALNETWORKS[0].copy();
      copyAI.mutate();
      __SIMULATOR.cars[i] = new Car(__SIMULATOR, copyAI, __SIMULATOR.spawnPoint.x, __SIMULATOR.spawnPoint.y);
    }
  } else {
    // Stop evolving and see best so far

    __POPULATION = 1;
    !__SIMULATOR.spawnPoint ? __SIMULATOR.createSpawnPoint() : "";
    let copyAI = __NEURALNETWORKS[0].copy();
    __SIMULATOR.cars[0] = new Car(__SIMULATOR, copyAI, __SIMULATOR.spawnPoint.x, __SIMULATOR.spawnPoint.y);
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
        evolvedGen.push(new DrivingAI( { in_nodes: 5, hidden_nodes:8, output_nodes:2} ));
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
         if (ai.car.sectorTime == bi.car.sectorTime) {
           return ai.car.averageSteerChange < bi.car.averageSteerChange ? 1 : -1
         }
        return ai.car.sectorTime < bi.car.sectorTime ? 1 : -1
      }
      return ai.car.currentSector > bi.car.currentSector ? 1 : -1
  }).reverse()

  console.log("==== Generation Results =====")
  console.log("BEST NN:")
  console.log("Sector:", sorted[0].car.currentSector, "time:", sorted[0].car.sectorTime, 'steer:', sorted[0].car.averageSteerChange)
  console.log("")
  console.log("WORST NN:")
  console.log("Sector:", sorted[sorted.length - 1].car.currentSector, "time:", sorted[arr.length - 1].car.sectorTime, 'steer:', sorted[arr.length - 1].car.averageSteerChange)
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
        __NEURALNETWORKS[i] = loadedNN.copy();
      }
    } else {
      __NEURALNETWORKS[0] = loadedNN.copy();
    }
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
