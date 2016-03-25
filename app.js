$(document).ready(function() {

  // Shim the prefixes
  navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia ||
                         navigator.webkitGetUserMedia || navigator.msGetUserMedia;

  var mediaConstraints = {
    video: false,
    audio: true
  };

  // Get audio stream
  navigator.getUserMedia(mediaConstraints, getUserMediaSuccess, getUserMediaError);

  var audioContext;
  var audioSource;
  var analyser;

  function getUserMediaSuccess(stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioSource = audioContext.createMediaStreamSource(stream);
    // Used to retrieve frequency data
    analyser = audioContext.createAnalyser();

    // Bind our analyser to the media element source
    audioSource.connect(analyser);
    audioSource.connect(audioContext.destination);

    // Run the loop
    render();
  }

  function getUserMediaError(error) {
    console.log('errorだよ');
  }

  // Get frequency data and visualise it
  var freqData = new Uint8Array(100);
  var freqDataOne = new Uint8Array(1);

  var svgHeight = $(window).height();
  var svgWidth = $(window).width();
  var barPadding = 1;

  function createSvg(parent, height, width) {
    return d3.select(parent).append('svg').attr('height', height).attr('width', width);
  }

  var svg = createSvg('body', svgHeight, svgWidth);

  // Create our initial graph visualisation
  // We don't care about height and y attributes until music starts playing
  svg.selectAll('rect')
    .data(freqData)
    .enter()
    .append('rect')
    .attr('x', function(d, i) {
      return i * (svgWidth / freqData.length);
    })
    .attr('width', svgWidth / freqData.length - barPadding);

  // Continuously loop and update with frequency data
  function render() {
    requestAnimationFrame(render);

    // Copy frequency data to freqData array
    analyser.getByteFrequencyData(freqData);
    analyser.getByteFrequencyData(freqDataOne);

    // Update d3 graph with new data
    svg.selectAll('rect')
      .data(freqData)
      .attr('y', function(d) {
        return svgHeight/2-1.75*d;
      })
      .attr('height', function(d) {
        return 3.5*d;
      })
      .attr('fill', function(d) {
        return 'rgb(' + d + ', ' + 0 + ', ' + 0 + ')';
      });

    d3.select('body')
      .data(freqDataOne)
      .style('background-color', function(d) {
        var value = d*0.2;
        return 'rgb(' + value + ', ' + value + ', ' + d*0.5 + ')';
      });
      //.style("background-color", "black"); 
  }

});
