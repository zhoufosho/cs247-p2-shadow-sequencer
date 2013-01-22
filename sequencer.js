// Whether to only play the first note in the frame.
var playFirstNote = true;

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

var width = 640;
var height = 480;

var svg = d3.select("div#sequencer")
  .append("svg")
    .attr("width", width)
    .attr("height", height);

//Maximum value for a cell.
var maxValue;

// Threshold for considering a cell "on".
var threshValue;

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

  renderFrames(svg, frames);

  var frame = frames[currentFrame];
  for (var i = 0; i < frame.length; i++) {
    if (frame[i] >= threshValue) {
      playSound(i);

      if (playFirstNote) {
        break;
      }
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

function initialSetup(container, frames) {
  var sequencer = d3.select("div#sequencer");

  // Scale the container to match the window size.
  width = sequencer.property("clientWidth");
  height = sequencer.property("clientHeight");
  
  container.attr("width", width);
  container.attr("height", height);
  
  columnWidth = (width / frames.length);
  cellHeight = (height / frames[0].length);
  
  // Calculate the threshold value for blocks.
  maxValue = (blockSize * blockSize) / (scaleFactor * scaleFactor);
  threshValue = (maxValue / 2);

  // Set up the sequencer visualization.
  var columns = container
    .selectAll("g.frame")
    .data(frames);

  columns.enter()
    .append("g")
      .attr("class", "frame")
      .attr("transform", function (d, i) { return translate((i * columnWidth), 0); })
      .append("rect")
        .attr("class", "background")
        .attr("id", function (d, frameNum) { return "frame_" + frameNum; })
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", columnWidth)
        .attr("height", height);

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
        .style("fill", "#ddd")
        .on("click", function (d, cellNum) {
          frames[frameNum][cellNum] = maxValue;
          renderFrames(container, frames);
        });
  });
}

var highlightedFrame = -1;

function renderFrames(container, frames) {
  var columns = container
    .selectAll("g.frame")
    .data(frames);
  
  columns.each(function(d, frameNum) {
    var sawNote = false;
    
    d3.select(this).selectAll("rect.cell")
      .data(function(d) { return d; })
      .style("fill", function (d) {
        var isCurrentFrame = (frameNum == currentFrame);
        var thresh = (d >= threshValue);
        var h, s, l;

        var volume = (d / maxValue);
        
        if (thresh) {
          h = (isCurrentFrame ? 150 /* green-cyan */ : 270 /* blue-magenta */);
          s = (volume * 50) + 50;

          // If we're in "play first note only" mode,
          // then color the first block differently.
          if (!sawNote && playFirstNote) {
            h = (isCurrentFrame ? 90 /* yellow-green */ : 210 /* cyan-blue */);
            sawNote = true;
          }
        } else {
          h = 0;
          s = 0;
        }
        
        // All blocks have luminosity based on threshold proximity.
        l = (volume * 25) + 25;
  
        return "hsl(" + h + ", " + s + "%, " + l + "%)";
      });
  });

  // TODO: This is not good D3 style, but it's faster to code...
  if (highlightedFrame != currentFrame) {
    // Remove style from previous frame.
    var previousFrameSvg = columns.filter(function (d, i) { return (i == highlightedFrame); });
    var h = 120;
    
    previousFrameSvg
      .select("rect.background")
      .transition()
      .duration(interval * (frames.length - 2))
      .style("fill", "hsl(" + h + ", 0%, 20%)");
    
    // Apply style to current frame.
    var currentFrameSvg = columns.filter(function (d, i) { return (i == currentFrame); });
    
    currentFrameSvg
      .select("rect.background")
      .style("fill", "hsl(" + h + ", 25%, 40%)");
    
    highlightedFrame = currentFrame;
  }
}

var padding = 2;

// Get filled out later...
var columnWidth;
var cellHeight;

function copyGridToFrames(grid) {
  frames = new Array(grid.length);

  for (var y = 0; y < grid.length; y++) {
    frames[y] = new Array(grid[y].length);

    for (var x = 0; x < grid[y].length; x++) {
      frames[y][x] = grid[y][x];
    }
  }

  renderFrames(svg, frames);
}


function initializeSequencer() {
  initialSetup(svg, blockGrid);
  copyGridToFrames(blockGrid);
}
