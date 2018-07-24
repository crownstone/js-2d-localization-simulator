

let canvas = null;
let ctx = null;

let ROOMS = {};
let CROWNSTONES = {};
let TRAINING_LOCATIONS = {};
let CANVAS_SETTINGS = {};



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
      }
    })
    .then(() => {
      render();
    })
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
    getFile('./config/canvas.json')
      .then((data) => { CANVAS_SETTINGS = JSON.parse(data); }).catch((err) => { console.warn('Error in getting canvas settings:', err) })
  );

  return Promise.all(promises);
}


function render() {
  // clear room
  ctx.clearRect(0,0, canvas.width, canvas.height);
  // ctx.beginPath();
  // ctx.rect(0,0,canvas.width, canvas.height);
  // ctx.fillStyle = "red";
  // ctx.fill();


  switch (OPERATION_MODE) {
    case "DRAW_ROOMS":
      renderDrawRoom();
      break
    case "PLACE_CROWNSTONES":
      renderPlaceCrownstoneMode()
      break
    case "PLACE_TRAINING_POINTS":
      renderPlaceTrainingDataMode()
      break
    case "VISUALIZE_LOCALIZATION_DISTRIBUTION":
      renderVisualizeLocationDistribution();
      break
    case "VISUALIZE_LOCALIZATION_PROBABILITY":
      renderVisualizeLocationProbabilityDistribution();
      break
    case "SHOW_RSSI_TO_CROWNSTONE":
      renderRSSItoCrownstones();
      break
    default:
      break
  }

}