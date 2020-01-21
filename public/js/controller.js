var __CONTROLLER;
class Controller {

    constructor(gamepad){
        this.gamepad = gamepad
        this.rumble(250);
    }

    rumble(duration=1000){
        this.gamepad.vibrationActuator.playEffect("dual-rumble", {
            startDelay: 0,
            duration: duration,
            weakMagnitude: 1.0,
            strongMagnitude: 1.0
          });
    }

    checkControls(car){
                this.updateGamepadInstance();
                var steer = car.sim.canvas.map(this.gamepad.axes[0], -1, 1, 0, 1).toFixed(4)
                if (steer < 0.55 && steer > 0.45) steer = 0.5
                var accelerator = this.gamepad.buttons[7].value
                car.accelerator = accelerator
                car.setSteer(steer, true)
        
    }

    updateGamepadInstance(){
        var gamepads = navigator.getGamepads();
        this.gamepad = gamepads[0]
    }

}


window.addEventListener("gamepadconnected", (event) => {
    console.log("[PWS CONTROLLER] A gamepad connected to the sim.");
    __CONTROLLER = new Controller(event.gamepad)
  });