

function castRay(targetX, targetY, room) {
  let padding = 10;
  let intersections = 0;

  if (!room.corners) { return false; }
  if (room.corners.length < 3) { return false; }

  let checkIntersectionWithWall = function(x,y,corner1, corner2) {
    let c1 = metersToPixels(corner1.x, corner1.y);
    let c2 = metersToPixels(corner2.x, corner2.y)

    let rect = getRect(c1,c2,padding);

    let triangles = [
      [{x:x, y:y}, rect[0], rect[1]],
      [{x:x, y:y}, rect[0], rect[2]],
      [{x:x, y:y}, rect[2], rect[3]],
      [{x:x, y:y}, rect[3], rect[1]],
    ];

    let triangleSurface = getSurfaceOfTriangleArray(triangles);
    let rectSurface = getSurfaceOfRect(rect);

    // -10 to avoid rounding errors
    if (triangleSurface <= rectSurface + 10) {
      // the point is in the rectangle!
      return true;
    }
    return false;
  }

  let previouslyInWall = null;
  for (let i = 0; i <= targetX; i++) {
    let inWall = false;
    for (let k = 1; k < room.corners.length; k++) {
      if (checkIntersectionWithWall(i, targetY, room.corners[k-1], room.corners[k])) {
        inWall = true;
      }
    }

    if (checkIntersectionWithWall(i, targetY, room.corners[room.corners.length-1], room.corners[0])) {
      inWall = true;
    }

    if (previouslyInWall !== null) {
      if (inWall !== previouslyInWall && inWall === false) {
        // state Change!
        intersections += 1;
      }
    }
    previouslyInWall = inWall;

  }

  return intersections%2 === 1;
}

function getSurfaceOfTriangleArray(triangleArray) {
  let surface = 0;
  // console.log("SEARCH")
  triangleArray.forEach((triangle) => {
    let a = Math.sqrt(Math.pow(triangle[0].x-triangle[1].x,2) + Math.pow(triangle[0].y-triangle[1].y,2));
    let b = Math.sqrt(Math.pow(triangle[1].x-triangle[2].x,2) + Math.pow(triangle[1].y-triangle[2].y,2));
    let c = Math.sqrt(Math.pow(triangle[2].x-triangle[0].x,2) + Math.pow(triangle[2].y-triangle[0].y,2));


    let s = 0.5*(a+b+c); // semiPerimeter
    let triangleSurface = Math.sqrt(s*(s-a)*(s-b)*(s-c))
    // console.log(triangle, a,b,c,triangleSurface)
    surface += triangleSurface;
  })
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