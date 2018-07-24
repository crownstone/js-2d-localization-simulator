
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
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        success(xhr.responseText, path);
      }
      else {
        if (error === undefined) {
          console.error("ERROR:", path)
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





CanvasRenderingContext2D.prototype.circle = function (x, y, r) {
  this.beginPath();
  this.arc(x, y, r, 0, 2 * Math.PI, false);
  this.closePath();
};