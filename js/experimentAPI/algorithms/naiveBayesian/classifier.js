

class NaiveBayesian {

  constructor() {
    this.fingerprints = {};
  }

  summarizeFingerprints(fingerprints) {
    let rooms = Object.keys(fingerprints);

    rooms.forEach((roomId) => {
      this.fingerprints[roomId] = {};
      let crownstones = Object.keys(fingerprints[roomId]);
      crownstones.forEach((stoneId) => {
        let mean = getMean(fingerprints[roomId][stoneId])
        let std = getStd(fingerprints[roomId][stoneId], mean)
        this.fingerprints[roomId][stoneId] = {mean: mean, std: std};
      })
    })
  }

  classify(inputVector) {
    let probabilities = {};
    let rooms = Object.keys(this.fingerprints);

    // let max = 0;
    // let maxLabel = 0;
    rooms.forEach((roomId) => {
      let crownstones = Object.keys(this.fingerprints[roomId]);
      let probability = 1;
      let sampleCount = 0;
      crownstones.forEach((stoneId) => {
        if (inputVector[stoneId] !== undefined) {
          let rssi = inputVector[stoneId];
          let summary = this.fingerprints[roomId][stoneId];
          let exponent = Math.exp(-(Math.pow(rssi - summary.mean,2)/(2*Math.pow(summary.std,2))));
          let stoneProbability = exponent / (Math.sqrt(2*Math.PI) * summary.std);
          probability *= stoneProbability;
          sampleCount++;
        }
      });

      probability = Math.pow(probability, 1/sampleCount);
      probabilities[roomId] = probability;
    })

    return probabilities;
  }

  clear() {
    this.fingerprints = {};
  }



}