

function renderVisualizeLocationDistribution() {
  evalValues();
  drawAllWalls();
  drawAllCrownstones();

  drawDistribution()
}

function drawDistribution() {
  let xblockCount = Math.ceil(canvas.width / BLOCK_SIZE);
  let yblockCount = Math.ceil(canvas.height / BLOCK_SIZE);

  for (let i = 0; i < xblockCount; i++) {
    for (let j = 0; j < yblockCount; j++) {
      let xPx = 0.5*BLOCK_SIZE + i*BLOCK_SIZE;
      let yPx = 0.5*BLOCK_SIZE + j*BLOCK_SIZE;

      let {x , y} = pixelsToMeters(xPx, yPx, false);

      let vector = getRssiFromStonesToPoint(x,y);

      let result = evaluateProbabilities(vector);

      let roomsInResult = Object.keys(result);
      let max = 0;
      let maxId = 0;
      roomsInResult.forEach((roomId) => {
        if (max < result[roomId]) {
          max = result[roomId];
          maxId = roomId;
        }
      });

      data.push({x:i*blockSize+0.5*blockSize, y:j*blockSize+0.5*blockSize, z:max, style: 0.5})

      if (maxId === "NO_ROOM") {
        drawSquareOnGrid(x,y, BLOCK_SIZE, 'rgba(255,0,0,0.7)')
      }
      else {
        if (!ROOMS[maxId]) {
          console.warn("UNKNOWN ROOM", maxId)
          drawSquareOnGrid(x, y, BLOCK_SIZE, 'rgba(255,0,0,1)')
        }
        else {
          if (!ROOMS[maxId].color) {
            console.warn("NO COLOR DEFINED FOR ROOM", maxId)
            drawSquareOnGrid(x, y, BLOCK_SIZE, 'rgba(255,255,0,1)')
          }
          else {
            drawSquareOnGrid(x, y, BLOCK_SIZE, ROOMS[maxId].color)
          }
        }
      }
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