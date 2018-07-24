

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