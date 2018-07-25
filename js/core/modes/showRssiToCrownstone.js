

function initRSSItoCrownstonesHandler() {

}


function renderRSSItoCrownstones() {
  evalValues();

  drawRssiToCrownstone()

  drawAllWalls();
  drawAllCrownstones();
}




function drawRssiToCrownstone() {
  let xblockCount = Math.ceil(canvas.width / BLOCK_SIZE);
  let yblockCount = Math.ceil(canvas.height / BLOCK_SIZE);

  let selectedCrownstonePosition = {};
  CROWNSTONES.forEach((stone) => {
    if (SELECTED_STONE_ID == stone.id) {
      selectedCrownstonePosition = stone.position;
    }
  })

  let lowest = 0;
  let highest = -50;
  for (let i = 0; i < xblockCount; i++) {
    for (let j = 0; j < yblockCount; j++) {
      let xPx = 0.5 * BLOCK_SIZE + i * BLOCK_SIZE;
      let yPx = 0.5 * BLOCK_SIZE + j * BLOCK_SIZE;

      let {x, y} = pixelsToMeters(xPx, yPx, false);

      let dx = x - selectedCrownstonePosition.x;
      let dy = y - selectedCrownstonePosition.y;
      let distance = Math.sqrt(dx*dx + dy*dy);
      let rssi = getRSSI(distance);

      if (rssi > -40) {
        rssi = -40;
      }

      lowest = Math.min(lowest, rssi);
      highest = Math.max(highest, rssi);
    }
  }

  let range = highest - lowest;

  for (let i = 0; i < xblockCount; i++) {
    for (let j = 0; j < yblockCount; j++) {
      let xPx = 0.5 * BLOCK_SIZE + i * BLOCK_SIZE;
      let yPx = 0.5 * BLOCK_SIZE + j * BLOCK_SIZE;

      let {x, y} = pixelsToMeters(xPx, yPx, false);

      let dx = x - selectedCrownstonePosition.x;
      let dy = y - selectedCrownstonePosition.y;
      let distance = Math.sqrt(dx*dx + dy*dy);
      let rssi = getRSSI(distance);

      let rawFactor = (rssi - lowest) / range;
      let factor = Math.min(1,Math.max(0,rawFactor));

      let rgb = hsv2rgb((1-factor) * 270, 1, 1);
      let minOpacity = 0.3;
      let color = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (factor*(1-minOpacity) + minOpacity) + ')';
      drawSquareOnGrid(x, y, BLOCK_SIZE, color);
    }
  }

  drawTextOnGrid("minValue:" + Math.round(lowest) + " maxValue:" + Math.round(highest), 0, -1);
}

