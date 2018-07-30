/**
 * Current implementation k-NN classifier with k=1.
 */
class knn {

  constructor( type ) {
    this.dataset = {};

    this.trained = false;

    // beyond this threshold it is considered NO_ROOM
    this.threshold = 30;
    //this.threshold = 3000;
  }

  /**
   * Training phase.
   */
  train(dataset) {
    if (dataset === null) {
      console.log("Error: dataset is empty!");
      return null;
    }
    this.trained = true;
    this.dataset = dataset;
    let rooms = Object.keys(this.dataset);
    rooms.forEach((roomId) => {
      let fingerprints = this.dataset[roomId];
      fingerprints.forEach((fingerprint) => {
        let data = fingerprint.data; 
        let data_size = Object.keys(data).length;
        //console.log(data_size);
        if (data_size === 0) {
          console.log("Error: fingerprint has no data", data);
        }
      });
    });
  }

  /**
   * At a particular location X we will see crownstones c0, c1, c2, each with RSSI values. For some of the 
   * combinations we have a label Y (room label). The distance vector should be able to compare location x0 with
   * location x1. 
   *
   * This function should be called preferably with tuple_array1 much smaller than tuple_array2.
   */
  distance(tuple_array1, tuple_array2) {
    // inner product
    let d = 0;
    let match = 0;
    for (let key in tuple_array1) {
      let dist = Math.sqrt(Math.abs(tuple_array1[key] - tuple_array2[key]));
      if (dist !== undefined) {
        match++;
        d += dist;
      }
    }
    if (match === 0) {
      d = undefined;
    } else {
      d = d/match;
    }
    return d;
  }

  /**
   * Due to crappy support for sparse vectors inputVector is a key-value array 
   * [(crownstone_id rssi), (crownstone_id rssi) ], etc.
   */
  classify(inputVector) {
    if (inputVector === null) {
      console.log("Error: input vector is null!");
      return null;
    }
    if (this.trained === false) {
      console.log("Error: no training done yet.");
      return null;
    }

    // check if there are actually RSSI values in the inputVector
    let data_size = Object.keys(inputVector).length;
    //console.log(data_size);
    if (data_size <= 2) {
      console.log("Fingerprint has very little data", inputVector);
    }

    let probabilities = {};
    let results = [];

    let rooms = Object.keys(this.dataset);
    
    // clear probability vector
    rooms.forEach((roomId) => {
      probabilities[roomId] = 0;
    });
    probabilities['NO_ROOM'] = 0;
    
    if (rooms.length === 0) {
      console.log("Error: rooms should be non-empty");
      return null;
    }

    let d;
    rooms.forEach((roomId) => {
      let fingerprints = this.dataset[roomId];
      fingerprints.forEach((fingerprint) => {
        let data = fingerprint.data; 
        let result = {};
        d = this.distance(inputVector, data);
        result.distance = d;
        result.roomId = roomId;
        results.push(result);
      });
    });

    if (results.length === 0) {
      console.log("Error: no results");
      return null;
    }

    let d_min = {};
    d_min.distance = 1000000000000;
    d_min.roomId = undefined;
    results.forEach((result) => {
      if (result.distance !== NaN && result.distance <= d_min.distance) {
        d_min = result;
      }
    });

    if (d_min.distance > this.threshold) {
      probabilities['NO_ROOM'] = 1
    } else {
      if (d_min.roomId === undefined) {
        probabilities['NO_ROOM'] = 1
        console.log("Huh");
      } else {
        if (d_min.roomId === 0) {
          console.log("Should not happen");
        }
        //probabilities[d_min.roomId] = Math.log((this.threshold - d_min.distance) + 0.01);
        probabilities[d_min.roomId] = d_min.distance;
      }
    }
    let sum = 0;
    for (let key in probabilities) {
      sum += probabilities[key];
    }
    if (sum === 0) {
      console.log("Error: Zero probability vector!");
    }
    //console.log("Probabilities", probabilities);
    return probabilities;
  }

  clear() {
    this.dataset = {};
    this.trained = false;
  }

  drawCustomElement(x,y, options) {
    let color = "#000"
    if (options && options.color) {
      color = options.color;
    }
    //drawTextOnGrid(this.sampleSize[SELECTED_ROOM_ID], x, y, 0, 0, 9, 'center', color);
  }



}
