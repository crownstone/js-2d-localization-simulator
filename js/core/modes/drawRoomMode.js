
function initDrawRoomModeHandler() {
  // listen to the events
  keycharmer.bind('backspace', () => {
    resetWallAbsorptionMap();
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
    resetWallAbsorptionMap();
    let {x , y} = pixelsToMeters(point.x, point.y);

    let roomIds = Object.keys(ROOMS);
    roomIds.forEach((roomId, index) => {
      if (checkIfInRoom(point.x, point.y, ROOMS[roomId])) {
        console.log('clicked on room', roomId)
      }
    })

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


function renderDrawRoom() {
  evalValues()
  drawGrid()
  drawAllWalls()
}




function drawGrid() {
  let drawLine = function(i, x1,y1, x2, y2, textXOffset, textYOffset) {
    ctx.beginPath();
    ctx.moveTo( x1, y1);
    ctx.lineTo( x2, y2);

    if (i%10 === 0) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    }
    else if (i % 5 == 0) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    }
    else {
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    }

    ctx.stroke();
  }

  for (let i = 0; i <= wIntegerMeters*10; i++) {
    let w = 0.1*i;
    let style = 'rgba(0,0,0,0.1)';
    if (w % 1 == 0) {
      style = 'rgba(0,0,0,0.7)';
      drawTextOnGrid(w, w, 0, -7, 20, 20, 'right')
    }
    else if (w % 0.5 == 0) {
      style = 'rgba(0,0,0,0.3)';
    }
    drawLineOnGrid(w, 0, w, hIntegerMeters, 1, style);
  }

  for (let i = 0; i <= hIntegerMeters*10; i++) {
    let h = i * 0.1;
    let style = 'rgba(0,0,0,0.1)';
    if (h % 1 == 0) {
      style = 'rgba(0,0,0,0.7)';
      drawTextOnGrid(h, 0, h, 20, -7, 20, 'right')
    }
    else if (h % 0.5 == 0) {
      style = 'rgba(0,0,0,0.3)';
    }
    drawLineOnGrid(0, h, wIntegerMeters, h, 1, style);
  }
}


function drawAllWalls() {
  let roomIds = Object.keys(ROOMS);

  roomIds.forEach((roomId, index) => {
    drawWalls(ROOMS[roomId], roomId, index);
  })
}

function drawWalls(activeWallSet, roomId, index) {
  if (activeWallSet.corners === undefined || activeWallSet.corners.length === 0) {
    // done!
  }
  else {
    let color = activeWallSet.color
    if (color === undefined) {
      color = COLORS[index % COLORS.length]
    }
    activeWallSet.color = color;



    let sumX = 0;
    let sumY = 0;
    let lastCorner = null;
    for (let i = 0; i < activeWallSet.corners.length; i++) {
      let corner = activeWallSet.corners[i];
      drawSquareOnGrid(corner.x, corner.y, 8, color);
      sumX += corner.x;
      sumY += corner.y;
      if (lastCorner) {
        drawLineOnGrid(lastCorner.x, lastCorner.y, corner.x, corner.y, 3, color);
      }

      lastCorner = corner;
    }

    drawLineOnGrid(lastCorner.x, lastCorner.y, activeWallSet.corners[0].x, activeWallSet.corners[0].y, 3, color);

    sumX += activeWallSet.corners[0].x;
    sumY += activeWallSet.corners[0].y;

    sumX /= (activeWallSet.corners.length+1);
    sumY /= (activeWallSet.corners.length+1);

    ctx.fillStyle = '#000';
    drawTextOnGrid(roomId, sumX, sumY, 0, 0, 40, 'center')



  }
}

