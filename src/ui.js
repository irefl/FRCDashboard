// Define UI elements
let ui = {
    timer: document.getElementById('timer'),
    robotState: document.getElementById('robot-state').firstChild,
    gyro: {
        container: document.getElementById('gyro'),
        val: 0,
        offset: 0,
        visualVal: 0,
        arm: document.getElementById('gyro').firstChild,
        number: document.getElementById('gyro').lastChild
    },
    module1 :{
        container: document.getElementById('module1'),
        val: 0,
        offset: 0,
        visualVal: 0,
        arm: document.getElementById('module1').firstChild,
        number: document.getElementById('module1').lastChild
    },
    module2 :{
        container: document.getElementById('module2'),
        val: 0,
        offset: 0,
        visualVal: 0,
        arm: document.getElementById('module2').firstChild,
        number: document.getElementById('module2').lastChild
    },
    module3 :{
        container: document.getElementById('module3'),
        val: 0,
        offset: 0,
        visualVal: 0,
        arm: document.getElementById('module3').firstChild,
        number: document.getElementById('module3').lastChild
    },
    module4 :{
        container: document.getElementById('module4'),
        val: 0,
        offset: 0,
        visualVal: 0,
        arm: document.getElementById('module4').firstChild,
        number: document.getElementById('module4').lastChild
    },
    robotDiagram: {
        arm: document.getElementById('robot-arm')
    },
    driveMode: {
        button: document.getElementById('driveMode-button'),
        readout: document.getElementById('driveMode-readout').firstChild
    },
    autoSelect: document.getElementById('auto-select'),
    armPosition: document.getElementById('arm-position')
};

// Key Listeners

// Gyro rotation
let updateGyroDisplay = function(value, displayItem) {

    ui[displayItem].val = value;
    ui[displayItem].visualVal = Math.floor(ui[displayItem].val - ui[displayItem].offset);
    ui[displayItem].visualVal %= 360;
    if (ui[displayItem].visualVal < 0) {
        ui[displayItem].visualVal += 360;
    }
    ui[displayItem].arm.style.transform = `rotate(${ui[displayItem].visualVal}deg)`;
    ui[displayItem].number.textContent = ui[displayItem].visualVal + '°';
};

NetworkTables.addKeyListener('/SmartDashboard/Gyro', (key, value) => {
    updateGyroDisplay(value, "gyro");
});
NetworkTables.addKeyListener('/SmartDashboard/azimuth1', (key, value) => {
    updateGyroDisplay(value, "module1");
});
NetworkTables.addKeyListener('/SmartDashboard/azimuth2', (key, value) => {
    updateGyroDisplay(value, "module2");
});
NetworkTables.addKeyListener('/SmartDashboard/azimuth3', (key, value) => {
    updateGyroDisplay(value, "module3");
});
NetworkTables.addKeyListener('/SmartDashboard/azimuth4', (key, value) => {
    updateGyroDisplay(value, "module4");
});

// The following case is an example, for a robot with an arm at the front.
NetworkTables.addKeyListener('/SmartDashboard/arm/encoder', (key, value) => {
    // 0 is all the way back, 1200 is 45 degrees forward. We don't want it going past that.
    if (value > 1140) {
        value = 1140;
    }
    else if (value < 0) {
        value = 0;
    }
    // Calculate visual rotation of arm
    var armAngle = value * 3 / 20 - 45;
    // Rotate the arm in diagram to match real arm
    ui.robotDiagram.arm.style.transform = `rotate(${armAngle}deg)`;
});

// This button is just an example of triggering an event on the robot by clicking a button.
NetworkTables.addKeyListener('/SmartDashboard/driveMode', (key, value) => {
    // Set class active if value is true and unset it if it is false
    ui.driveMode.button.classList.toggle('active', value);
    ui.driveMode.readout.data = 'Value is ' + value;
});

NetworkTables.addKeyListener('/robot/time', (key, value) => {
    // This is an example of how a dashboard could display the remaining time in a match.
    // We assume here that value is an integer representing the number of seconds left.
    ui.timer.textContent = value < 0 ? '0:00' : Math.floor(value / 60) + ':' + (value % 60 < 10 ? '0' : '') + value % 60;
});

// Load list of prewritten autonomous modes
NetworkTables.addKeyListener('/SmartDashboard/autonomous/modes', (key, value) => {
    // Clear previous list
    while (ui.autoSelect.firstChild) {
        ui.autoSelect.removeChild(ui.autoSelect.firstChild);
    }
    // Make an option for each autonomous mode and put it in the selector
    for (let i = 0; i < value.length; i++) {
        var option = document.createElement('option');
        option.appendChild(document.createTextNode(value[i]));
        ui.autoSelect.appendChild(option);
    }
    // Set value to the already-selected mode. If there is none, nothing will happen.
    ui.autoSelect.value = NetworkTables.getValue('/SmartDashboard/currentlySelectedMode');
});

// Load list of prewritten autonomous modes
NetworkTables.addKeyListener('/SmartDashboard/autonomous/selected', (key, value) => {
    ui.autoSelect.value = value;
});

// The rest of the doc is listeners for UI elements being clicked on
ui.driveMode.button.onclick = function() {
    // Set NetworkTables values to the opposite of whether button has active class.
    NetworkTables.putValue('/SmartDashboard/driveMode', this.className != 'active');
};

// // Reset gyro value to 0 on click
// ui.gyro.container.onclick = function() {
//     // Store previous gyro val, will now be subtracted from val for callibration
//     ui.gyro.offset = ui.gyro.val;
//     // Trigger the gyro to recalculate value.
//     updateGyro('/SmartDashboard/drive/navx/yaw', ui.gyro.val);
// };

// Update NetworkTables when autonomous selector is changed
ui.autoSelect.onchange = function() {
    NetworkTables.putValue('/SmartDashboard/autonomous/selected', this.value);
};
// Get value of arm height slider when it's adjusted
ui.armPosition.oninput = function() {
    NetworkTables.putValue('/SmartDashboard/arm/encoder', parseInt(this.value));
};

addEventListener('error',(ev)=>{
    ipc.send('windowError',{mesg:ev.message,file:ev.filename,lineNumber:ev.lineno})
})
