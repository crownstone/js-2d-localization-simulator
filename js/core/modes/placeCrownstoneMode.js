

function initPlaceCrownstoneModeHandler() {
  // listen to the events
  keycharmer.bind('backspace', () => {
    resetWallAbsorptionMap();
    if (CROWNSTONES.length > 0) {
      CROWNSTONES.pop();
    }
    render();
  });

  unsubscribeEvents.push(eventBus.on("CanvasClick", (point) => {
    resetWallAbsorptionMap();
    let {x , y} = pixelsToMeters(point.x, point.y);

    let selectedStone = false;
    CROWNSTONES.forEach((crownstone) => {
      let p = crownstone.position;
      let mRadius = 40 / METERS_IN_PIXELS;
      if (x >= p.x - mRadius && x <= p.x + mRadius && y >= p.y - mRadius && y < p.y + mRadius) {
        selectedStone = true;
        if (!crownstone.angle) {
          crownstone.angle = 0;
        }
        crownstone.angle = (crownstone.angle + 45)%360;
      }
    });

    if (!selectedStone) {
      let amountOfCrownstones = CROWNSTONES.length;
      CROWNSTONES.push({id:'crownstone-' + (amountOfCrownstones+1), position: {x:x,y:y}, angle: 0, color: COLORS[(amountOfCrownstones+1)%COLORS.length]})
    }
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
  let angle = 0;
  if (activeStone.angle) {
    angle = activeStone.angle;
  }

  let usedAngle = Math.PI - ((angle/360)*(2*Math.PI))
  let angleEndX = 30/METERS_IN_PIXELS*Math.sin(usedAngle) + activeStone.position.x;
  let angleEndY = 30/METERS_IN_PIXELS*Math.cos(usedAngle) + activeStone.position.y;

  drawDoubleBorderedCircleOnGrid(activeStone.position.x, activeStone.position.y, 10, 2, color, "#fff");
  drawLineOnGrid(
    activeStone.position.x,
    activeStone.position.y,
    angleEndX,
    angleEndY,
    4, color
  );
  drawCircleOnGrid(angleEndX, angleEndY, 6, color)

  drawTextOnGrid(activeStone.id, activeStone.position.x, activeStone.position.y, -20, -5);


}