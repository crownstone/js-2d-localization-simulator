

function initVisualizeLocationProbabilityHandler() {
  unsubscribeEvents.push(eventBus.on("CanvasClick", (point) => {
    let {x , y} = pixelsToMeters(point.x, point.y);

    let roomIds = Object.keys(ROOMS);
    let changed = false;
    roomIds.forEach((roomId, index) => {
      if (checkIfInRoom(point.x, point.y, ROOMS[roomId])) {
        if (roomId !== SELECTED_ROOM_ID) {
          changed = true;
          SELECTED_ROOM_ID = roomId;
          setRoomSelectionToRoomId(SELECTED_ROOM_ID);
        }
      }
    })

    if (changed) {
      render(true)
      setTimeout(() => { render() }, 10)
    }
  }))


  generateFingerprints();
  clearStoredModels()
  processTrainingData(generateFingerprints());
}


function setRoomSelectionToRoomId(roomId) {
  let roomIds = Object.keys(ROOMS);

  let selectedRoomIndex = 0;
  for (let i = 0; i < roomIds.length; i++) {
    if (roomId == roomIds[i]) {
      selectedRoomIndex = i;
      break;
    }
  }

  roomSelect.selectedIndex = selectedRoomIndex;
}


function renderVisualizeLocationProbabilityDistribution(simple) {
  evalValues();

  if (!simple) {
    drawProbabilityDistribution()
  }

  drawAllWalls();
  drawAllCrownstones();
}

function drawProbabilityDistribution() {
  let xblockCount = Math.ceil(canvas.width / BLOCK_SIZE);
  let yblockCount = Math.ceil(canvas.height / BLOCK_SIZE);

  vis3dDataset.clear();
  var data = [];

  let lowest = 1e9
  let highest = 0
  let vectors = [];
  for (let i = 0; i < xblockCount; i++) {
    vectors.push([])
    for (let j = 0; j < yblockCount; j++) {
      let xPx = 0.5 * BLOCK_SIZE + i * BLOCK_SIZE;
      let yPx = 0.5 * BLOCK_SIZE + j * BLOCK_SIZE;

      let {x, y} = pixelsToMeters(xPx, yPx, false);

      let vector = getRssiFromStonesToPoint(x, y);
      vectors[i].push(vector)
      let result = evaluateProbabilities(vector);

      let probability = result[SELECTED_ROOM_ID];

      lowest = Math.min(lowest, probability);
      highest = Math.max(highest, probability);
    }
  }

  let range = highest - lowest;

  for (let i = 0; i < xblockCount; i++) {
    for (let j = 0; j < yblockCount; j++) {
      let xPx = 0.5*BLOCK_SIZE + i*BLOCK_SIZE;
      let yPx = 0.5*BLOCK_SIZE + j*BLOCK_SIZE;

      let {x , y} = pixelsToMeters(xPx, yPx, false);

      let vector = vectors[i][j]

      let result = evaluateProbabilities(vector);

      let probability = result[SELECTED_ROOM_ID];

      if (probability === 0) {
        drawSquareOnGrid(x, y, BLOCK_SIZE, "rgba(0,0,0,0.7)");
        drawCustomElement(x,y, {color: '#fff'})
      }
      else {
        let rawFactor = (probability - lowest) / range;
        let factor = Math.min(1, Math.max(0, rawFactor));

        data.push({
          x: i * BLOCK_SIZE + 0.5 * BLOCK_SIZE,
          y: - j * BLOCK_SIZE + 0.5 * BLOCK_SIZE,
          z: probability,
          style: factor
        })

        factor = Math.round(factor * COLOR_BANDS) * 1 / COLOR_BANDS

        let rgb = hsv2rgb((1 - factor) * 270, 1, 1);
        let minOpacity = 0.3;
        let color = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (factor * (1 - minOpacity) + minOpacity) + ')';
        drawSquareOnGrid(x, y, BLOCK_SIZE, color);

        drawCustomElement(x,y)
      }
    }
  }

  // update 3d graph.
  vis3dDataset.update(data);
}
