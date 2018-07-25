

function initPlaceCrownstoneModeHandler() {
  // listen to the events
  keycharmer.bind('backspace', () => {
    if (CROWNSTONES.length > 0) {
      CROWNSTONES.pop();
    }
    render();
  });

  unsubscribeEvents.push(eventBus.on("CanvasClick", (point) => {
    let {x , y} = pixelsToMeters(point.x, point.y);
    let amountOfCrownstones = CROWNSTONES.length;
    CROWNSTONES.push({id:'crownstone-' + (amountOfCrownstones+1), position: {x:x,y:y}, color: COLORS[(amountOfCrownstones+1)%COLORS.length]})
    render();
  }))

  unsubscribeEvents.push(eventBus.on("PrintResults", () => {
    console.log(JSON.stringify(CROWNSTONES, undefined, 2))
  }))
}



function renderPlaceCrownstoneMode() {
  evalValues();
  drawGrid();
  drawAllWalls();
  drawAllCrownstones();
}


function drawAllCrownstones() {
  CROWNSTONES.forEach((stone, index) => {
    drawCrownstone(stone, index)
  })
}

function drawCrownstone(activeStone, index) {
  let color = activeStone.color
  if (color === undefined) {
    color = COLORS[index % COLORS.length]
  }
  drawDoubleBorderedCircleOnGrid(activeStone.position.x, activeStone.position.y, 10, 2, color, "#fff");
  drawTextOnGrid(activeStone.id, activeStone.position.x, activeStone.position.y, -20, -5)
}