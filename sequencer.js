var width = 600,
    height = 600;

var color = d3.scale.category20();
var radius = d3.scale.sqrt().range([2,16]);

var svgBars, svgNodes, svgLinks;

var svg = d3.select("div#sequencer")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var frames = [
    [0,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    ];

// List of samples to load.
var sample_files = [
    "media/Mildon Lite Piano 024 127.ogg",
    "media/Mildon Lite Piano 031 127.ogg",
    "media/Mildon Lite Piano 036 127.ogg",
    "media/Mildon Lite Piano 038 127.ogg",
    "media/Mildon Lite Piano 040 127.ogg",
    "media/Mildon Lite Piano 041 127.ogg",
    "media/Mildon Lite Piano 043 127.ogg",
    "media/Mildon Lite Piano 045 127.ogg",
    "media/Mildon Lite Piano 047 127.ogg",
    "media/Mildon Lite Piano 048 127.ogg",
    "media/Mildon Lite Piano 050 127.ogg",
    "media/Mildon Lite Piano 052 127.ogg",
    "media/Mildon Lite Piano 053 127.ogg",
    "media/Mildon Lite Piano 055 127.ogg",
    "media/Mildon Lite Piano 057 127.ogg",
    "media/Mildon Lite Piano 059 127.ogg",
    "media/Mildon Lite Piano 060 127.ogg", // C4
    "media/Mildon Lite Piano 062 127.ogg", // D4
    "media/Mildon Lite Piano 064 127.ogg", // E4
    "media/Mildon Lite Piano 065 127.ogg", // F4
    "media/Mildon Lite Piano 067 127.ogg", // G4
    "media/Mildon Lite Piano 069 127.ogg", // A4
    "media/Mildon Lite Piano 071 127.ogg", // B4
    "media/Mildon Lite Piano 072 127.ogg",
    "media/Mildon Lite Piano 074 127.ogg",
    "media/Mildon Lite Piano 076 127.ogg",
    "media/Mildon Lite Piano 077 127.ogg",
    "media/Mildon Lite Piano 079 127.ogg",
    "media/Mildon Lite Piano 081 127.ogg",
    "media/Mildon Lite Piano 083 127.ogg",
    "media/Mildon Lite Piano 084 127.ogg",
    "media/Mildon Lite Piano 089 127.ogg",
    "media/Mildon Lite Piano 095 127.ogg",
  ];

// Select just the notes we need.
sample_files = sample_files.slice(15, 25).reverse();

var bpm = 95;
var tempo = 4;
var interval = (3600 / bpm) * tempo;

function translate(x, y) {
  return "translate(" + x + ", " + y + ")";
}
  
// Starts playing frames.
function startLooping() {
  if (looper == null) {
      looper = setInterval("playNextFrame()", interval);
  }
}

// Stops playing frames.
function stopLooping() {
  if (looper != null) {
      clearInterval(looper);
      looper = null;
  }
}

var currentFrameSvg = null;
  
// Plays a single frame and advances the frame position.
function playNextFrame() {
  if (currentFrame >= frames.length) {
    currentFrame = 0;
  }
  
  if (currentFrameSvg != null) {
    currentFrameSvg
      .style("fill-opacity", 0.5)
      .transition()
        .duration(interval * (frames.length - 2))
        .style("fill-opacity", 0);
  }
  
  currentFrameSvg = d3.select("#frame_" + currentFrame);
  currentFrameSvg.style("fill-opacity", 1.0);
  
  var frame = frames[currentFrame];
  for (var i = 0; i < frame.length; i++) {
    if (frame[i]) {
      playSound(i);
    }
  }
  
  currentFrame++;
}

var currentFrame = 0;
var looper = null;

// Asynchronously load all the sample files.
for (var i = 0; i < sample_files.length; i++) {
  loadSoundAsync(i, sample_files[i]);
}

function renderFrames(container, frames) {
  // Set up the sequencer visualization.
  var columns = container
    .selectAll("g.frame")
    .data(frames);
  
  columns.enter()
    .append("g")
      .attr("class", "frame")
      .attr("transform", function (d, i) { return translate((i * columnWidth), 0); })
      .attr("alpha", 0.5)
      .append("rect")
        .attr("id", function (d, frameNum) { return "frame_" + frameNum; })
        .attr("x", -padding)
        .attr("y", -padding)
        .attr("width", columnWidth + (padding * 2))
        .attr("height", height + (padding * 2))
        .style("fill", "#99d")
        .style("fill-opacity", 0);
  
  columns.each(function (frameData, frameNum) {
      var cells = d3.select(this)
        .selectAll("rect.cell")
        .data(frameData);
      
      cells.enter()
        .append("rect")
          .attr("class", "cell")
          .attr("id", function (d, cellNum) { return "cell_" + frameNum + "_" + cellNum; })
          .attr("x", padding)
          .attr("y", function (d, i) { return (i * cellHeight) + padding; })
          .attr("width", columnWidth - (padding * 2))
          .attr("height", cellHeight - (padding * 2))
          .on("click", function(d, cellNum) {
            // Toggle the cell, then re-render everything.
            frames[frameNum][cellNum] = !frames[frameNum][cellNum];
            renderFrames(container, frames);
          });
      
      cells.filter(function (d) { return d; }).style("fill", "#d33");
      cells.filter(function (d) { return !d; }).transition().style("fill", "#ddd");
    });
}

var padding = 2;
var columnWidth = (width / frames.length);
var cellHeight = (height / frames[0].length);

renderFrames(svg, frames);
