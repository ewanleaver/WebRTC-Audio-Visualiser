$(document).ready(function() {

  // Shim the prefixes
  navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia ||
                         navigator.webkitGetUserMedia || navigator.msGetUserMedia;

  var peer = new Peer({
    key: '8f4f7ea3-6341-483a-8ab1-f36865df0299',
    debug: 3
  });

  peer.on('open', function(){
    $('#my-id').text(peer.id);
  });

  // Receiving a call
  peer.on('call', function(call) {
    call.answer(window.localStream);
    call.on('stream', function(stream){
      $('#remoteAudio').prop('src', URL.createObjectURL(stream));
    });
    $('.call-ui').hide();
  });

  peer.on('error', function(err){
    console.log(err.message);
  });

  // Click handlers setup
  $(function(){
    $('#make-call').click(function(){
      // Initiate a call!
      var call = peer.call($('#input-id').val(), window.localStream);
    });
  });

  var mediaConstraints = {
    video: false,
    audio: true
  };

  // Get audio stream
  navigator.getUserMedia(mediaConstraints, getUserMediaSuccess, getUserMediaError);

  var localAudioContext;
  var localAudioSource;
  var localAnalyser;

  function getUserMediaSuccess(stream) {
    window.localStream = stream;
    $('#localAudio').prop('src', URL.createObjectURL(stream));

    localAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    localAudioSource = localAudioContext.createMediaStreamSource(stream);
    // Used to retrieve frequency data
    localAnalyser = localAudioContext.createAnalyser();

    // Bind our localAnalyser to the media element source
    localAudioSource.connect(localAnalyser);
    localAudioSource.connect(localAudioContext.destination);

    // Run the loop
    render();
  }

  function getUserMediaError(error) {
    console.log('errorだよ');
  }

  // Get frequency data and visualise it
  var localFreqData = new Uint8Array(100);
  var localFreqDataOne = new Uint8Array(1);

  var localSvgHeight = $(window).height();
  var localSvgWidth = $(window).width();
  var barPadding = 1;

  function createSvg(parent, height, width) {
    return d3.select(parent).append('localSvg').attr('height', height).attr('width', width);
  }

  var localSvg = createSvg('body', localSvgHeight, localSvgWidth);

  // Create our initial graph visualisation
  // We don't care about height and y attributes until music starts playing
  localSvg.selectAll('rect')
    .data(localFreqData)
    .enter()
    .append('rect')
    .attr('x', function(d, i) {
      return i * (localSvgWidth / localFreqData.length);
    })
    .attr('width', localSvgWidth / localFreqData.length - barPadding);

  // Continuously loop and update with frequency data
  function render() {
    requestAnimationFrame(render);

    // Copy frequency data to localFreqData array
    localAnalyser.getByteFrequencyData(localFreqData);
    localAnalyser.getByteFrequencyData(localFreqDataOne);

    // Update local d3 graph with new data
    localSvg.selectAll('rect')
      .data(localFreqData)
      .attr('y', function(d) {
        return localSvgHeight/2-1.75*d;
      })
      .attr('height', function(d) {
        return 3.5*d;
      })
      .attr('fill', function(d) {
        return 'rgb(' + d + ', ' + 0 + ', ' + 0 + ')';
      });

    d3.select('body')
      .data(localFreqDataOne)
      .style('background-color', function(d) {
        var value = d*0.2;
        return 'rgb(' + value + ', ' + value + ', ' + d*0.5 + ')';
      });
  }

});
