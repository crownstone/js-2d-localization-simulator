

function renderVisualizeLocationDistribution() {
  evalValues();
  drawAllWalls();
  drawAllCrownstones();

  drawDistribution()
}

function drawDistribution() {
  let xblockCount = Math.ceil(canvas.width / BLOCK_SIZE);
  let yblockCount = Math.ceil(canvas.height / BLOCK_SIZE);
  var data = [];
  for (let i = 0; i < xblockCount; i++) {
    for (let j = 0; j < yblockCount; j++) {
      let xPx = 0.5*BLOCK_SIZE + i*BLOCK_SIZE;
      let yPx = 0.5*BLOCK_SIZE + j*BLOCK_SIZE;

      let {x , y} = pixelsToMeters(xPx, yPx, false);

      let vector = getRssiFromStonesToPoint(x,y);

      let result = evaluateProbabilities(vector);

      let probability = result[SELECTED_ROOM_ID];

      let factor = Math.min(1,Math.max(0,probability));
      let rgb = hsv2rgb((1-factor) * 270, 1, 1);
      let minOpacity = 0.4;
      let color = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (factor*(1-minOpacity) + minOpacity) + ')';
      drawSquareOnGrid(x, y, BLOCK_SIZE, color);

      data.push({x:i*blockSize+0.5*blockSize, y:j*blockSize+0.5*blockSize, z:prob, style:factor})
    }
  }
}

function getRssiFromStonesToPoint(x,y) {
  let result = {};
  for (let i = 0; i < CROWNSTONES.length; i++) {
    let dx = x - CROWNSTONES[i].position.x;
    let dy = y - CROWNSTONES[i].position.y;
    let distance = Math.sqrt(dx*dx + dy*dy);
    result[CROWNSTONES[i].id] = getRSSI(distance);
  }

  return result;
}