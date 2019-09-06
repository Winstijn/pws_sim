//
//  PWS AI 
//  ai.js
//
//  Created by Fyor Klein Gunnewiek
//  Copyright © 2019 Kaziaat B.V. All rights reserved.
//

// Example for Fyor.
class SelfDrivingAI {

    constructor(settings) {

        if (settings.random) {
            this.generateRandomAI()
        }

        this.canvas = __SIMULATOR_CANVAS
        this.id = "fjkabfjsfuwhr209u4"
        this.values = [0, 30,4, 5,5,]
        this.fitness = 0

        // 
    }

    // called everyframe
    draw() {
        if 
    }

    generateRandomAI(){

    }

}

$(document).ready( () => {
    var aiCount = 100
    var ais = []
    for (let i = 0; i < aiCount; i++) {
        ais.push( new SelfDrivingAI({ random: true, val })  )
        
    }
    

})




// Ik wil dat je luisterd naar een document.ready, ofwel
// $(document),ready( () => { bla code} )
// Als dit niet begrijpt, ga je maar wat documentatie lezen :)
// We hebben jQuery tot onze beschikking.