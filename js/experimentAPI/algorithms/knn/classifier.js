/**
 * Current implementation k-NN classifier with k=1.
 */
class knn {

  constructor( type ) {
    this.dataset = {};

    this.trained = false;

    this.crownstone_count;

    // beyond this threshold it is considered NO_ROOM
    //this.threshold = 4;
    //this.threshold = 3000;
    
    //this.distance_type = 'euclidean';
    //this.threshold = 100;

   // this.distance_type = 'jaccard';
  //  this.threshold = 2;
  
    this.distance_type = 'smd';
    this.threshold = 0.1;
  }

  config(params) {
    console.log("Set crownstone count to:", params.crownstone_count);
    this.crownstone_count = params.crownstone_count;
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
   * We take the quadratic value of the differences of elements that co-occur in array 1 and 2. There should be 
   * at least `threshold` items co-occuring or we will return undefined.
   */
  pseudo_euclidean(tuple_array1, tuple_array2, threshold) {
    // inner product for elements in array1 that also exist in array2
    let total_distance = 0;
    let match = 0;
    for (let key in tuple_array1) {
      if (!tuple_array2[key]) continue;

      let dist = Math.pow(tuple_array1[key] - tuple_array2[key], 2);
      match++;
      total_distance += dist;
    }
    // We at least want to have a couple of matches
    if (match < threshold) {
      total_distance = undefined;
    } 
    // We do not normalize the vector
    return total_distance;
  }

  /**
   * Can be seen as a distance metric between sets. The values themselves are not taken into account. 
   * The Jaccard index is the following:
   *   jaccard = |A I B| / |A U B| = |A I B| / (|A| |B| - |A I B|)
   * Here I stands for intersection, and U for union. |.| stands for number of elements in the set.
   *
   * This metric can be used if the number of unique crownstones itself can already be used as a good indication
   * of where a person is. This does not use the RSS values themselves.
   *
   * The Jaccard distance is one minus the Jaccard index. Let us use an offset of 1.
   */
  jaccard_distance(set1, set2) {
    let size1 = Object.keys(set1).length;
    let size2 = Object.keys(set2).length;
    let intersection = 0;
    for (let key in set1) {
      if (set2[key]) {
        intersection++;
      }
    }
    let union = size1 + size2 - intersection;
    if (union === 0) {
      throw new Error("Union should never be zero (at least one input vectors should be non-zero)");
    }
    let result = intersection / union;
    let offset = 1;
    return 1 - result + offset;
  }

  /**
   * Simple matching distance or 1 - simple matching index. The latter is also known as Rand coefficient.
   * This metric also awards if the test and train vector both do NOT see a particular Crownstone.
   */
  simple_matching_distance(set1, set2) {
    let size1 = Object.keys(set1).length;
    let size2 = Object.keys(set2).length;
    let tt = 0, tf = 0, ft = 0;
    for (let key in set1) {
      if (set2[key]) {
        tt++;
      } else {
        tf++;
      }
    }
    for (let key in set2) {
      if (!set1[key]) {
        ft++;
      }
    }
    let n = this.crownstone_count;
    let ff = n - (tf + ft + tt);
    let result = (ff + tt) / n;
    return 1 - result; 
  }

  /**
   * At a particular location X we will see crownstones c0, c1, c2, each with RSSI values. For some of the 
   * combinations we have a label Y (room label). The distance vector should be able to compare location x0 with
   * location x1. 
   *
   * This function should be called preferably with tuple_array1 much smaller than tuple_array2.
   */
  distance(tuple_array1, tuple_array2) {
    if (this.distance_type === 'euclidean') {
      return this.pseudo_euclidean(tuple_array1, tuple_array2, 5); 
    } else if (this.distance_type === 'jaccard') {
      return this.jaccard_distance(tuple_array1, tuple_array2);
    } else if (this.distance_type === 'smd') {
      return this.simple_matching_distance(tuple_array1, tuple_array2);
    } else {
      throw new Error("Unknown distance metric");
    }
  }

  /**
   * Due to crappy support for sparse vectors inputVector is a key-value array 
   * [(crownstone_id rssi), (crownstone_id rssi) ], etc.
   */
  classify(inputVector) {
    if (inputVector === null) {
      throw new Error("Error: input vector is null");
    }
    if (this.trained === false) {
      throw new Error("Error: no training data!");
    }

    // check if there are actually RSSI values in the inputVector
    let data_size = Object.keys(inputVector).length;
    //console.log(data_size);
    if (data_size <= 2) {
      //console.log("Fingerprint has very little data", inputVector);
    }

    let probabilities = {};
    let distances = [];

    let rooms = Object.keys(this.dataset);
    if (rooms.length === 0) {
      throw new Error("Error: rooms should be non-empty");
    }
    
    // clear probability vector
    rooms.forEach((roomId) => {
      probabilities[roomId] = 0;
    });
    probabilities['NO_ROOM'] = 0;
    
    let d;
    rooms.forEach((roomId) => {
      let fingerprints = this.dataset[roomId];
      fingerprints.forEach((fingerprint) => {
        let data = fingerprint.data; 
        let result = {};
        d = this.distance(inputVector, data);
        result.distance = d;
        result.roomId = roomId;
        distances.push(result);
      });
    });

    if (distances.length === 0) {
      throw new Error("Error: no distances (rooms without fingerprints?)");
    }

    let minimal_distance = {};
    minimal_distance.distance = Infinity;
    minimal_distance.roomId = undefined;
    distances.forEach((result) => {
      if (result.distance !== undefined && result.distance <= minimal_distance.distance) {
        //console.log("Distance:", result.distance);
        minimal_distance = result;
      }
    });
    //console.log("Minimum distance:", minimal_distance.distance);

    if (minimal_distance.distance > this.threshold) {
      probabilities['NO_ROOM'] = 1
    } 
    else if (minimal_distance.roomId === undefined || minimal_distance.roomId === 0) {
      console.error("Error: roomId should always be defined and non-zero", minimal_distance);
      probabilities['NO_ROOM'] = 1
    } else {
      // assume distance to be between 0 and Infinity, then we map to a pseudo-probability between 1 and 0.
      probabilities[minimal_distance.roomId] = 1 - Math.atan( minimal_distance.distance );
    }
    probabilities['room'] = minimal_distance.roomId;
    probabilities['distance'] = minimal_distance.distance;
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
