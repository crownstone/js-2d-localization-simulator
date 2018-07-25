

function initVisualizeLocationHandler() {
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

function renderVisualizeLocationDistribution() {
  evalValues();
  drawDistribution()
  drawAllWalls();
  drawAllCrownstones();

}

function drawDistribution() {
  let xblockCount = Math.ceil(canvas.width / BLOCK_SIZE);
  let yblockCount = Math.ceil(canvas.height / BLOCK_SIZE);
  vis3dDataset.clear();
  let data = [];
  for (let i = 0; i < xblockCount; i++) {
    for (let j = 0; j < yblockCount; j++) {
      let xPx = 0.5*BLOCK_SIZE + i*BLOCK_SIZE;
      let yPx = 0.5*BLOCK_SIZE + j*BLOCK_SIZE;

      let {x , y} = pixelsToMeters(xPx, yPx, false);

      let vector = getRssiFromStonesToPoint(x,y);

      let result = evaluateProbabilities(vector);

      let roomsInResult = Object.keys(result);
      let amountOfRoomsInResult = roomsInResult.length;
      let max = 0;
      let maxId = 0;
      let maxIndex = 0;
      roomsInResult.forEach((roomId, index) => {
        if (max < result[roomId]) {
          max = result[roomId];
          maxId = roomId;
          maxIndex = index;
        }
      });

      if (maxId === "NO_ROOM") {
        drawSquareOnGrid(x,y, BLOCK_SIZE, 'rgba(0,0,0,0.9)')
      }
      else {

        data.push({
          x:i*BLOCK_SIZE+0.5*BLOCK_SIZE,
          y:-j*BLOCK_SIZE+0.5*BLOCK_SIZE,
          z:max,
          style: (1/amountOfRoomsInResult)*maxIndex
        })


        if (!ROOMS[maxId]) {
          console.warn("UNKNOWN ROOM", maxId)
          drawSquareOnGrid(x, y, BLOCK_SIZE, 'rgba(255,0,0,1)')
        }
        else {
          if (!ROOMS[maxId].color) {
            console.warn("NO COLOR DEFINED FOR ROOM", maxId)
            drawSquareOnGrid(x, y, BLOCK_SIZE, 'rgba(255,255,0,1)')
          }
          else {
            drawSquareOnGrid(x, y, BLOCK_SIZE, hex2rgba(ROOMS[maxId].color,0.5))
          }
        }
      }
    }
  }

  // update 3d graph.
  vis3dDataset.update(data);
}
