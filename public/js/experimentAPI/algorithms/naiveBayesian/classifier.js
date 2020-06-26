

class NaiveBayesian {

  constructor( type ) {
    this.mode = type;
    if (type === 'distance') {
      this.MINIMUM_STD = 0.1;
    }
    else if (type === 'log') {
      this.MINIMUM_STD = 0.1;
    }
    else {
      this.MINIMUM_STD = 3;
    }

    this.fingerprints = {};
    this.sampleSize = {};
    this.probability = {};

    this.MINIMUM_REQUIRED_SAMPLES = 3;
    this.PROBABILITY_MINIMUM = 1e-9;
    this.MINIMUM_RSSI = -60;
  }

  config() {
    window.DRAW_CUSTOM_ELEMENTS = true;
  }

  train(fingerprints) {
    let rooms = Object.keys(fingerprints);

    let fingerprintSet = {};
    rooms.forEach((roomId) => {
      fingerprintSet[roomId] = {};
      fingerprints[roomId].forEach((fingerprint) => {
        let crownstonesInVector = Object.keys(fingerprint.data);
        crownstonesInVector.forEach((crownstoneId) => {
          if (!fingerprintSet[roomId][crownstoneId]) {
            fingerprintSet[roomId][crownstoneId] = [];
          }
          fingerprintSet[roomId][crownstoneId].push(fingerprint.data[crownstoneId]);
        })
      })
    });


    rooms.forEach((roomId) => {
      this.fingerprints[roomId] = {};
      let crownstones = Object.keys(fingerprintSet[roomId]);
      crownstones.forEach((stoneId) => {
        let mean = getMean(this._processValue(fingerprintSet[roomId][stoneId]))
        let std = getStd(this._processValue(fingerprintSet[roomId][stoneId]), mean)

        // do not allow small standard deviations
        if (std < this.MINIMUM_STD) {
          std = this.MINIMUM_STD;
        }
        this.fingerprints[roomId][stoneId] = {mean: mean, std: std};
      })
    })

    // ATTENUATION = 3
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
      let amountOfStonesInFingerprint = Object.keys(this.fingerprints[roomId]).length;
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

      // require at least this.MINIMUM_REQUIRED_SAMPLES samples in a fingerprint
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
      probabilities['NO_ROOM'] = 1;
      // rooms.forEach((roomId) => {
      //   probabilities[roomId] = 0;
      // })
    }

    this.probability = probabilities;

    return probabilities;
  }

  clear() {
    this.fingerprints = {};
  }


  _processValue(rssi, applyMin = true) {
    if (this.mode === 'distance') {
      if (Array.isArray(rssi)) {
        let result = [];
        for (let i = 0; i < rssi.length; i++) {
          result.push(getDistanceFromRssi(rssi[i]))
        }
        return result;
      }

      return getDistanceFromRssi(rssi)
    }
    else if (this.mode === 'log') {
      if (Array.isArray(rssi)) {
        let result = [];
        for (let i = 0; i < rssi.length; i++) {
          result.push(Math.pow(10,(rssi[i] - 55)/(-10 * 2)))
        }
        return result;
      }
      return Math.pow(10,(rssi - 55)/(-10 * 2))
    }
    else if (applyMin) {
      if (Array.isArray(rssi)) {
        let result = [];
        for (let i = 0; i < rssi.length; i++) {
          result.push(Math.min(this.MINIMUM_RSSI, rssi[i]));
        }
        return result;
      }
      return Math.min(this.MINIMUM_RSSI, rssi);
    }
    else {
      return rssi;
    }
  }

  drawCustomElement(x,y, options) {
    let color = "#000"
    if (options && options.color) {
      color = options.color;
    }
    if (this.probability[SELECTED_ROOM_ID] < this.PROBABILITY_MINIMUM && this.probability[SELECTED_ROOM_ID] > 0) {
      drawSquareOnGrid(x, y, BLOCK_SIZE, 'rgba(0,0,0,0.8)');
      color = "#fff"
    }

    // drawTextOnGrid(this.sampleSize[SELECTED_ROOM_ID], x, y, 0, 0, 8, 'center', color);
  }



}