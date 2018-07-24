

function canvasClick(clicker) {
  eventBus.emit("CanvasClick", {x: clicker.layerX, y: clicker.layerY})
}


