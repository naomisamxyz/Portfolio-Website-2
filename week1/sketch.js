/*
----- Coding Tutorial by Patt Vira ----- 
Name: Slime Molds (Physarum)
Video Tutorial: https://youtu.be/VyXxSNcgDtg

References: 
1. Algorithm by Jeff Jones:
https://uwe-repository.worktribe.com/output/980579/characteristics-of-pattern-formation-and-evolution-in-approximations-of-physarum-transport-networks

Connect with Patt: @pattvira
https://www.pattvira.com/
----------------------------------------
*/


// ========================================
// GLOBAL VARIABLES
// ========================================

let molds = [];
let num = 4000;
let d;


// ========================================
// SETUP
// Runs once when the sketch starts
// ========================================

function setup() {

  if (window.previewMode) {
    createCanvas(windowWidth, windowHeight);
  } else {
    createCanvas(windowWidth * 0.95, windowHeight * 0.9);
  }

  angleMode(DEGREES);

  d = pixelDensity();

  // Create all of the mold particles
  for (let i = 0; i < num; i++) {
    molds[i] = new Mold();
  }

  // Only show the description on the full Week 1 page
  if (!window.previewMode) {
    describe(
      'This sketch simulates behaviors of slime molds. Each slime mold object has position, traveling direction and three sensors. As the slime mold moves, it leaves a trace. The mold senses the existing trail and uses it to decide which direction to move.',
      LABEL
    );
  }
}

// ========================================
// WINDOW RESIZE
// Runs when the window is resized
// ========================================

function windowResized() {
  if (window.previewMode) {
    resizeCanvas(windowWidth, windowHeight);
  } else {
    resizeCanvas(windowWidth * 0.9, windowHeight * 0.8);
  }
}


// ========================================
// DRAW
// Runs continuously
// ========================================

function draw() {

  // Slight transparency means old trails slowly fade
  background(0, 5);

  // Makes the canvas pixels available to the mold sensors
  loadPixels();

  // Update and draw every mold
  for (let i = 0; i < num; i++) {

    molds[i].update();
    molds[i].display();

  }
}


// ========================================
// MOLD CLASS
// Defines the behavior of one mold particle
// ========================================

class Mold {

  constructor() {

    // --------------------
    // POSITION
    // --------------------

    // Start near the center of the canvas
    this.x = random(width / 2 - 20, width / 2 + 20);
    this.y = random(height / 2 - 20, height / 2 + 20);

    // Size
    this.r = 0.5;


    // --------------------
    // MOVEMENT
    // --------------------

    // Start facing a random direction
    this.heading = random(360);

    this.vx = cos(this.heading);
    this.vy = sin(this.heading);

    // How sharply the mold can turn
    this.rotAngle = 45;


    // --------------------
    // SENSORS
    // --------------------

    // Right sensor
    this.rSensorPos = createVector(0, 0);

    // Left sensor
    this.lSensorPos = createVector(0, 0);

    // Front sensor
    this.fSensorPos = createVector(0, 0);

    // Angle between sensors
    this.sensorAngle = 45;

    // How far ahead the sensors look
    this.sensorDist = 10;
  }


  // ======================================
  // UPDATE MOVEMENT
  // ======================================

  update() {

    // Calculate direction
    this.vx = cos(this.heading);
    this.vy = sin(this.heading);


    // Move

    // % makes particles wrap around
    // when they reach the canvas edge

    this.x = (this.x + this.vx + width) % width;
    this.y = (this.y + this.vy + height) % height;


    // Find the positions of the three sensors

    this.getSensorPos(
      this.rSensorPos,
      this.heading + this.sensorAngle
    );

    this.getSensorPos(
      this.lSensorPos,
      this.heading - this.sensorAngle
    );

    this.getSensorPos(
      this.fSensorPos,
      this.heading
    );


    // ====================================
    // READ THE TRAIL
    // ====================================

    let index;
    let l;
    let r;
    let f;


    // RIGHT SENSOR

    index =
      4 *
      (d * floor(this.rSensorPos.y)) *
      (d * width) +
      4 *
      (d * floor(this.rSensorPos.x));

    r = pixels[index];


    // LEFT SENSOR

    index =
      4 *
      (d * floor(this.lSensorPos.y)) *
      (d * width) +
      4 *
      (d * floor(this.lSensorPos.x));

    l = pixels[index];


    // FRONT SENSOR

    index =
      4 *
      (d * floor(this.fSensorPos.y)) *
      (d * width) +
      4 *
      (d * floor(this.fSensorPos.x));

    f = pixels[index];


    // ====================================
    // DECIDE WHICH WAY TO TURN
    // ====================================

    // Strongest trail is directly ahead
    if (f > l && f > r) {

      // Keep going straight
      this.heading += 0;

    }

    // Front is weaker than both sides
    else if (f < l && f < r) {

      // Randomly turn left or right
      if (random(1) < 0.5) {

        this.heading += this.rotAngle;

      } else {

        this.heading -= this.rotAngle;

      }

    }

    // Left sensor detects more
    else if (l > r) {

      this.heading -= this.rotAngle;

    }

    // Right sensor detects more
    else if (r > l) {

      this.heading += this.rotAngle;

    }
  }


  // ======================================
  // DISPLAY
  // ======================================

  display() {

    noStroke();
    fill(255);

    ellipse(
      this.x,
      this.y,
      this.r * 2,
      this.r * 2
    );
  }


  // ======================================
  // SENSOR POSITION
  // ======================================

  getSensorPos(sensor, angle) {

    sensor.x =
      (this.x +
        this.sensorDist * cos(angle) +
        width) %
      width;

    sensor.y =
      (this.y +
        this.sensorDist * sin(angle) +
        height) %
      height;
  }
}