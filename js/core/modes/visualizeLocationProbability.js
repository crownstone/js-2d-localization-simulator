

function initVisualizeLocationProbabilityHandler() {
  generateFingerprints();

  clearStoredModels()
  processTrainingData(generateFingerprints());
}

function generateFingerprints() {
  let fingerprintSet = {};

  let roomKeys = Object.keys(TRAINING_LOCATIONS);
  roomKeys.forEach((roomId) => {
    fingerprintSet[roomId] = {};

    let trainingPoints = TRAINING_LOCATIONS[roomId];

    trainingPoints.forEach((point) => {
      let sampleVector = getRssiFromStonesToPoint(point.x, point.y);
      let crownstonesInVector = Object.keys(sampleVector);
      crownstonesInVector.forEach((crownstoneId) => {
        if (!fingerprintSet[roomId][crownstoneId]) {
          fingerprintSet[roomId][crownstoneId] = [];
        }
        fingerprintSet[roomId][crownstoneId].push(sampleVector[crownstoneId]);
      })
    })

  })

  return fingerprintSet;
}

function renderVisualizeLocationProbabilityDistribution() {
  evalValues();
  drawProbabilityDistribution()

  drawAllWalls();
  drawAllCrownstones();
}

function drawProbabilityDistribution() {
  let xblockCount = Math.ceil(canvas.width / BLOCK_SIZE);
  let yblockCount = Math.ceil(canvas.height / BLOCK_SIZE);
  var data = [];

  let lowest = 1e9
  let highest = 0
  for (let i = 0; i < xblockCount; i++) {
    for (let j = 0; j < yblockCount; j++) {
      let xPx = 0.5 * BLOCK_SIZE + i * BLOCK_SIZE;
      let yPx = 0.5 * BLOCK_SIZE + j * BLOCK_SIZE;

      let {x, y} = pixelsToMeters(xPx, yPx, false);

      let vector = getRssiFromStonesToPoint(x, y);

      let result = evaluateProbabilities(vector);

      let probability = result[SELECTED_ROOM_ID];

      lowest = Math.min(lowest, probability);
      highest = Math.max(highest, probability);
    }
  }

  let range = highest - lowest;

  for (let i = 0; i < xblockCount; i++) {
    for (let j = 0; j < yblockCount; j++) {
      let xPx = 0.5*BLOCK_SIZE + i*BLOCK_SIZE;
      let yPx = 0.5*BLOCK_SIZE + j*BLOCK_SIZE;

      let {x , y} = pixelsToMeters(xPx, yPx, false);

      let vector = getRssiFromStonesToPoint(x,y);

      let result = evaluateProbabilities(vector);

      let probability = result[SELECTED_ROOM_ID];


      let rawFactor = (probability - lowest) / range;
      let factor = Math.min(1,Math.max(0,rawFactor));

      let rgb = hsv2rgb((1-factor) * 270, 1, 1);
      let minOpacity = 0.3;
      let color = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (factor*(1-minOpacity) + minOpacity) + ')';
      drawSquareOnGrid(x, y, BLOCK_SIZE, color);

      data.push({x:i*BLOCK_SIZE+0.5*BLOCK_SIZE, y:j*BLOCK_SIZE+0.5*BLOCK_SIZE, z:probability, style:factor})
    }
  }
}
