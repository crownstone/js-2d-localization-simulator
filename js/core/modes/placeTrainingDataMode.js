

function initPlaceTrainingDataModeHandler() {
  // listen to the events
  keycharmer.bind('backspace', () => {
    if (!TRAINING_LOCATIONS[SELECTED_ROOM_ID]) {
      TRAINING_LOCATIONS[SELECTED_ROOM_ID] = [];
    }

    if (TRAINING_LOCATIONS[SELECTED_ROOM_ID].length > 0) {
      TRAINING_LOCATIONS[SELECTED_ROOM_ID].pop();
    }

    render();
  });

  unsubscribeEvents.push(eventBus.on("CanvasClick", (point) => {
    let {x , y} = pixelsToMeters(point.x, point.y);

    if (!TRAINING_LOCATIONS[SELECTED_ROOM_ID]) {
      TRAINING_LOCATIONS[SELECTED_ROOM_ID] = [];
    }


    TRAINING_LOCATIONS[SELECTED_ROOM_ID].push({x:x,y:y})
    render();
  }))

  unsubscribeEvents.push(eventBus.on("PrintResults", () => {
    console.log(JSON.stringify(TRAINING_LOCATIONS, undefined, 2))
  }))
}



function renderPlaceTrainingDataMode() {
  evalValues();
  drawGrid();
  drawAllWalls();


  drawAllTrainingPointsInRoom(TRAINING_LOCATIONS[SELECTED_ROOM_ID]);
}

function drawAllTrainingPointsInRoom(trainingDataInRoom) {
  if (!trainingDataInRoom) { return }

  for (let i = 0; i < trainingDataInRoom.length; i++) {
    drawDoubleBorderedCircleOnGrid(trainingDataInRoom[i].x, trainingDataInRoom[i].y, 10, 1, "#007aff", "#fff");
  }

  drawTextOnGrid(trainingDataInRoom.length + " Samples", 0, -1);
}