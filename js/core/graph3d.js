
function visInit3d() {
  var container = document.getElementById('graph');

  var options = {
    width:  (0.75*canvas.width) + 'px',
    height: (0.75*canvas.height) + 'px',
    style: 'bar-color',
    showPerspective: true,
    showGrid: true,
    showShadow: false,
    keepAspectRatio: true,
    verticalRatio: 0.5
  };

  graph3d = new vis.Graph3d(container, vis3dDataset, options);
}