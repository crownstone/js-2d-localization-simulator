

function getRoomInClick(x,y) {
  let roomIds = Object.keys(ROOMS);
  for (let i = 0; i < roomIds.length; i++) {
    if (checkIfInRoom(x,y, ROOMS[roomIds[i]])) {
      return roomIds[i]
    }
  }
  return null;
}

function checkIfInRoom(pointX, pointY, room) {
  return evenOddCheck(pointX, pointY, room)
}

function evenOddCheck(xPx, yPx, room) {
  // x, y -- x and y coordinates of point
  // poly -- a list of tuples [(x, y), (x, y), ...]
  let {x, y} = pixelsToMeters(xPx, yPx, false)
  let poly = room.corners;
  let j = poly.length - 1;
  let c = false
  for (let i = 0; i < poly.length; i++) {
    if (((poly[i].y > y) != (poly[j].y > y)) && (x < poly[i].x + (poly[j].x - poly[i].x) * (y - poly[i].y) / (poly[j].y - poly[i].y))) {
      c = !c;
    }
    j = i;
  }
  return c
}


let ROOMS_WALLS_PRECALC = {}
let ROOMS_PRECALCULATED = false;
function precalcWalls() {
  let roomIds = Object.keys(ROOMS);

  let walls = [];
  for (let i = 0; i < roomIds.length; i++) {
    let roomCorners = ROOMS[roomIds[i]].corners;

    if (roomCorners.length > 0) {
      for (let j = 1; j < roomCorners.length; j++) {
        walls.push({lineM:[roomCorners[j - 1], roomCorners[j]]})
      }

      walls.push({lineM:[roomCorners[roomCorners.length - 1], roomCorners[0]]})
    }
  }

  let thickness = 0.01*WALL_THICKNESS_CM*METERS_IN_PIXELS;
  for (let i = 0; i < walls.length; i++) {
    let wall = walls[i]
    let c1 = metersToPixels(wall.lineM[0].x,wall.lineM[0].y);
    let c2 = metersToPixels(wall.lineM[1].x,wall.lineM[1].y);
    wall.linePx = [c1,c2]

    let minX = Math.min(c1.x, c2.x) - 0.5*thickness;
    let maxX = Math.max(c1.x, c2.x) + 0.5*thickness;
    let minY = Math.min(c1.y, c2.y) - 0.5*thickness;
    let maxY = Math.max(c1.y, c2.y) + 0.5*thickness;

    let rect = getRect(c1,c2,0.5*thickness);
    let rectSurface = getSurfaceOfRect(rect) + 10;  // +10 to avoid rounding errors

    let triangles = [
      [null, rect[0], rect[1]],
      [null, rect[0], rect[2]],
      [null, rect[2], rect[3]],
      [null, rect[3], rect[1]],
    ]

    wall.minX = minX;
    wall.maxX = maxX;
    wall.minY = minY;
    wall.maxY = maxY;

    wall.rectSurface = rectSurface;
    wall.triangles = triangles;
  }
  ROOMS_PRECALCULATED = true;
  ROOMS_WALLS_PRECALC = walls;
}


function checkIntersectionsInMeters(startXpx, startYpy, xPx,yPx) {
  if (!ROOMS_PRECALCULATED) {
    precalcWalls()
  }
  return _checkIntersections(startXpx,startYpy,xPx,yPx, ROOMS_WALLS_PRECALC);
}

function checkIntersectionCount(startXpx, startYpy, xPx,yPx) {
  if (!ROOMS_PRECALCULATED) {
    precalcWalls()
  }
  return getAmountOfWallIntersections(startXpx,startYpy,xPx,yPx);
}

/**
 * @param startX
 * @param startY
 * @param targetX
 * @param targetY
 * @param pairsOfPoints    || array of lines
 * @returns {number}
 */
function _checkIntersections(startX, startY, targetX, targetY, walls) {
  // let intersectionPoints = [];
  let thickness = 0.01*WALL_THICKNESS_CM*METERS_IN_PIXELS;
  let stepSize = 0.95*thickness;

  let ddx = targetX - startX;
  let ddy = targetY - startY;
  let distance = Math.sqrt(ddx*ddx + ddy*ddy);
  let fx = ddx < 0 ? -1 : 1
  let fy = ddy < 0 ? -1 : 1

  let baseStepSizeX = (stepSize * ddx / distance);
  let baseStepSizeY = (stepSize * ddy / distance);

  let stepSizeX = baseStepSizeX;
  let stepSizeY = baseStepSizeY;

  let previouslyInWall = false;
  let stepX = startX;
  let stepY = startY;

  let previousStepX = null;
  let previousStepY = null;
  let wallDistance = 0;

  let count = 0;
  let shrunk = false;

  while (fx*(stepX - targetX) < 0 || fy*(stepY - targetY) < 0) {
    count++;
    if (count > 1000) { break }

    let inWall = false;
    stepX += stepSizeX;
    stepY += stepSizeY;

    for (let k = 0; k < walls.length; k++) {
      let wall = walls[k];
      if (!(stepX >= wall.minX && stepX <= wall.maxX && stepY >= wall.minY && stepY <= wall.maxY)) {
        continue;
      }
      wall.triangles[0][0] = {x: stepX, y: stepY};
      wall.triangles[1][0] = {x: stepX, y: stepY};
      wall.triangles[2][0] = {x: stepX, y: stepY};
      wall.triangles[3][0] = {x: stepX, y: stepY};

      // drawLine(wall.linePx[0].x, wall.linePx[0].y, wall.linePx[1].x, wall.linePx[1].y, thickness, 'rgba(255,0,0,0.1)' )

      let triangleSurface = getSurfaceOfTriangleArray(wall.triangles);
      if (triangleSurface < wall.rectSurface) {
        inWall = true;
        break;
      }
    }


    // adaptive stepsize
    if (inWall && !previouslyInWall && shrunk == false) {
      // step back, enter w small steps
      if (previousStepX) {
        stepX = previousStepX;
        stepY = previousStepY;
      }

      // enter wall
      stepSizeX = 0.2*baseStepSizeX;
      stepSizeY = 0.2*baseStepSizeY;

      shrunk = true;
      continue;
    }
    else if (!inWall && previouslyInWall) {
      shrunk = false;
      // exit wall
      stepSizeX = baseStepSizeX;
      stepSizeY = baseStepSizeY;
    }


    if (inWall) {
      if (previousStepX) {
        let dx = previousStepX - stepX;
        let dy = previousStepY - stepY;
        wallDistance += Math.sqrt(dx*dx + dy*dy);
      }

      // let m = pixelsToMeters(stepX, stepY, false);
      // drawCircleOnGrid(m.x, m.y, 2, '#0f0');
    }
    else {
      if (previouslyInWall === true) {
        // intersectionPoints.push([stepX, stepY]);
        // let m = pixelsToMeters(stepX, stepY, false);
        // drawCircleOnGrid(m.x, m.y, 10, '#F0f');
      }

      // let m = pixelsToMeters(stepX, stepY, false);
      // drawCircleOnGrid(m.x, m.y, 1, '#00f');
    }

    previousStepX = stepX;
    previousStepY = stepY;
    previouslyInWall = inWall;
  }
  
  return wallDistance / METERS_IN_PIXELS;
}




function multicast(startX, startY, targetX, targetY, room) {
  let intersectionPoints = [];
  if (!room.corners)           { return intersectionPoints; }
  if (room.corners.length < 3) { return intersectionPoints; }


  let padding = 0.4*BLOCK_SIZE
  let stepSize = 8

  let dx = targetX - startX;
  let dy = targetY - startY;
  let distance = Math.sqrt(dx*dx + dy*dy);
  let stepCount = Math.floor( distance / stepSize );

  let stepSizeX = (stepSize * dx / distance);
  let stepSizeY = (stepSize * dy / distance);

  let checkIntersectionWithWall = function(triangles, rect, rectSurface) {
    let triangleSurface = getSurfaceOfTriangleArray(triangles);
    if (triangleSurface < rectSurface) {
      // the point is in the rectangle!
      return true;
    }
    return false;
  }

  let evaluateIntersectionPoint = function(x,y) {
    for (let i = 0; i < intersectionPoints.length; i++) {
      let dx = intersectionPoints[i][0] - x;
      let dy = intersectionPoints[i][1] - y;
      let dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 2*padding) {
        return false;
      }
    }
    return true;
  }

  let cast = function (c1,c2) {
    let minX = Math.min(c1.x, c2.x) - padding;
    let maxX = Math.max(c1.x, c2.x) + padding;
    let minY = Math.min(c1.y, c2.y) - padding;
    let maxY = Math.max(c1.y, c2.y) + padding;

    let rect = getRect(c1,c2,padding);
    let rectSurface = getSurfaceOfRect(rect) + 10;  // +10 to avoid rounding errors
    let triangles = [
      [null, rect[0], rect[1]],
      [null, rect[0], rect[2]],
      [null, rect[2], rect[3]],
      [null, rect[3], rect[1]],
    ];

    let previouslyInWall = false;
    let stepX = startX;
    let stepY = startY;
    for (let i = 0; i < stepCount; i++) {
      let inWall = false;
      stepX += stepSizeX;
      stepY += stepSizeY;

      if (!(stepX >= minX && stepX <= maxX && stepY >= minY && stepY <= maxY)) {

        // let m = pixelsToMeters(stepX, stepY, false);
        // drawCircleOnGrid(m.x, m.y, 1, '#00f');

        if (inWall !== previouslyInWall && inWall === false) {
          // state Change!
          if (evaluateIntersectionPoint(stepX, stepY)) {
            intersectionPoints.push([stepX, stepY]);
          }
        }
        previouslyInWall = inWall;
        continue;
      }

      // let m = pixelsToMeters(stepX, stepY, false);
      // drawCircleOnGrid(m.x, m.y, 3, '#0F0');

      triangles[0][0] = {x: stepX, y: stepY};
      triangles[1][0] = {x: stepX, y: stepY};
      triangles[2][0] = {x: stepX, y: stepY};
      triangles[3][0] = {x: stepX, y: stepY};
      if (checkIntersectionWithWall(triangles, rect, rectSurface)) {
        inWall = true;
      }

      if (inWall !== previouslyInWall && inWall === false) {
        // state Change!
        if (evaluateIntersectionPoint(stepX, stepY)) {
          intersectionPoints.push([stepX, stepY]);
        }
      }

      previouslyInWall = inWall;
    }
  }

  let c1, c2;

  for (let k = 1; k < room.corners.length; k++) {
    c1 = metersToPixels(room.corners[k - 1].x, room.corners[k - 1].y);
    c2 = metersToPixels(room.corners[k].x, room.corners[k].y)
    cast(c1,c2);
  }

  c1 = metersToPixels(room.corners[0].x, room.corners[0].y);

  cast(c1,c2);

  return intersectionPoints;
}


/**
 * values in pixels
 * @param fromX
 * @param fromY
 * @param toX
 * @param toY
 * @returns {number}
 */
function getAmountOfWallIntersections(fromX, fromY, toX, toY) {
  let roomIds = Object.keys(ROOMS);
  let intersections = [];
  let intersectionMap = {};
  for (let i = 0; i < roomIds.length; i++) {
    let roomIntersections = multicast(fromX, fromY, toX, toY, ROOMS[roomIds[i]]);
    for (let j = 0; j < roomIntersections.length; j++) {}
    roomIntersections.forEach((intersection) => {
      let intersectionId = 'x:' + Math.round(intersection[0]) + ',y:' + Math.round(intersection[1]);
      if (intersectionMap[intersectionId] === undefined) {
        intersections.push(intersection)
      }
      intersectionMap[intersectionId] = true;
    })
  };

  return intersections.length;

}

function getSurfaceOfTriangleArray(triangleArray) {
  let surface = 0;
  // console.log("SEARCH")
  for (let i = 0; i < triangleArray.length; i++) {
    let triangle = triangleArray[i]
    let a = Math.sqrt(Math.pow(triangle[0].x - triangle[1].x, 2) + Math.pow(triangle[0].y - triangle[1].y, 2));
    let b = Math.sqrt(Math.pow(triangle[1].x - triangle[2].x, 2) + Math.pow(triangle[1].y - triangle[2].y, 2));
    let c = Math.sqrt(Math.pow(triangle[2].x - triangle[0].x, 2) + Math.pow(triangle[2].y - triangle[0].y, 2));

    let s = 0.5 * (a + b + c); // semiPerimeter
    let triangleSurface = Math.sqrt(s * (s - a) * (s - b) * (s - c))
    // console.log(triangle, a,b,c,triangleSurface)
    surface += triangleSurface;
  }
  // console.log("RESULT", surface)
  return surface;
}

function getSurfaceOfRect(rect) {
  let innerTriangles = [
    [rect[0], rect[1], rect[2]],
    [rect[0], rect[2], rect[3]]
  ];
  return getSurfaceOfTriangleArray(innerTriangles);
}

function getRect(point1, point2, padding) {
  let dx = point1.x - point2.x;
  if (dx == 0) {
    return [
      {x: point1.x - padding, y: point1.y},
      {x: point1.x + padding, y: point1.y},
      {x: point2.x - padding, y: point2.y},
      {x: point2.x + padding, y: point2.y},
    ]
  }

  let dy = point1.y - point2.y;

  if (dy == 0) {
    return [
      {x: point1.x, y: point1.y + padding},
      {x: point1.x, y: point1.y - padding},
      {x: point2.x, y: point2.y + padding},
      {x: point2.x, y: point2.y - padding},
    ]
  }

  let d = Math.sqrt(dx*dx + dy*dy);

  return [
    {x: point1.x - (dx/d)*padding, y: point1.y + (dy/d)*padding},
    {x: point1.x + (dx/d)*padding, y: point1.y - (dy/d)*padding},
    {x: point2.x - (dx/d)*padding, y: point2.y + (dy/d)*padding},
    {x: point2.x + (dx/d)*padding, y: point2.y - (dy/d)*padding},
  ]
}