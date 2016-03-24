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
  var freqData = new Uint8Array(50);
  var freqDataOne = new Uint8Array(1);

  var svgHeight = $(window).height();
  var svgWidth = $(window).width();//'1200';
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
        return svgHeight-3*d;
      })
      .attr('height', function(d) {
        return 3*d;
      })
      .attr('fill', function(d) {
        return 'rgb(' + d + ', ' + 0 + ', ' + d + ')';
      });

    d3.select('body')
      .data(freqDataOne)
      .style('background-color', function(d) {
        var value = d*0.2;
        return 'rgb(' + value + ', ' + value + ', ' + d*0.5 + ')';
      });
      //.style("background-color", "black"); 
  }

  // Run the loop
  render();
});
