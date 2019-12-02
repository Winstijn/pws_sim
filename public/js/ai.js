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
      this.allFitness = 0
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
          // this.fitness++;
          this.fitness = this.car.sensors.reduce((a, b) =>  a + b) / this.car.sensors.length
          this.framesAlive++
          this.allFitness += this.fitness

          this.dDistance += Math.sqrt(Math.pow(this.car.velocityX, 2) + Math.pow(this.car.velocityY, 2));

          //console.log(`Fitness: ${this.fitness}`);
          //console.log(`Distance traveled: ${this.dDistance}`);

        }
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
  __SIMULATOR.generation++;
  let sortedArray = [];
  let evolvedArray = [];
  if (__NEURALNETWORKS.length > 1) {
    sortedArray = selectionSort(__NEURALNETWORKS);
    evolvedArray = evolveGen(sortedArray);
  } else {
    evolvedArray = __NEURALNETWORKS;
  }
  __NEURALNETWORKS = [];


__SIMULATOR.cars = []
  for (let i = 0; i < __POPULATION; i++) {
    let coppiedNN = evolvedArray[i];

    //let randomNmbr = Math.random();
    // if (randomNmbr < 1) {
    //   let multiplyer = __SIMULATOR.canvas.random(-1, 1);
    //   //coppiedNN.mutate(x => x*multiplyer);
    // }
    coppiedNN.mutateBy(__MUTATECHANCEPERAI);

     __SIMULATOR.cars[i] = new Car(__SIMULATOR, evolvedArray[i], __SIMULATOR.spawnPoint.x, __SIMULATOR.spawnPoint.y);
   }
   // if (__MUTATEBYTWO) {
   //   console.log(__BESTAI);
   //   __SIMULATOR.cars[0] = new Car(__SIMULATOR, __BESTAI, __SIMULATOR.spawnPoint.x, __SIMULATOR.spawnPoint.y, 18);
   //   // __SIMULATOR.cars[__POPULATION-1].color = 180;
   //   console.log(__SIMULATOR.cars[0]);
   // }
   //__SIMULATOR.cars[0] = new Car(__SIMULATOR, sortedArray[0].copy(), __SIMULATOR.spawnPoint.x, __SIMULATOR.spawnPoint.y, 180);
    //let newNN = crossOver(sortedArray[0], sortedArray[1]);
   //__SIMULATOR.cars.unshift(new Car(__SIMULATOR, testNN.copy(), __SIMULATOR.spawnPoint.x, __SIMULATOR.spawnPoint.y, 200))
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
    __BESTAI = firstBest.copy();
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
        // console.log(i + " | " + j);

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
//Source https://khan4019.github.io/front-end-Interview-Questions/sort.html
function selectionSort(arr){
  var minIdx, temp,
      len = arr.length;
  for(var i = 0; i < len; i++){
    minIdx = i;
    for(var  j = i+1; j<len; j++){
      let distance1 = Math.round(arr[j].dDistance);
      let distance2 = Math.round(arr[minIdx].dDistance);
      let arr1 = arr[j].allFitness + arr[j].dDistance
      let arr2 = arr[minIdx].allFitness + arr[minIdx].dDistance
       if(arr1>arr2){
          minIdx = j;
       }
    }
    temp = arr[i];
    arr[i] = arr[minIdx];
    arr[minIdx] = temp;
  }
  console.log("")
  console.log("BEST NN:")
  console.log("Fitness:", arr[0].allFitness / arr[0].framesAlive, "distance:", arr[0].dDistance / arr[0].framesAlive)
  console.log("")
  console.log("WORST NN:")
  console.log("Fitness:", arr[arr.length - 1 ].allFitness / arr[arr.length - 1].framesAlive, "distance:", arr[arr.length - 1].dDistance  /  arr[arr.length - 1].framesAlive)
  // debugger
  return arr;
}


function addNN(car) {
  __NEURALNETWORKS.unshift(car.ai);
}

function saveNeuralNet() {
  if (__SIMULATOR.paused) {
    if (__SELECTEDNN == undefined) {
      alert("No car selected")
    } else {
      console.log(__SIMULATOR.cars[__SELECTEDNN].ai.serialize());
    }
  } else {
    alert("The simulator must be paused")
  }

}

function loadNeuralNet() {
    // TODO: implement loading in neuralnetworks
    // var input = prompt("Input ai", "An ai object");
    // if (input == null || input == "") {
    //   //
    // } else {
    //   loadedNN = input.deserialize();
    // }


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
  //console.log(__SELECTEDNN);
  // while (__SIMULATOR.cars[__SELECTEDNN].isAlive == false) {
  //   console.log(__SELECTEDNN + " is dead");
  //   __SELECTEDNN+= 1;
  // }
  // for (var i = __SELECTEDNN; i < __SIMULATOR.cars.length; i++) {
  //   if (__SIMULATOR.cars[i].isAlive != false) {
  //     __SELECTEDNN = i;
  //     break;
  //   }
  // }
  // console.log(__SELECTEDNN);

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
  __EVOLVEDNN = [];
  __NEURALNETWORKS = [];
  __SELECTEDNN = undefined;
  firstGenCalculated = false;
  __MUTATECHANCEPERELEMENT = 0.5;
  __MUTATECHANCEPERAI = 1;
  __MUTATEBYTWO = true;
});
