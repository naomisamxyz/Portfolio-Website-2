/*
 * Wing Hands + Face Mesh
 * - Face: a UV-mapped texture on the face (ml5.faceMesh)
 * - Hands: a wing appears on each hand that makes the "ears" pose
 *   (index + middle fingers up, ring + pinky folded) (ml5.handPose)
 * Layers (bottom to top): camera, overlay image, dark overlay, face, wings
 *
 * Reference:
 * faceMesh: https://docs.ml5js.org/#/reference/facemesh
 * handPose: https://docs.ml5js.org/#/reference/handpose
 */

// ================= SETTINGS =================

// --- Wings ---
// Wing height relative to hand length (wrist to middle fingertip)
const WING_SIZE = 1.3;
// Where the wing's root sits inside the PNG, as a fraction of width/height
// (0,0 = top-left, 1,1 = bottom-right)
const WING_BASE_X = 0.15;
const WING_BASE_Y = 0.9;
// Where on the palm the wing attaches (0 = wrist, 1 = middle knuckle)
const PALM_POSITION = 0.4;
// Maximum wing opacity when fully shown (0 = invisible, 255 = solid)
const MAX_OPACITY = 180;
// Fade speed (0.05 = slow, 0.5 = almost instant)
const FADE_SPEED = 0.2;
// How long (ms) a wing stays after its pose is lost
const HOLD_TIME = 400;

// --- Pose detection ---
// Wrist must be above this fraction of the screen height
const RAISED_LIMIT = 0.7;
// Index/middle count as extended above this ratio (lower = looser)
const EXTENDED_RATIO = 0.95;
// Ring/pinky count as folded below this ratio (higher = looser)
const CURLED_RATIO = 1.2;
// How far below its knuckle a fingertip may be and still count as "up",
// in hand sizes (higher = more sideways tilt allowed)
const UP_TOLERANCE = 0.25;
// How many of the 5 checks each hand must pass (5 = strict, 3 = very loose)
const MIN_CHECKS = 4;

// --- Overlays ---
// Opacity of the overlay image (0 = invisible, 255 = solid)
const IMAGE_OPACITY = 200;
// Color (r, g, b) and opacity of the dark overlay
const OVERLAY_COLOR = [255, 255, 255];
const LIGHT_OPACITY = 150;

// ================= STATE =================

let video;

let handPose;
let hands = [];

let faceMesh;
let faces = [];
let triangulation; // which keypoints form each face triangle
let uvCoords;      // where each keypoint sits on the face texture

let wingImg;
let overlayImg;
let faceImg;

// Each side has its own wing: opacity, when its pose was last seen, and its placement
let wings = {
  left:  { alpha: 0, lastPoseTime: -Infinity, placement: null },
  right: { alpha: 0, lastPoseTime: -Infinity, placement: null }
};

// ================= SETUP =================

async function setup() {
  // WEBGL is needed to wrap a texture onto the face triangles
const canvas = createCanvas(640, 480, WEBGL);

canvas.parent("sketch");

  // Turn off depth testing so layers simply stack in drawing order
  // (everything here is flat, so we don't need 3D depth sorting)
  drawingContext.disable(drawingContext.DEPTH_TEST);

  // Images
  wingImg = await loadImage("wing.png");
  overlayImg = await loadImage("overlay.png");
  faceImg = await loadImage("overlay.png"); // face texture (UV map)

  // Tracking models, both mirrored to match the mirrored video
  handPose = await ml5.handPose({ maxHands: 2, flipped: true });
  faceMesh = await ml5.faceMesh({ maxFaces: 1, refineLandmarks: false, flipped: true });

  // Webcam, mirrored like a selfie; the HTML video element is hidden
  // because we draw the video onto the canvas ourselves
  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();

  // Face mesh structure (fixed, only needed once)
  triangulation = faceMesh.getTriangles();
  uvCoords = faceMesh.getUVCoords();

  // Start continuous detection
  handPose.detectStart(video, gotHands);
  faceMesh.detectStart(video, gotFaces);
}

// ================= DRAW =================

function draw() {
  // WEBGL puts (0,0) in the center; move it back to the top-left corner
  translate(-width / 2, -height / 2);

  drawBackgroundLayers();
  drawFace();
  updateWings();
  drawWings();
}

// Camera, then overlay image, then dark overlay
function drawBackgroundLayers() {
  image(video, 0, 0, width, height);

  push();
  noStroke();
  fill(OVERLAY_COLOR[0], OVERLAY_COLOR[1], OVERLAY_COLOR[2], LIGHT_OPACITY);
  rect(0, 0, width, height);
  pop();

    push();
  tint(255, IMAGE_OPACITY);
  image(overlayImg, 0, 0, width, height);
  pop();
}

// ================= FACE =================

// Wraps faceImg onto the tracked face using the UV map
function drawFace() {
  if (faces.length === 0) return;
  let face = faces[0];

  push();
  noStroke();
  texture(faceImg);
  textureMode(NORMAL); // UV coordinates run 0–1
  beginShape(TRIANGLES);
  for (let tri of triangulation) {
    for (let index of tri) {
      let p = face.keypoints[index]; // position on screen
      let uv = uvCoords[index];      // position on the texture
      vertex(p.x, p.y, uv[0], uv[1]);
    }
  }
  endShape();
  pop();
}

// ================= WINGS =================

// Is this hand on the left or right side of the face (or screen center)?
function handSide(hand) {
  let centerX = width / 2;
  if (faces.length > 0) {
    centerX = faces[0].keypoints[1].x; // keypoint 1 = nose tip
  }
  return hand.keypoints[0].x < centerX ? "left" : "right";
}

// Checks the pose for each hand separately, updates positions and fades
function updateWings() {
  let now = millis();

  // Sort the detected hands into left and right
  let seen = { left: null, right: null };
  for (let hand of hands) {
    seen[handSide(hand)] = hand;
  }

  for (let side of ["left", "right"]) {
    let wing = wings[side];
    let hand = seen[side];

    // This hand is making the pose right now
    if (hand && isEarPose(hand)) {
      wing.lastPoseTime = now;
    }

    // Wing stays on until HOLD_TIME has passed without the pose
    let poseOn = now - wing.lastPoseTime < HOLD_TIME;

    // Keep the wing following its hand while on (left side = mirrored wing)
    if (poseOn && hand) {
      wing.placement = wingPlacement(hand, side === "left" ? -1 : 1);
    }

    // Ease this wing's opacity toward visible or invisible
    wing.alpha = lerp(wing.alpha, poseOn ? MAX_OPACITY : 0, FADE_SPEED);
  }
}

function drawWings() {
  for (let side of ["left", "right"]) {
    let wing = wings[side];
    if (wing.alpha > 1 && wing.placement) {
      drawWing(wing.placement, wing.alpha);
    }
  }
}

// Position, angle, size and mirroring for one wing
function wingPlacement(hand, flip) {
  let k = hand.keypoints;
  let wrist = k[0];
  let middleKnuckle = k[9];
  let middleTip = k[12];

  return {
    x: lerp(wrist.x, middleKnuckle.x, PALM_POSITION),
    y: lerp(wrist.y, middleKnuckle.y, PALM_POSITION),
    angle: atan2(middleKnuckle.y - wrist.y, middleKnuckle.x - wrist.x) + HALF_PI,
    size: dist(wrist.x, wrist.y, middleTip.x, middleTip.y) * WING_SIZE,
    flip: flip // 1 = original, -1 = mirrored
  };
}

function drawWing(w, alpha) {
  push();
  translate(w.x, w.y);   // move to the anchor on the palm
  rotate(w.angle);       // tilt with the hand
  scale(w.flip, 1);      // mirror for the left-side hand
  tint(255, alpha);      // this wing's fade

  // Keep the PNG's proportions; place its root on the anchor
  let h = w.size;
  let wd = h * (wingImg.width / wingImg.height);
  image(wingImg, -WING_BASE_X * wd, -WING_BASE_Y * h, wd, h);
  pop();
}

// ================= POSE DETECTION =================

// Returns true if a hand is close enough to the "ears" pose
function isEarPose(hand) {
  let k = hand.keypoints;
  let wrist = k[0];
  let handSize = dist(wrist.x, wrist.y, k[9].x, k[9].y);

  // Fingertip distance from wrist ÷ middle-joint distance from wrist.
  // Straight finger ≈ 1.3+, folded finger ≈ 0.8 or less.
  function ratio(tip, joint) {
    return dist(wrist.x, wrist.y, k[tip].x, k[tip].y) /
           dist(wrist.x, wrist.y, k[joint].x, k[joint].y);
  }

  // Fingertip roughly above its knuckle
  function pointingUp(tip, knuckle) {
    return k[tip].y < k[knuckle].y + handSize * UP_TOLERANCE;
  }

  let checks = [
    ratio(8, 6) > EXTENDED_RATIO && pointingUp(8, 5),    // index up
    ratio(12, 10) > EXTENDED_RATIO && pointingUp(12, 9), // middle up
    ratio(16, 14) < CURLED_RATIO,                        // ring folded
    ratio(20, 18) < CURLED_RATIO,                        // pinky folded
    wrist.y < height * RAISED_LIMIT                      // hand raised
  ];

  let score = checks.filter(Boolean).length;
  return score >= MIN_CHECKS;
}

// ================= CALLBACKS =================

function gotHands(results) {
  hands = results;
}

function gotFaces(results) {
  faces = results;
}