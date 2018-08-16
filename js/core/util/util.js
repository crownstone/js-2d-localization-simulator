
function getDistanceFromRssi(rssi) {
  let distance = Math.pow(10,(rssi - CALIBRATION_VALUE)/(-10 * N_VALUE));
  return distance;
}

function getRSSI(distance) {
  let rssi = -(10*N_VALUE)*Math.log10(distance) + CALIBRATION_VALUE;
  return rssi;
}

function getMean(measurements) {
  var total = 0;
  measurements.forEach((element) => {
    total += element;
  })
  return (total / measurements.length)
}

function getStd(measurements, mean) {
  var total = 0;
  measurements.forEach((element) => {
    total += Math.pow(element - mean,2);
  });
  var variance = (total / measurements.length);
  return Math.sqrt(variance);
}


function getFile(filename) {
  return new Promise((resolve, reject) => {
    console.log("Now getting file:",filename)
    loadFromFile(filename, (data) => { resolve(data); }, (err) => { reject(err) })
  })
}


function loadFromFile(path, success, error) {
  var xhr = new XMLHttpRequest();
  xhr.overrideMimeType('application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        success(xhr.responseText, path);
      }
      else {
        if (error === undefined) {
          console.warn("ERROR:", path)
        }
        else {
          error();
        }
      }
    }
  };
  xhr.open("GET", path, true);

  xhr.send();
}



function precalculateWallAbsorptionMapMeter() {
  console.time("precalculateWallAbsorptionMapMeter")
  // we need to set the WALL_RSSI_DROP_PER_DM to something other than 0, else we dont get a map.
  let tmp = WALL_RSSI_DROP_PER_DM;
  let tmp2 = CALCULATE_RSSI_DROP_PER_DISTANCE;
  CALCULATE_RSSI_DROP_PER_DISTANCE = true;
  WALL_RSSI_DROP_PER_DM = -5;
  precalcWalls();
  WALL_ABSORPTION_MAP_METER = resetWallAbsorptionMap()
  _runPrecalc();
  WALL_RSSI_DROP_PER_DM = tmp;
  CALCULATE_RSSI_DROP_PER_DISTANCE = tmp2;
  // console.log("WALL_ABSORPTION_MAP", WALL_ABSORPTION_MAP)
  alert("Finished precalculating wall absorption distance map!")
  console.timeEnd("precalculateWallAbsorptionMapMeter")
}


function precalculateWallAbsorptionMapCount() {
  console.time("precalculateWallAbsorptionMapCount")
  // we need to set the WALL_RSSI_DROP_PER_DM to something other than 0, else we dont get a map.
  let tmp = WALL_RSSI_DROP_PER_WALL;
  let tmp2 = CALCULATE_RSSI_DROP_PER_DISTANCE;
  CALCULATE_RSSI_DROP_PER_DISTANCE = false;
  WALL_RSSI_DROP_PER_WALL = -5;
  WALL_ABSORPTION_MAP_COUNT = resetWallAbsorptionMap()
  _runPrecalc();
  WALL_RSSI_DROP_PER_WALL = tmp;
  CALCULATE_RSSI_DROP_PER_DISTANCE = tmp2;
  // console.log("WALL_ABSORPTION_MAP", WALL_ABSORPTION_MAP)
  alert("Finished precalculating wall absorption count map!")
  console.timeEnd("precalculateWallAbsorptionMapCount")
}

function _runPrecalc() {
  let xblockCount = Math.ceil(canvas.width / BLOCK_SIZE);
  let yblockCount = Math.ceil(canvas.height / BLOCK_SIZE);
  for (let i = 0; i < xblockCount; i++) {
    for (let j = 0; j < yblockCount; j++) {
      let xPx = 0.5*BLOCK_SIZE + i*BLOCK_SIZE;
      let yPx = 0.5*BLOCK_SIZE + j*BLOCK_SIZE;

      let {x , y} = pixelsToMeters(xPx, yPx, false);

      getRssiFromStonesToPoint(x,y, true);
    }
  }
}

function showRoomGroundTruth() {
  let xblockCount = Math.ceil(canvas.width / BLOCK_SIZE);
  let yblockCount = Math.ceil(canvas.height / BLOCK_SIZE);
  for (let i = 0; i < xblockCount; i++) {
    for (let j = 0; j < yblockCount; j++) {
      let xPx = 0.5*BLOCK_SIZE + i*BLOCK_SIZE;
      let yPx = 0.5*BLOCK_SIZE + j*BLOCK_SIZE;

      let roomId = getRoomInClick(xPx,yPx);
      if (roomId === null) {
        drawSquare(xPx, yPx, BLOCK_SIZE, "rgba(0,0,0,0.6)");
      }
      else {
        drawSquare(xPx, yPx, BLOCK_SIZE, hex2rgba(ROOMS[roomId].color,0.5))
      }
    }
  }
}


function download(data, fileName) {
  var dlAnchorElem = document.getElementById('downloadAnchorElem');
  let json = JSON.stringify(data,undefined, 2);
  let blob = new Blob([json], {type: "octet/stream"});
  let url = window.URL.createObjectURL(blob);
  dlAnchorElem.href = url;
  dlAnchorElem.download = fileName;
  dlAnchorElem.click();
  window.URL.revokeObjectURL(url);
};


CanvasRenderingContext2D.prototype.circle = function (x, y, r) {
  this.beginPath();
  this.arc(x, y, r, 0, 2 * Math.PI, false);
  this.closePath();
};
