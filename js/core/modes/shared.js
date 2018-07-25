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
  ctx.circle(
    pixelsPadding + wPaddingCmPx + xInMeters*METERS_IN_PIXELS,
    pixelsPadding + hPaddingCmPx + yInMeters*METERS_IN_PIXELS, radius);
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
  x -= wPaddingCmPx;
  x -= pixelsPadding;
  x /= METERS_IN_PIXELS;

  if (snap)
    x = Math.round(x*4)/4

  y -= hPaddingCmPx;
  y -= pixelsPadding;
  y /= METERS_IN_PIXELS;

  if (snap)
    y = Math.round(y*4)/4

  return {x,y}
}
