/**
 * This receives a vector of RSSI measurements for each active crownstone.
 *
 * You return an object of probabilities for all rooms in rooms.json. including NO_ROOM
 * @param rssiJson      { crownstoneId1: -53, crownstoneId2: -63, ....}
 * @returns Object      { room-1: [0..1], room-2: [0..1], ... , NO_ROOM: [0..1] }
 */
function evaluateProbabilities( rssiJson ) {
  console.log('rssiJson',rssiJson);
}


/**
 * This receives an object of training data for all rooms which you can process.
 * @param trainingData  {room-1: { crownstone-1: [-42,-53,-53, ....], crownstone-2: [-42,-53,-53, .... ]}, room-2: ....}
 */
function processTrainingData(trainingData) {
  console.log('trainingData',trainingData);
}



/**
 * When this is called, you make sure that your algorithms are cleaned up and ready for a new processTrainingData call
 */
function clearStoredModels() {

}