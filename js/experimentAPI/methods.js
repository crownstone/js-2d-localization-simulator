/**
 * This receives a vector of RSSI measurements for each active crownstone.
 *
 * You return an object of probabilities for all rooms in rooms.json. including NO_ROOM
 * @param rssiJson      { crownstoneId1: -53, crownstoneId2: -63, ....}
 * @returns Object      { room-1: [0..1], room-2: [0..1], ... , NO_ROOM: [0..1] }
 */
function evaluateProbabilities( rssiJson ) {
  // return {
  //   "room-1" : Math.random(),
  //   "room-2" : Math.random(),
  //   "room-3" : Math.random(),
  //   "room-4" : Math.random(),
  //   "room-5" : Math.random(),
  //   "room-6" : Math.random(),
  //   "room-7" : Math.random(),
  //   "NO_ROOM": 0.1
  // }
  return naiveBayesianClassifier.classify(rssiJson);
}


/**
 * This receives an object of training data for all rooms which you can process.
 * @param trainingData  {room-1: { crownstone-1: [-42,-53,-53, ....], crownstone-2: [-42,-53,-53, .... ]}, room-2: ....}
 */
function processTrainingData(trainingData) {
  // console.log('trainingData',trainingData);
  naiveBayesianClassifier.summarizeFingerprints(trainingData);
}



/**
 * When this is called, you make sure that your algorithms are cleaned up and ready for a new processTrainingData call
 */
function clearStoredModels() {
  naiveBayesianClassifier.clear();
}

let naiveBayesianClassifier = new NaiveBayesian();