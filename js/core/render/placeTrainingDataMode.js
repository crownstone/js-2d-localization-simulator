

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