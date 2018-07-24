

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