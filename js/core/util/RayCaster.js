

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

let ALL_LINES = [];

function checkIntersections(startXpx, startYpy, xPx,yPx) {
  let roomIds = Object.keys(ROOMS);

  ALL_LINES = [];
  for (let i = 0; i < roomIds.length; i++) {
    let roomCorners = ROOMS[roomIds[i]].corners;
    
    if (roomCorners.length > 0) {
      for (let j = 1; j < roomCorners.length; j++) {
        ALL_LINES.push([roomCorners[j - 1], roomCorners[j]])
      }

      ALL_LINES.push([roomCorners[roomCorners.length - 1], roomCorners[0]])
    }
  }

  return _checkIntersections(startXpx,startYpy,xPx,yPx, ALL_LINES);
}


/**
 * @param startX
 * @param startY
 * @param targetX
 * @param targetY
 * @param pairsOfPoints    || array of lines
 * @returns {Array}
 */
function _checkIntersections(startX, startY, targetX, targetY, pairsOfPoints) {
  let intersectionPoints = [];

  let padding = 0.4*BLOCK_SIZE;
  let stepSize = padding;

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


  let checkWall = (stepX, stepY, c1, c2) => {
    let minX = Math.min(c1.x, c2.x) - padding;
    let maxX = Math.max(c1.x, c2.x) + padding;
    let minY = Math.min(c1.y, c2.y) - padding;
    let maxY = Math.max(c1.y, c2.y) + padding;


    if (!(stepX >= minX && stepX <= maxX && stepY >= minY && stepY <= maxY)) {
      return false;
    }

    let rect = getRect(c1,c2,padding);
    let rectSurface = getSurfaceOfRect(rect) + 10;  // +10 to avoid rounding errors
    let triangles = [
      [null, rect[0], rect[1]],
      [null, rect[0], rect[2]],
      [null, rect[2], rect[3]],
      [null, rect[3], rect[1]],
    ];

    triangles[0][0] = {x: stepX, y: stepY};
    triangles[1][0] = {x: stepX, y: stepY};
    triangles[2][0] = {x: stepX, y: stepY};
    triangles[3][0] = {x: stepX, y: stepY};

    if (checkIntersectionWithWall(triangles, rect, rectSurface)) {
      return true
    }

    return false;
  }


  let previouslyInWall = false;
  let stepX = startX;
  let stepY = startY;
  for (let i = 0; i < stepCount; i++) {
    let inWall = false;
    stepX += stepSizeX;
    stepY += stepSizeY;

    let c1, c2;
    // console.log(pairsOfPoints)
    for (let k = 0; k < pairsOfPoints.length; k++) {
      c1 = metersToPixels(pairsOfPoints[k][0].x,pairsOfPoints[k][0].y);
      c2 = metersToPixels(pairsOfPoints[k][1].x,pairsOfPoints[k][1].y);

      if (checkWall(stepX, stepY, c1, c2)) {
        inWall = true;
        break;
      }

      // let m1 = pixelsToMeters(c1.x, c1.y, false);
      // let m2 = pixelsToMeters(c2.x, c2.y, false);
      // drawLineOnGrid(m1.x, m1.y, m2.x, m2.y, 10, )
    }

    if (inWall) {
      // let m = pixelsToMeters(stepX, stepY, false);
      // drawCircleOnGrid(m.x, m.y, 2, '#0f0');
    }
    else {
      if (previouslyInWall === true) {
        intersectionPoints.push([stepX, stepY]);
        // let m = pixelsToMeters(stepX, stepY, false);
        // drawCircleOnGrid(m.x, m.y, 10, '#F0f');
      }

      // let m = pixelsToMeters(stepX, stepY, false);
      // drawCircleOnGrid(m.x, m.y, 1, '#00f');
    }


    previouslyInWall = inWall;
  }
  
  return intersectionPoints;
}




function multicast(startX, startY, targetX, targetY, room, highAccuracy = false) {
  let intersectionPoints = [];
  if (!room.corners)           { return intersectionPoints; }
  if (room.corners.length < 3) { return intersectionPoints; }


  let padding = 0.4*BLOCK_SIZE;
  let stepSize = 1.8*padding;
  if (highAccuracy) {
    padding = 4
    stepSize = 0.5
  }

  padding = 10
  stepSize = 8

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
    let roomIntersections = castRay(fromX, fromY, toX, toY, ROOMS[roomIds[i]]);
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