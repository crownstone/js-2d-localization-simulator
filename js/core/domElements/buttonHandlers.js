
let operationModeSelectDiv = null;
let stoneSelectDiv = null;
let stoneSelect = null;
let roomSelectDiv = null;
let roomSelect = null;
let backButton = null;
let printButton = null;

let unsubscribeEvents = [];

function bindElements() {
  canvas = document.getElementById("canvasContainer");
  canvas.addEventListener("click", canvasClick, false);
  ctx = canvas.getContext("2d");

  operationModeSelectDiv = document.getElementById("operationModeSelectDiv");
  roomSelectDiv  = document.getElementById("roomSelectDiv");
  roomSelect     = document.getElementById("roomSelect");
  stoneSelectDiv = document.getElementById("stoneSelectDiv");
  stoneSelect    = document.getElementById("stoneSelect");
  backButton     = document.getElementById("backButton");
  printButton    = document.getElementById("printButton");
}
function setMode(mode) {
  // reset all listeners
  keycharmer.reset()
  unsubscribeEvents.forEach((unsub) => { unsub() });

  if (mode === null) {
    operationModeSelectDiv.style.display = "block"
    backButton.style.display = "none"
    roomSelectDiv.style.display = "none"
    stoneSelectDiv.style.display = "none"
    printButton.style.display = "none"
  }
  else {
    operationModeSelectDiv.style.display = "none"
    OPERATION_MODE = mode;
    switch (OPERATION_MODE) {
      case "DRAW_ROOMS":
      case "PLACE_TRAINING_POINTS":
      case "VISUALIZE_LOCALIZATION_PROBABILITY":
        roomSelectDiv.style.display = 'block'; break;
      case "SHOW_RSSI_TO_CROWNSTONE":
        stoneSelectDiv.style.display = "block"; break;
    }
    switch (OPERATION_MODE) {
      case "DRAW_ROOMS":
      case "PLACE_CROWNSTONES":
      case "PLACE_TRAINING_POINTS":
        printButton.style.display = 'block'; break;
    }

    backButton.style.display = "block"

    switch (OPERATION_MODE) {
      case "DRAW_ROOMS":
        initDrawRoomModeHandler();
        break
      case "PLACE_CROWNSTONES":
        initPlaceCrownstoneModeHandler();
        break
      case "PLACE_TRAINING_POINTS":
        initPlaceTrainingDataModeHandler();
        break
      case "VISUALIZE_LOCALIZATION_DISTRIBUTION":
        initVisualizeLocationHandler();
        break
      case "VISUALIZE_LOCALIZATION_PROBABILITY":
        initVisualizeLocationProbabilityHandler();
        break
      case "SHOW_RSSI_TO_CROWNSTONE":
        initRSSItoCrownstonesHandler();
        break
      default:

        break
    }


    render();
  }
}

function printResultsToConsole() {
  eventBus.emit("PrintResults")
}

function populateRoomSelect() {
  while (roomSelect.firstChild) {
    roomSelect.removeChild(roomSelect.firstChild);
  }
  let roomIds = Object.keys(ROOMS);
  roomIds.forEach((roomId) => {
    var option = document.createElement("option");
    option.text = roomId;
    roomSelect.add(option);
  });

  SELECTED_ROOM_ID = roomIds[0];

}

function populateStoneSelect() {
  if (CROWNSTONES.length > 0) {
    while (stoneSelect.firstChild) {
      stoneSelect.removeChild(stoneSelect.firstChild);
    }
    CROWNSTONES.forEach((stone) => {
      var option = document.createElement("option");
      option.text = stone.id;
      stoneSelect.add(option);
    });

    SELECTED_STONE_ID = CROWNSTONES[0].id;
  }
}

function changeSelectedRoom() {
  SELECTED_ROOM_ID = roomSelect.options[roomSelect.selectedIndex].innerHTML;
  render();
}

function changeSelectedStone() {
  SELECTED_STONE_ID = stoneSelect.options[stoneSelect.selectedIndex].innerHTML;
  render();
}