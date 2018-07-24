let width  = 0;
let height = 0;

let meterInPx = 0;
let paddingInMeters = 0;

let pixelsPadding = 0;

let wIntegerMeters = 0;
let wPaddingCmPx = 0;

let hIntegerMeters = 0;
let hPaddingCmPx = 0;

function evalValues() {
  width  = canvas.width;
  height = canvas.height;

  meterInPx = CANVAS_SETTINGS.meterToPixels;
  paddingInMeters = CANVAS_SETTINGS.paddingInMeters;

  pixelsPadding = paddingInMeters*meterInPx;

  let drawableWidth = width - 2*pixelsPadding;
  let drawableHeight = height - 2*pixelsPadding;

  wIntegerMeters = Math.floor(drawableWidth/meterInPx);
  wPaddingCmPx = 0.5*((drawableWidth/meterInPx) - wIntegerMeters) * meterInPx

  hIntegerMeters = Math.floor(drawableHeight/meterInPx);
  hPaddingCmPx = 0.5*((drawableHeight/meterInPx) - hIntegerMeters) * meterInPx
}


function drawTextOnGrid(text, xInMeters, yInMeters, xPxOffset = 0, yPxOffset = 0, size = 20, align='left', color="#000") {
  ctx.font = size + "px Arial";
  ctx.textAlign = align;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(text,
    pixelsPadding + wPaddingCmPx + xInMeters*meterInPx - xPxOffset,
    pixelsPadding + hPaddingCmPx + yInMeters*meterInPx - yPxOffset
  )
}

function drawLineOnGrid(x1InMeters, y1InMeters, x2InMeters, y2InMeters, width = 1, strokeStyle = "#f00") {
  ctx.beginPath();
  ctx.moveTo(
    pixelsPadding + wPaddingCmPx + x1InMeters*meterInPx,
    pixelsPadding + hPaddingCmPx + y1InMeters*meterInPx);
  ctx.lineTo(
    pixelsPadding + wPaddingCmPx + x2InMeters*meterInPx,
    pixelsPadding + hPaddingCmPx + y2InMeters*meterInPx);

  ctx.lineWidth = width;
  ctx.strokeStyle = strokeStyle

  ctx.stroke();
}

function drawCircleOnGrid(xInMeters,yInMeters, radius = 10, color ='red') {
  ctx.circle(
    pixelsPadding + wPaddingCmPx + xInMeters*meterInPx,
    pixelsPadding + hPaddingCmPx + yInMeters*meterInPx, radius);
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
    pixelsPadding + wPaddingCmPx + xInMeters*meterInPx - 0.5*size,
    pixelsPadding + hPaddingCmPx + yInMeters*meterInPx - 0.5 * size,
    size, size);
  ctx.fill();
  ctx.closePath();
}

function pixelsToMeters(x,y, snap = true) {
  x -= wPaddingCmPx;
  x -= pixelsPadding;
  x /= meterInPx;

  if (snap)
    x = Math.round(x*4)/4

  y -= hPaddingCmPx;
  y -= pixelsPadding;
  y /= meterInPx;

  if (snap)
    y = Math.round(y*4)/4

  return {x,y}
}
