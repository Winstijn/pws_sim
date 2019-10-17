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
        return 

        this.car = settings.car
        this.values = [0, 30,4, 5,5]
        this.fitness = 0

        //  
    }

    // called everyframe
    predictDrive(){
        return 
        
        // Put inputs here!
        const inputs = [];
        inputs[0] = this.car.x / __SIMULATOR.resolution.width

        const output = this.predict();

        this.car.accel = -this.car.standardAccel * output[0]
        this.car.steer = output[1] * Math.PI
    }

    generateRandomAI(){
        
    }

    // Saving AI to a string!
    save(){
        this.serialize()
    }

}

$(document).ready( () => {
    return
    var aiCount = 100
    var ais = []
    for (let i = 0; i < aiCount; i++) {
        ais.push( new SelfDrivingAI({ random: true, val })  )
        
    }
    __SIMULATOR_CANVAS.start(ais)

})




// Ik wil dat je luisterd naar een document.ready, ofwel
// $(document),ready( () => { bla code} )
// Als dit niet begrijpt, ga je maar wat documentatie lezen :)
// We hebben jQuery tot onze beschikking.