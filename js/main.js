const video = document.getElementById("video");
const isScreenSmall = window.matchMedia("(max-width: 700px)");
// let predictedAges = [];

const MODEL_URL = './models'

// await faceapi.loadModels(MODEL_URL)
// await faceapi.loadFaceDetectionModel(MODEL_URL)
// await faceapi.loadFaceLandmarkModel(MODEL_URL)
// await faceapi.loadFaceRecognitionModel(MODEL_URL)
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  // faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  // faceapi.nets.faceExpressionNet.loadFromUri("./models"),
  // faceapi.nets.ageGenderNet.loadFromUri("./models")
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => (video.srcObject = stream),
    err => console.error(err)
  );
}

  /****Fixing the video with based on size size  ****/
function screenResize(isScreenSmall) {
  if (isScreenSmall.matches) {
    video.style.width = "320px";
  } else {
    video.style.width = "480px";
  }
}

screenResize(isScreenSmall);
isScreenSmall.addListener(screenResize);

video.addEventListener("playing", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  let container = document.querySelector(".container");
  container.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  console.log(displaySize);

  setInterval(async () => {

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();
    
    if (!detections) {
        return;
    }
    // console.log(detections);

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    if (!resizedDetections) {
        // return
    }
    // console.log(resizedDetections);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    /****Drawing the detection box and landmarkes on canvas****/
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

  }, 120);

});