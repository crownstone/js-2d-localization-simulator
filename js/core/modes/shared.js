let width  = 0;
let height = 0;

let pixelsPadding = 0;

let wIntegerMeters = 0;
let wPaddingCmPx = 0;

let hIntegerMeters = 0;
let hPaddingCmPx = 0;

function evalValues() {
  width  = canvas.width;
  height = canvas.height;

  pixelsPadding = PADDING_IN_METERS*METERS_IN_PIXELS;

  let drawableWidth = width - 2*pixelsPadding;
  let drawableHeight = height - 2*pixelsPadding;

  wIntegerMeters = Math.floor(drawableWidth/METERS_IN_PIXELS);
  wPaddingCmPx = 0.5*((drawableWidth/METERS_IN_PIXELS) - wIntegerMeters) * METERS_IN_PIXELS

  hIntegerMeters = Math.floor(drawableHeight/METERS_IN_PIXELS);
  hPaddingCmPx = 0.5*((drawableHeight/METERS_IN_PIXELS) - hIntegerMeters) * METERS_IN_PIXELS
}


function drawTextOnGrid(text, xInMeters, yInMeters, xPxOffset = 0, yPxOffset = 0, size = 20, align='left', color="#000") {
  ctx.font = size + "px Arial";
  ctx.textAlign = align;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(text,
    pixelsPadding + wPaddingCmPx + xInMeters*METERS_IN_PIXELS - xPxOffset,
    pixelsPadding + hPaddingCmPx + yInMeters*METERS_IN_PIXELS - yPxOffset
  )
}

function drawLineOnGrid(x1InMeters, y1InMeters, x2InMeters, y2InMeters, width = 1, strokeStyle = "#f00") {
  ctx.beginPath();
  ctx.moveTo(
    pixelsPadding + wPaddingCmPx + x1InMeters*METERS_IN_PIXELS,
    pixelsPadding + hPaddingCmPx + y1InMeters*METERS_IN_PIXELS);
  ctx.lineTo(
    pixelsPadding + wPaddingCmPx + x2InMeters*METERS_IN_PIXELS,
    pixelsPadding + hPaddingCmPx + y2InMeters*METERS_IN_PIXELS);

  ctx.lineWidth = width;
  ctx.strokeStyle = strokeStyle

  ctx.stroke();
}

function drawCircleOnGrid(xInMeters,yInMeters, radius = 10, color ='red') {
  let pixelValues = metersToPixels(xInMeters,yInMeters)
  ctx.circle(
    pixelValues.x,
    pixelValues.y, radius);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawBorderedCircleOnGrid(xInMeters,yInMeters, radius = 10, borderWidth = 2, color ='red', borderColor = "#fff") {
  drawCircleOnGrid(xInMeters,yInMeters, radius + 2*borderWidth, borderColor)
  drawCircleOnGrid(xInMeters,yInMeters, radius, color)
}

function drawDoubleBorderedCircleOnGrid(xInMeters,yInMeters, radius = 10, borderWidth = 2, color ='red', borderColor = "#fff") {
  drawCircleOnGrid(xInMeters,yInMeters, radius + 3*borderWidth, color)
  drawCircleOnGrid(xInMeters,yInMeters, radius + 2*borderWidth, borderColor)
  drawCircleOnGrid(xInMeters,yInMeters, radius, color)
}

function drawSquare(xInPx,yInPx, size = 10, color ='red') {
  ctx.beginPath();
  ctx.fillStyle = color
  ctx.rect(
    xInPx - 0.5*size,
    yInPx - 0.5 * size,
    size, size);
  ctx.fill();
  ctx.closePath();
}

function drawSquareOnGrid(xInMeters,yInMeters, size = 10, color ='red') {
  ctx.beginPath();
  ctx.fillStyle = color
  ctx.rect(
    pixelsPadding + wPaddingCmPx + xInMeters*METERS_IN_PIXELS - 0.5*size,
    pixelsPadding + hPaddingCmPx + yInMeters*METERS_IN_PIXELS - 0.5 * size,
    size, size);
  ctx.fill();
  ctx.closePath();
}

function pixelsToMeters(x,y, snap = true) {
  x = (x - wPaddingCmPx - pixelsPadding) / METERS_IN_PIXELS;
  y = (y - hPaddingCmPx - pixelsPadding) / METERS_IN_PIXELS;

  if (snap) {
    x = Math.round(x * 4) / 4
    y = Math.round(y * 4) / 4
  }

  return {x,y}
}

function metersToPixels(x,y) {
  return {
    x: Math.round(x*METERS_IN_PIXELS + pixelsPadding + wPaddingCmPx),
    y: Math.round(y*METERS_IN_PIXELS + pixelsPadding + hPaddingCmPx)
  }
}


function getRssiFromStonesToPoint(x, y, ignoreThreshold = false) {
  let result = {};
  for (let i = 0; i < CROWNSTONES.length; i++) {
    let rssi = getRssiFromStoneToPoint(CROWNSTONES[i], x, y, ignoreThreshold);
    if (rssi !== null) {
      result[CROWNSTONES[i].id] = rssi;
    }
  }

  return result;
}

/**
 * all values are in meters;
 * @param stone
 * @param x
 * @param y
 * @param ignoreThreshold
 * @returns {*}
 */
function getRssiFromStoneToPoint(stone, x, y, ignoreThreshold = false) {
  let dx = x - stone.position.x;
  let dy = y - stone.position.y;
  let distance = Math.sqrt(dx*dx + dy*dy);

  if (ATTENUATION > 0) {
    let stoneAngle = 0;
    if (stone.angle) {
      stoneAngle = stone.angle;
    }

    let usedAngle = Math.PI - ((stoneAngle/360)*(2*Math.PI))

    let angle = Math.atan2(dx,dy);
    let factor = Math.abs(Math.sin(angle - usedAngle));
    // console.log("FACTOR", (ATTENUATION_FACTOR + (1-ATTENUATION_FACTOR) + ATTENUATION_FACTOR*(Math.pow(factor,ATTENUATION))))
    distance *= (Number(ATTENUATION_FACTOR) + (1-ATTENUATION_FACTOR) + ATTENUATION_FACTOR*(Math.pow(factor,ATTENUATION)));
  }
  let rssi = getRSSI(distance);

  if (rssi > RSSI_THRESHOLD || ignoreThreshold === true) {
    if (WALL_RSSI_DROP !== 0) {
      let intersectionCount = 0;
      let targetPosInPixels = metersToPixels(x, y)
      if (
        WALL_ABSORPTION_MAP[stone.id] &&
        WALL_ABSORPTION_MAP[stone.id][targetPosInPixels.x] &&
        WALL_ABSORPTION_MAP[stone.id][targetPosInPixels.x][targetPosInPixels.y] !== undefined ) {
        intersectionCount = WALL_ABSORPTION_MAP[stone.id][targetPosInPixels.x][targetPosInPixels.y];
      }
      else {
        let stonePosInPixels = metersToPixels(stone.position.x, stone.position.y)
        intersectionCount = getAmountOfWallIntersections(targetPosInPixels.x, targetPosInPixels.y, stonePosInPixels.x, stonePosInPixels.y);

        if (!WALL_ABSORPTION_MAP[stone.id]) { WALL_ABSORPTION_MAP[stone.id] = {}; }
        if (!WALL_ABSORPTION_MAP[stone.id][targetPosInPixels.x]) { WALL_ABSORPTION_MAP[stone.id][targetPosInPixels.x] = {};  }
        WALL_ABSORPTION_MAP[stone.id][targetPosInPixels.x][targetPosInPixels.y] = intersectionCount;
      }

      rssi += WALL_RSSI_DROP * intersectionCount;
      // drawTextOnGrid(intersectionCount, x,y)
    }

    return rssi;
  }
  return null;
}
