/*
 * 👋 Hello! This is an ml5.js example made and shared with ❤️.
 * Learn more about the ml5.js project: https://ml5js.org/
 * ml5.js license and Code of Conduct: https://github.com/ml5js/ml5-next-gen/blob/main/LICENSE.md
 *
 * This example demonstrates drawing a triangular mesh using ml5.faceMesh.
 */

    // Will hold the faceMesh model once it's loaded
let faceMesh;
    // Will hold the webcam feed
let video;
    // Will hold the latest detection results: one entry per detected face.
    // Starts empty so draw() has nothing to loop over until a face is found.
let faces = [];
    // Model settings:
    // maxFaces: how many faces to track at once (1 = just one person)
    // refineLandmarks: if true, adds 10 extra points around the irises (478 total instead of 468)
    // flipHorizontal: if true, mirrors the keypoints (useful if you also mirror the video)
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };
    // Will hold the list of triangles that connect the keypoints into a mesh
let triangles;

    // setup() runs once at the start. It's "async" so we can "await"
    // the model loading before continuing.
async function setup() {
      // Create a 640x480 drawing canvas
  const canvas = createCanvas(640, 480);

      // Load the faceMesh model with our options and wait until it's ready
  faceMesh = await ml5.faceMesh(options);

      // Create the webcam video and hide it
      // createCapture makes a separate HTML video element on the page.
      // We hide that element because we draw the video onto the canvas ourselves in draw().
  video = createCapture(VIDEO);
      // Match the video size to the canvas so keypoints line up with the image
  video.size(640, 480);
  video.hide();
      // Load the triangle indices for drawing the mesh
      // This is a fixed list, e.g. [[127, 34, 139], [11, 0, 37], ...].
      // Each entry is three keypoint numbers that form one triangle.
      // It's the same for every face, so we only need to get it once.
  triangles = faceMesh.getTriangles();
      // Start detecting faces from the webcam video
      // This runs continuously in the background, and every time the model
      // finishes analyzing a frame it calls gotFaces() with the results.
  faceMesh.detectStart(video, gotFaces);
}

    // draw() runs over and over, about 60 times per second
function draw() {
      // Draw the webcam video
      // Paint the current webcam frame onto the canvas, filling it completely
  image(video, 0, 0, width, height);

      // Draw all the triangles
      // Outer loop: go through each detected face (only 1 here because maxFaces is 1)
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
        // Inner loop: go through every triangle in the mesh
    for (let j = 0; j < triangles.length; j++) {
          // Get the three keypoint numbers for this triangle
      let indices = triangles[j];
      let pointAIndex = indices[0];
      let pointBIndex = indices[1];
      let pointCIndex = indices[2];
          // Look up the actual positions of those keypoints on this face.
          // face.keypoints is an array of 468 points, each with x, y (pixels) and z (depth).
      let pointA = face.keypoints[pointAIndex];
      let pointB = face.keypoints[pointBIndex];
      let pointC = face.keypoints[pointCIndex];

          // Style: no fill, thin blue outline
      noFill();
      stroke(0, 0, 255);
      strokeWeight(1);
          // Draw the triangle between the three points (2D only, z is ignored here)
      triangle(pointA.x, pointA.y, pointB.x, pointB.y, pointC.x, pointC.y);
    }
  }
}

    // Callback function for when faceMesh outputs data
    // Called automatically by detectStart() each time a new result is ready
function gotFaces(results) {
      // Save the output to the faces variable
      // draw() reads this variable, so the mesh always shows the most recent detection
  faces = results;
}