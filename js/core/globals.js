
/** CHANGE THESE VALUES IN CONFIG.JSON **/
    let N_VALUE = 4.0;
    let CALIBRATION_VALUE = -55;
    let RSSI_THRESHOLD = -95;
    let COLOR_BANDS = 15;
    let BLOCK_SIZE = 20; // px
    let METERS_IN_PIXELS = 0;
    let PADDING_IN_METERS = 0;
/** CHANGE THESE VALUES IN CONFIG.JSON **/
// ------------------------------------ //

let OPERATION_MODE = 'DRAW_ROOMS';

let vis3dDataset = new vis.DataSet();
let SELECTED_ROOM_ID = null
let SELECTED_STONE_ID = null
let DRAWING = false;

let eventBus = new EventBusClass()


var keycharmer = keycharm();

let COLORS = [
"#003E52",
"#ff8400",
"#ffa94d",
"#00263e",
"#8a01ff",
"#5801a9",
"#0075c9",
"#2698e9",
"#a0eb58",
"#caff91",
"#1f4c43",
"#4cd864",
"#ff953a",
"#ff3c00",
"#cc0900",
"#e00",
"#007aff",
"#a9d0f1",
"#77c2f7",
"#2daeff",
"#a5dcff",
]