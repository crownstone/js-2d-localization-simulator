

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

