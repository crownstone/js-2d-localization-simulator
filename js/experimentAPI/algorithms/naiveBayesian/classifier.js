

class NaiveBayesian {

  constructor( type ) {
    this.distance = false;
    if (type === 'distance') {
      this.distance = true;
    }

    this.fingerprints = {};
    this.sampleSize = {};

    this.MINIMUM_REQUIRED_SAMPLES = 3;
    this.PROBABILITY_MINIMUM = 1e-97;
  }

  summarizeFingerprints(fingerprints) {
    let rooms = Object.keys(fingerprints);

    rooms.forEach((roomId) => {
      this.fingerprints[roomId] = {};
      let crownstones = Object.keys(fingerprints[roomId]);
      crownstones.forEach((stoneId) => {
        let mean = getMean(this._processValue(fingerprints[roomId][stoneId]))
        let std = getStd(this._processValue(fingerprints[roomId][stoneId]), mean)

        // do not allow small standard deviations
        if (std < 3) {
          std = 3;
        }
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
      // let amountOfStonesInFingerprint = Object.keys(this.fingerprints[roomId]).length;
      crownstones.forEach((stoneId) => {
        if (inputVector[stoneId] !== undefined) {
          let measuredValue = this._processValue(inputVector[stoneId]);
          let summary = this.fingerprints[roomId][stoneId];
          let exponent = Math.exp(-(Math.pow(measuredValue - summary.mean,2)/(2*Math.pow(summary.std,2))));
          let stoneProbability = exponent / (Math.sqrt(2*Math.PI) * summary.std);
          probability *= stoneProbability;
          sampleCount++;
        }
      });



      // require at least 2 samples in a fingerprint
      if (sampleCount >= this.MINIMUM_REQUIRED_SAMPLES) {
        probability = Math.pow(probability, 1 / sampleCount);
      }
      else {
        probability = 0;
      }
      probabilities[roomId] = probability;
      this.sampleSize[roomId] = sampleCount;
    });

    let acceptableProbability = false;
    rooms.forEach((roomId) => {
      if (probabilities[roomId] > this.PROBABILITY_MINIMUM) {
        acceptableProbability = true;
      }
    })

    if (acceptableProbability === false) {
      probabilities['NO_ROOM'] = 1
    }

    return probabilities;
  }

  clear() {
    this.fingerprints = {};
  }


  _processValue(rssi) {
    if (this.distance) {
      if (Array.isArray(rssi)) {
        let result = [];
        rssi.forEach((r) => {
          result.push(getDistanceFromRssi(r));
        })
        return result;
      }

      return getDistanceFromRssi(rssi)
    }
    return rssi;
  }

  drawCustomElement(x,y, options) {
    let color = "#000"
    if (options && options.color) {
      color = options.color;
    }
    drawTextOnGrid(this.sampleSize[SELECTED_ROOM_ID], x, y, 0, 0, 9, 'center', color);
  }



}