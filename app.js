$(document).ready(function() {

  // Shim the prefixes
  navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia ||
                         navigator.webkitGetUserMedia || navigator.msGetUserMedia;

  var peer = new Peer({
    key: '8f4f7ea3-6341-483a-8ab1-f36865df0299',
    debug: 3
  });
  var connected = false;

  peer.on('open', function(){
    $('#my-id').text(peer.id);
  });

  // Receiving a call
  peer.on('call', function(call) {
    call.answer(window.localStream);
    setRemoteStream(call);

    connected = true;
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
      setRemoteStream(call);
    });
  });

  function setRemoteStream(call) {
    call.on('stream', function(stream){
      console.log("Got remote stream!");
      $('#remoteAudio').prop('src', URL.createObjectURL(stream));
    
      remoteAudioContext = new (window.AudioContext || window.webkitAudioContext)();
      remoteAudioSource = remoteAudioContext.createMediaStreamSource(stream);
      // Used to retrieve frequency data
      remoteAnalyser = remoteAudioContext.createAnalyser();

      // Bind our localAnalyser to the media element source
      remoteAudioSource.connect(remoteAnalyser);
      remoteAudioSource.connect(remoteAudioContext.destination);
    });
  }

  var mediaConstraints = {
    video: false,
    audio: true
  };

  // Get audio stream
  navigator.getUserMedia(mediaConstraints, getUserMediaSuccess, getUserMediaError);

  var localAudioContext;
  var localAudioSource;
  var localAnalyser;
  var remoteAudioContext;
  var remoteAudioSource;
  var remoteAnalyser;

  function getUserMediaSuccess(stream) {
    window.localStream = stream;
    $('#audioLocal').prop('src', URL.createObjectURL(stream));

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
  var freqBars = 100;
  var localFreqData = new Uint8Array(freqBars);
  var localFreqDataOne = new Uint8Array(1);
  var remoteFreqData = new Uint8Array(freqBars);
  var dummyData = [100];

  var svgHeight = $(window).height();
  var svgWidth = $(window).width();
  var barPadding = 1;

  function createSvg(parent, height, width) {
    return d3.select(parent).append('svg').attr('height', height).attr('width', width);
  }

  var localSvg = createSvg('body', svgHeight, svgWidth);
  var remoteSvg = createSvg('body', svgHeight, svgWidth);

  // Create our initial graph visualisation
  // We don't care about height and y attributes until music starts playing
  localSvg.selectAll('rect')
    .data(localFreqData)
    .enter()
    .append('rect')
    .attr('x', function(d, i) {
      return i * (svgWidth / localFreqData.length);
    })
    .attr('width', svgWidth / localFreqData.length - barPadding);

  remoteSvg.selectAll('rect')
    .data(remoteFreqData)
    .enter()
    .append('rect')
    .attr('x', function(d, i) {
      return i * (svgWidth / remoteFreqData.length);
    })
    .attr('width', svgWidth / remoteFreqData.length - barPadding);

  // Continuously loop and update with frequency data
  function render() {
    requestAnimationFrame(render);

    // Copy frequency data to freqData arrays and update local graph
    localAnalyser.getByteFrequencyData(localFreqData);
    localAnalyser.getByteFrequencyData(localFreqDataOne);

    localSvg.selectAll('rect')
      .data(localFreqData)
      .attr('y', function(d) {
        return svgHeight/2;
      })
      .attr('height', function(d) {
        return 2*d;
      })
      .attr('fill', function(d) {
        return 'rgb(' + d + ', ' + 0 + ', ' + 0 + ')';
      });

    if (connected) {
      console.log("Updating remote graph");
      // Update remote graph with new data (if we are connected)
      remoteAnalyser.getByteFrequencyData(remoteFreqData);

      remoteSvg.selectAll('rect')
        .data(localFreqData)
        .attr('y', function(d) {
          console.log(d);
          return svgHeight/2 - 2*d;
        })
        .attr('height', function(d) {
          return 2*d;
        })
        .attr('fill', function(d) {
          return 'rgb(' + 0 + ', ' + 200 + ', ' + d + ')';
        });
    }

    d3.select('body')
      .data(localFreqDataOne)
      .style('background-color', function(d) {
        var value = d*0.2;
        return 'rgb(' + value + ', ' + value + ', ' + d*0.5 + ')';
      });
  }

});
