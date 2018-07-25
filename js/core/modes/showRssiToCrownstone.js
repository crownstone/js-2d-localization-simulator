

function initRSSItoCrownstonesHandler() {
  unsubscribeEvents.push(eventBus.on("CanvasClick", (point) => {
    let {x , y} = pixelsToMeters(point.x, point.y);

    CROWNSTONES.forEach((crownstone) => {
      let p = crownstone.position;
      let mRadius = 15 / METERS_IN_PIXELS;
      if (x >= p.x - mRadius && x <= p.x + mRadius && y >= p.y - mRadius && y < p.y + mRadius) {
        SELECTED_STONE_ID = crownstone.id;
        setStoneSelectionToStoneId(SELECTED_STONE_ID)
      }
    })
    render();
  }))
}


function setStoneSelectionToStoneId(stoneId) {
  let selectedStoneIndex = 0;
  for (let i = 0; i < CROWNSTONES.length; i++) {
    if (stoneId == CROWNSTONES[i].id) {
      selectedStoneIndex = i;
      break;
    }
  }

  stoneSelect.selectedIndex = selectedStoneIndex;
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

  vis3dDataset.clear();
  let data = [];

  let selectedCrownstone = null;
  CROWNSTONES.forEach((stone) => {
    if (SELECTED_STONE_ID == stone.id) {
      selectedCrownstone = stone;
    }
  })

  let lowest = 0;
  let highest = -50;
  for (let i = 0; i < xblockCount; i++) {
    for (let j = 0; j < yblockCount; j++) {
      let xPx = 0.5 * BLOCK_SIZE + i * BLOCK_SIZE;
      let yPx = 0.5 * BLOCK_SIZE + j * BLOCK_SIZE;

      let {x, y} = pixelsToMeters(xPx, yPx, false);

      let rssi = getRssiFromStoneToPoint(selectedCrownstone, x, y, true)


      if (rssi > -40) {
        rssi = -40;
      }

      lowest = Math.min(lowest, rssi);
      highest = Math.max(highest, rssi);
    }
  }

  let thresholdedLowest = Math.max(RSSI_THRESHOLD, lowest);
  let range = highest - thresholdedLowest;

  for (let i = 0; i < xblockCount; i++) {
    for (let j = 0; j < yblockCount; j++) {
      let xPx = 0.5 * BLOCK_SIZE + i * BLOCK_SIZE;
      let yPx = 0.5 * BLOCK_SIZE + j * BLOCK_SIZE;

      let {x, y} = pixelsToMeters(xPx, yPx, false);

      let rssi = getRssiFromStoneToPoint(selectedCrownstone, x, y, true);

      let graph3d_rawFactor = (rssi - lowest) / range;
      let graph3d_factor = Math.min(1,Math.max(0,graph3d_rawFactor));

      if (rssi < RSSI_THRESHOLD) {
        drawSquareOnGrid(x, y, BLOCK_SIZE, "rgba(0,0,0,0.7)");

        data.push({
          x: i * BLOCK_SIZE + 0.5 * BLOCK_SIZE,
          y: -j * BLOCK_SIZE + 0.5 * BLOCK_SIZE,
          z: rssi,
          style: 0
        })

      }
      else {
        data.push({
          x: i * BLOCK_SIZE + 0.5 * BLOCK_SIZE,
          y: -j * BLOCK_SIZE + 0.5 * BLOCK_SIZE,
          z: rssi,
          style: graph3d_factor
        })


        let rawFactor = (rssi - thresholdedLowest) / range;
        let factor = Math.min(1,Math.max(0,rawFactor));

        factor = Math.round(factor*COLOR_BANDS)*1/COLOR_BANDS

        let rgb = hsv2rgb((1-factor) * 270, 1, 1);
        let minOpacity = 0.3;
        let color = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (factor*(1-minOpacity) + minOpacity) + ')';
        drawSquareOnGrid(x, y, BLOCK_SIZE, color);
      }

    }
  }

  drawTextOnGrid("minValue:" + Math.round(lowest) + " maxValue:" + Math.round(highest) + " threshold:" + RSSI_THRESHOLD, 0, -1);

  // update 3d graph.
  vis3dDataset.update(data);
}

