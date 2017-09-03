document.addEventListener('DOMContentLoaded', function () {

    // References to all the element we will need.
    var video = document.querySelector('#camera-stream'),
        image = document.querySelector('#snap'),
        start_camera = document.querySelector('#start-camera'),
        controls = document.querySelector('.controls'),
        take_photo_btn = document.querySelector('#take-photo'),
        change_photo_btn = document.querySelector('#change-photo'),
        delete_photo_btn = document.querySelector('#delete-photo'),
        download_photo_btn = document.querySelector('#download-photo'),
        error_message = document.querySelector('#error-message');

    var cameras = [];

    var videoSelect = document.querySelector('select#videoSource');    

    // The getUserMedia interface is used for handling camera input.
    // Some browsers need a prefix so here we're covering all the options
    navigator.getMedia = ( 
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
    );


    // videoSelect.onchange = getStream;
    
    navigator.mediaDevices.enumerateDevices().then(getDevices);

    // console.log(cameras)

    function getDevices(deviceInfos) {
        for (var i = 0; i !== deviceInfos.length; ++i) {
        var deviceInfo = deviceInfos[i];
        var option = document.createElement('option');
        option.value = deviceInfo.deviceId;
          if (deviceInfo.kind === 'videoinput') {
            cameras.push(deviceInfo);
            option.text = deviceInfo.label || 'camera ' +
            (videoSelect.length + 1);
            videoSelect.appendChild(option);
          } else {
            // console.log('Found one other kind of source/device: ', deviceInfo);
          }
        }
    }


    videoSelect.onchange = getStream;
    

    
function getStream() {
    if (window.stream) {
      window.stream.getTracks().forEach(function(track) {
        track.stop();
      });
    }
  
    var constraints = {
      video: {
        optional: [{
          sourceId: videoSelect.value
        }]
      }
    };
  
    navigator.mediaDevices.getUserMedia(constraints).
      then(gotStream).catch(handleError);
  }
  
  function gotStream(stream) {
    window.stream = stream; // make stream available to console
    // video.srcObject = stream;
    video.src = window.URL.createObjectURL(stream);

    // Play the video element to start the stream.
    video.play();
    video.onplay = function() {
        showVideo();
    };
  }
  
  function handleError(error) {
    console.log('Error: ', error);
  }

    if(!navigator.getMedia){
        displayErrorMessage("Your browser doesn't have support for the navigator.getUserMedia interface.");
    }
    else{
        // Request the camera.
        navigator.getMedia(
            {
                video: {
                    optional: [{
                      sourceId: videoSelect.value
                    }]
                }
            },
            // Success Callback
            function(stream) {
                // Create an object URL for the video stream and
                // set it as src of our HTLM video element.
                video.src = window.URL.createObjectURL(stream);
                console.log(videoSelect.value);
                // Play the video element to start the stream.
                video.play();
                video.onplay = function() {
                    showVideo();
                };
         
            },
            // Error Callback
            function(err) {
                displayErrorMessage("There was an error with accessing the camera stream: " + err.name, err);
            }
        );
    }



    // Mobile browsers cannot play video without user input,
    // so here we're using a button to start it manually.
    start_camera.addEventListener("click", function(e) {

        e.preventDefault();

        // Start video playback manually.
        video.play();
        showVideo();

    });

    // videoSelect.onchange = function() {
    //     video.src = window.URL.createObjectURL(stream);
        
    //     // Play the video element to start the stream.
    //     video.play();
    //     video.onplay = function() {
    //         showVideo();
    //     };
    // }

    // change_photo_btn.addEventListener("click", function(e) {
    //     e.preventDefault();

    // });

    take_photo_btn.addEventListener("click", function(e) {

        e.preventDefault();

        var snap = takeSnapshot();

        // Show image. 
        image.setAttribute('src', snap);
        image.classList.add("visible");

        // Enable delete and save buttons
        delete_photo_btn.classList.remove("disabled");
        download_photo_btn.classList.remove("disabled");

        // Set the href attribute of the download button to the snap url.
        download_photo_btn.href = snap;
        

        // Pause video playback of stream.
        video.pause();

    });

    download_photo_btn.addEventListener("click", function(e) {
        e.preventDefault();
        // var request = new XMLHttpRequest();
        // request.open('POST', 'https://serv.astridmehdi.com/upload', true);
        // request.open('POST', 'http://localhost:3000/upload', true);
        // request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        // request.setRequestHeader('Content-Type', 'multipart/form-data');
        // request.send(this.href);

        fetch("http://localhost:3000/upload", {
            method: "POST",
            headers: { "Content-Type": "application/octet-stream" },
            // credentials: "same-origin",            
            body: this.href }).then(function(res) {
                console.log(res.status,res.statusText, res.headers, res.url)
            }, function(error){
                console.log(error.message)
            })
        
        
    });

    delete_photo_btn.addEventListener("click", function(e) {

        e.preventDefault();

        // Hide image.
        image.setAttribute('src', "");
        image.classList.remove("visible");

        // Disable delete and save buttons
        delete_photo_btn.classList.add("disabled");
        download_photo_btn.classList.add("disabled");

        // Resume playback of stream.
        video.play();

    });



    function takeSnapshot() {
        // Here we're using a trick that involves a hidden canvas element.  

        var hidden_canvas = document.querySelector('canvas'),
            context = hidden_canvas.getContext('2d');

        var width = video.videoWidth,
            height = video.videoHeight;

        if (width && height) {

            // Setup a canvas with the same dimensions as the video.
            hidden_canvas.width = width;
            hidden_canvas.height = height;

            // Make a copy of the current frame in the video on the canvas.
            context.drawImage(video, 0, 0, width, height);

            // Turn the canvas image into a dataURL that can be used as a src for our photo.
            return hidden_canvas.toDataURL('image/png');
        }
    }


    function showVideo() {
        hideUI();
        video.classList.add("visible");
        controls.classList.add("visible");
    }


    function displayErrorMessage(error_msg, error) {
        error = error || "";
        if(error){
            console.error(error);
        }

        error_message.innerText = error_msg;

        hideUI();
        error_message.classList.add("visible");
    }

   
    function hideUI() {
        // Helper function for clearing the app UI.

        controls.classList.remove("visible");
        start_camera.classList.remove("visible");
        video.classList.remove("visible");
        snap.classList.remove("visible");
        error_message.classList.remove("visible");
    }

});
