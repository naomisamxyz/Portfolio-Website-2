let squareSize = 250;
let lineWidth = 4;
let pulse = 0;

function setup() {
  createCanvas(400, 300);
  clear();
}

function draw() {

  // Speed you liked
  pulse = sin(frameCount * 0.015);

  // T moves inward and outward
  squareSize = map(pulse, -1, 1, 280, 120);

  // Line thickness changes
  lineWidth = map(pulse, -1, 1, 4, 20);

  // Transparency
  let fade = map(pulse, -1, 1, 10, 45);

  // Change from red to black
  let redAmount = map(pulse, -1, 1, 255, 0);

  rectMode(CENTER);

  // Outline: red → black
  strokeWeight(lineWidth);
  stroke(redAmount, 0, 0, fade);

  // Fill: red/pink → black
  fill(redAmount, 0, 0, fade);

  // Top of T
  rect(200, 70, squareSize, 60);

  // Stem of T
  rect(200, 180, 65, squareSize * 0.8);
}