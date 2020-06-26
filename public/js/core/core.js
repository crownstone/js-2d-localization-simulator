

let canvas = null;
let ctx = null;

let ROOMS = {};
let CROWNSTONES = [];
let TRAINING_LOCATIONS = {};



function coreInit(path, postfix) {
  bindElements()
  loadConfig(path, postfix)
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
      render()
      // showRoomGroundTruth()
    })
}

function resetWallAbsorptionMap() {
  let map = {};
  map['blockSize'] = BLOCK_SIZE;
  map['paddingInMeters'] = PADDING_IN_METERS;
  map['paddingInPixels'] = PADDING_IN_METERS*METERS_IN_PIXELS;
  map['metersInPixels'] = METERS_IN_PIXELS;
  map['forRooms'] = JSON.stringify(ROOMS);
  map['forCrownstones'] = JSON.stringify(CROWNSTONES);
  map['forThickness'] = WALL_THICKNESS_CM;
  return map;
}


function loadConfig(path = "./config", postfix = '') {
  let promises = []

  if (path.substr(path.length-1,1) === '/') {
    path = path.substr(0,path.length-1);
  }

  promises.push(
    getFile(path + '/rooms' + postfix + '.json')
      .then((data) => { ROOMS = JSON.parse(data); }).catch((err) => { console.warn('Error in getting rooms:', err) })
  );

  promises.push(
    getFile(path + '/stones' + postfix + '.json')
      .then((data) => { CROWNSTONES = JSON.parse(data); }).catch((err) => { console.warn('Error in getting stones:', err) })
  );

  promises.push(
    getFile(path + '/trainingLocations' + postfix + '.json')
      .then((data) => { TRAINING_LOCATIONS = JSON.parse(data); }).catch((err) => { console.warn('Error in getting trainingLocations:', err) })
  );


  promises.push(
    getFile(path + '/config' + postfix + '.json')
      .then((data) => {
        let settings = JSON.parse(data);

        AUTO_REDRAW_GRAPH3D   = settings.gui.autoRedrawGraph3d;
        DRAW_CUSTOM_ELEMENTS  = settings.gui.drawCustomElements;

        CALCULATE_RSSI_DROP_PER_DISTANCE = settings.system.calculateRssiDropPerDistance;
        WALL_THICKNESS_CM     = settings.system.wallThicknessCm;
        WALL_RSSI_DROP_PER_DM = settings.system.wallRssiDropPerDm;
        WALL_RSSI_DROP_PER_WALL = settings.system.wallRssiDropPerWall;
        ATTENUATION           = settings.system.attenuation;
        ATTENUATION_FACTOR    = settings.system.attenuationFactor;
        N_VALUE               = settings.system.nValue;
        CALIBRATION_VALUE     = settings.system.calibrationValueAt1Meter;
        RSSI_THRESHOLD        = settings.system.rssiThreshold;

        COLOR_BANDS           = settings.canvas.colorBands;
        BLOCK_SIZE            = settings.canvas.blockSizeInPixels; // px
        METERS_IN_PIXELS      = settings.canvas.meterToPixels;
        PADDING_IN_METERS     = settings.canvas.paddingInMeters;

      }).catch((err) => { console.warn('Error in getting settings:', err) })
  );

  return Promise.all(promises)
    .then(() => {
      return getFile(path + '/wallAbsorptionMapCount' + postfix + '.json')
        .then((data) => {
          WALL_ABSORPTION_MAP_COUNT = JSON.parse(data);
          if (WALL_ABSORPTION_MAP_COUNT.blockSize !== BLOCK_SIZE) {
            alert("Wall absorption map is for different block size. Resetting it.");
            WALL_ABSORPTION_MAP_COUNT = resetWallAbsorptionMap()
          }
          else if (WALL_ABSORPTION_MAP_COUNT['forRooms'] !== JSON.stringify(ROOMS)) {
            alert("This wall absorption map is for a different room configuration. Resetting it.")
            WALL_ABSORPTION_MAP_COUNT = resetWallAbsorptionMap()
          }
          else if (WALL_ABSORPTION_MAP_COUNT['forCrownstones'] !== JSON.stringify(CROWNSTONES)) {
            alert("This wall absorption map is for a different Crownstone configuration. Resetting it.")
            WALL_ABSORPTION_MAP_COUNT = resetWallAbsorptionMap()
          }

        }).catch((err) => {
          WALL_ABSORPTION_MAP_COUNT = resetWallAbsorptionMap()
          console.warn('Error in getting wall absorption map:', err)
      })
    })
    .then(() => {
      return getFile(path + '/wallAbsorptionMapMeter' + postfix + '.json')
        .then((data) => {
          WALL_ABSORPTION_MAP_METER = JSON.parse(data);
          if (WALL_ABSORPTION_MAP_METER.blockSize !== BLOCK_SIZE) {
            alert("Wall absorption map is for different block size. Resetting it.");
            WALL_ABSORPTION_MAP_METER = resetWallAbsorptionMap()
          }
          else if (WALL_ABSORPTION_MAP_METER['forRooms'] !== JSON.stringify(ROOMS)) {
            alert("This wall absorption map is for a different room configuration. Resetting it.")
            WALL_ABSORPTION_MAP_METER = resetWallAbsorptionMap()
          }
          else if (WALL_ABSORPTION_MAP_METER['forCrownstones'] !== JSON.stringify(CROWNSTONES)) {
            alert("This wall absorption map is for a different Crownstone configuration. Resetting it.")
            WALL_ABSORPTION_MAP_METER = resetWallAbsorptionMap()
          }
          else if (WALL_ABSORPTION_MAP_METER.forThickness !== WALL_THICKNESS_CM) {
            alert("Wall absorption map is for wall thickness. Resetting it.");
            WALL_ABSORPTION_MAP_METER = resetWallAbsorptionMap()
          }

        }).catch((err) => {
          WALL_ABSORPTION_MAP_METER = resetWallAbsorptionMap()
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