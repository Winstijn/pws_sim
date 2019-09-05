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
    
    
}

$(document).ready( () => {
    __SIMULATOR = new Simulator()
})


// String protoypes:   
String.prototype.upcase = function(){
    return this[0].toUpperCase() + this.substring(1)
}

String.prototype.reverse = function(){
    return this.split("").reverse().toString().replace(/,/g, "")
}

