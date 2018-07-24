

function initDrawRoomModeHandler() {
  // listen to the events
  keycharmer.bind('backspace', () => {
    let activeWallSet = ROOMS[SELECTED_ROOM_ID];

    if (activeWallSet.corners === undefined || activeWallSet.corners.length === 0) {
      // done
    }
    else {
      activeWallSet.corners.pop()
    }

    render();
  });

  unsubscribeEvents.push(eventBus.on("CanvasClick", (point) => {
    let {x , y} = pixelsToMeters(point.x, point.y);

    let activeWallSet = ROOMS[SELECTED_ROOM_ID];

    if (activeWallSet.corners === undefined || activeWallSet.corners.length === 0) {
      activeWallSet.corners = [];
    }

    activeWallSet.corners.push({x:x, y:y})

    render();
  }))

  unsubscribeEvents.push(eventBus.on("PrintResults", () => {
    console.log(JSON.stringify(ROOMS, undefined, 2))
  }))
}

