$(document).ready(function() {

  var audioContext = new (window.AudioContext || window.webkitAudioContext)();
  var audioElement = document.getElementById('audioElement');
  var audioSource = audioContext.createMediaElementSource(audioElement);
  // Used to retrieve frequency data
  var analyser = audioContext.createAnalyser();

  // Bind our analyser to the media element source
  audioSource.connect(analyser);
  audioSource.connect(audioContext.destination);


  // Get frequency data and visualise it
  var freqData = new Uint8Array(400);

  var svgHeight = $(window).height();
  var svgWidth = $(window).width();//'1200';
  var barPadding = 0;

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

    // Update d3 graph with new data
    svg.selectAll('rect')
      .data(freqData)
      .attr('y', function(d) {
        return svgHeight-d;
      })
      .attr('height', function(d) {
        return 10*d;
      })
      .attr('fill', function(d) {
        return 'rgb(' + 0 + ', ' + 0 + ', ' + (2*d) + ')';
      });
  }

  // Run the loop
  render();
});
