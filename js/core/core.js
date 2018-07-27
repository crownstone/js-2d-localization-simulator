

let canvas = null;
let ctx = null;

let ROOMS = {};
let CROWNSTONES = [];
let TRAINING_LOCATIONS = {};



function coreInit() {
  bindElements()
  loadConfig()
    .then(() => {
      if (Object.keys(ROOMS).length === 0) {
        alert("No rooms available. Please add a few room entries to config/rooms.json like this: { \"room-1\":{}, \"room-7\":{} }");
      }
      else {
        populateRoomSelect()
        populateStoneSelect()
        setAttenuation()
      }
    })
    .then(() => {
      render();
    })
}

function resetWallAbsorptionMap() {
  WALL_ABSORPTION_MAP = {};
  WALL_ABSORPTION_MAP['blockSize'] = BLOCK_SIZE;
  WALL_ABSORPTION_MAP['paddingInMeters'] = PADDING_IN_METERS;
  WALL_ABSORPTION_MAP['paddingInPixels'] = PADDING_IN_METERS*METERS_IN_PIXELS;
  WALL_ABSORPTION_MAP['metersInPixels'] = METERS_IN_PIXELS;
  WALL_ABSORPTION_MAP['forRooms'] = JSON.stringify(ROOMS);
  WALL_ABSORPTION_MAP['forCrownstones'] = JSON.stringify(CROWNSTONES);
}


function loadConfig() {
  let promises = []

  promises.push(
    getFile('./config/rooms.json')
      .then((data) => { ROOMS = JSON.parse(data); }).catch((err) => { console.warn('Error in getting rooms:', err) })
  );

  promises.push(
    getFile('./config/stones.json')
      .then((data) => { CROWNSTONES = JSON.parse(data); }).catch((err) => { console.warn('Error in getting stones:', err) })
  );

  promises.push(
    getFile('./config/trainingLocations.json')
      .then((data) => { TRAINING_LOCATIONS = JSON.parse(data); }).catch((err) => { console.warn('Error in getting trainingLocations:', err) })
  );


  promises.push(
    getFile('./config/config.json')
      .then((data) => {
        let settings = JSON.parse(data);

        AUTO_REDRAW_GRAPH3D = settings.gui.autoRedrawGraph3d;
        WALL_RSSI_DROP = settings.system.wallRssiDrop;
        ATTENUATION = settings.system.attenuation;
        ATTENUATION_FACTOR = settings.system.attenuationFactor;
        N_VALUE = settings.system.nValue;
        CALIBRATION_VALUE = settings.system.calibrationValueAt1Meter;
        RSSI_THRESHOLD = settings.system.rssiThreshold;
        COLOR_BANDS = settings.canvas.colorBands;
        BLOCK_SIZE = settings.canvas.blockSizeInPixels; // px
        METERS_IN_PIXELS = settings.canvas.meterToPixels;
        PADDING_IN_METERS = settings.canvas.paddingInMeters;

      }).catch((err) => { console.warn('Error in getting settings:', err) })
  );

  return Promise.all(promises)
    .then(() => {
      return getFile('./config/wallAbsorptionMap.json')
        .then((data) => {
          WALL_ABSORPTION_MAP = JSON.parse(data);
          if (WALL_ABSORPTION_MAP.blockSize !== BLOCK_SIZE) {
            alert("Wall absorption map is for different block size. Resetting it.");
            resetWallAbsorptionMap()
          }
          else if (WALL_ABSORPTION_MAP['forRooms'] !== JSON.stringify(ROOMS)) {
            alert("This wall absorption map is for a different room configuration. Resetting it.")
            resetWallAbsorptionMap()
          }
          else if (WALL_ABSORPTION_MAP['forCrownstones'] !== JSON.stringify(CROWNSTONES)) {
            alert("This wall absorption map is for a different Crownstone configuration. Resetting it.")
            resetWallAbsorptionMap()
          }

        }).catch((err) => {
          resetWallAbsorptionMap()
          console.warn('Error in getting wall absorption map:', err)
      })
    })
}


function render(options) {
  // clear room
  ctx.clearRect(0,0, canvas.width, canvas.height);

  switch (OPERATION_MODE) {
    case "DRAW_ROOMS":
      renderDrawRoom(options);
      break
    case "PLACE_CROWNSTONES":
      renderPlaceCrownstoneMode(options)
      break
    case "PLACE_TRAINING_POINTS":
      renderPlaceTrainingDataMode(options)
      break
    case "VISUALIZE_LOCALIZATION_DISTRIBUTION":
      renderVisualizeLocationDistribution(options);
      break
    case "VISUALIZE_LOCALIZATION_PROBABILITY":
      renderVisualizeLocationProbabilityDistribution(options);
      break
    case "SHOW_RSSI_TO_CROWNSTONE":
      renderRSSItoCrownstones(options);
      break
    default:
      break
  }

  if (AUTO_REDRAW_GRAPH3D) {
    setTimeout(() => { visInit3d(); }, 10);
  }

}