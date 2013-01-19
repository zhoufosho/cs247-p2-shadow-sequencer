var audioContext = new webkitAudioContext();
var audioBuffers = {};

function loadSoundAsync(id, url) {
  var loader = new BufferLoader(
    audioContext, [ url ],
    function(bufferList) {
      audioBuffers[id] = bufferList[0];
      console.log("loaded " + url + " as " + id);
    }
  );

  loader.load();
}

function playSound(id) {
  var source = audioContext.createBufferSource();
  source.buffer = audioBuffers[id];
  source.connect(audioContext.destination);
  source.noteOn(0);
}
