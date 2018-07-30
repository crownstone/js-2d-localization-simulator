/**
 * This receives a vector of RSSI measurements for each active crownstone.
 *
 * You return an object of probabilities for all rooms in rooms.json. including NO_ROOM
 * @param rssiJson      { crownstoneId1: -53, crownstoneId2: -63, ....}
 * @returns Object      { room-1: [0..1], room-2: [0..1], ... , NO_ROOM: [0..1] }
 */
function evaluateProbabilities( rssiJson ) {
  return naiveBayesianClassifier.classify(rssiJson);
}


/**
 * This receives an object of training data for all rooms which you can process.
 * @param trainingData  {room-1: { timestamp: number, data: {crownstone1: rssi, crownstone2, rssi}}, room-2: ....}
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


/**
 * Draw a custom element on the box. X and Y are in meters so all the canvas methods that draw to grid can be used.
 * Options is a free object that you can use as you'd like.
 * @param x
 * @param y
 * @param options
 */
function drawCustomElement(x, y, options) {
  naiveBayesianClassifier.drawCustomElement(x, y, options)
}

// let naiveBayesianClassifier = new NaiveBayesian('rssi');
// let naiveBayesianClassifier = new NaiveBayesian('distance');
let naiveBayesianClassifier = new NaiveBayesian('log');