$(document).ready(function(){
	var vidStream // for later use
	var interval

	$("#close-modal2").click(function(){
		console.log("close modal clicked")

		vid = document.getElementById("qr_video")

		// pause the video
		vid.pause()

		// suspend the video source, which is user webcam
		vid.src = ""

		// stop all tracks
		vidStream.getTracks()[0].stop()

		// clear the interval
		clearInterval(interval)

		$("#myModal2").fadeOut("fast")
	})

	$("#qr_login").click(function(){
		$("#myModal2").fadeIn("fast")

		var video = document.getElementById("qr_video")
		var canvas = document.getElementById("qr_canvas")
		var recordingHint = {'video' : true}

		navigator.mediaDevices.getUserMedia(recordingHint).then(function(camera){
			vidStream = camera
			video.srcObject = camera

			// send frame to server every one second
			interval = setInterval(function(){
				var context = canvas.getContext("2d")
				var width = video.width
				var height = video.height

				context.drawImage(video, 0, 0, width, height)

				// convert canvas data into data url
				var dataURL = canvas.toDataURL().split(",")[1]

				// Convert to base64 encoded string
				var blobBin = atob(dataURL)

				// convert the string into an array of number
				var array = []
				for(var i = 0; i < blobBin.length; i++){
					array.push(blobBin.charCodeAt(i))
				}

				// convert that array to blob
				var blob = new Blob([new Uint8Array(array)], {type : 'img/jpg'})

				// now it's ready to be sent to server
				var formData = new FormData()
				formData.append('img', blob)

				$.ajax({
					url : '/qr_login',
					type : 'POST',
					data : formData,
					async : true,
					processData : false,
					contentType : false,
					success : function(response){
						if(response == 'invalid' || response == 'auth_failed'){
							if(response == 'invalid')
								alert("The QR code is invalid ... ")
							else
								alert("Authentication failed ... ")

							vid = document.getElementById("qr_video")

							// pause the video
							vid.pause()

							// suspend the video source, which is user webcam
							vid.src = ""

							// stop all tracks
							vidStream.getTracks()[0].stop()

							// clear the interval
							clearInterval(interval)

							$("#myModal2").fadeOut("fast")
						}else if(response == "none"){
							console.log("Pending QR code ... ")
						}else{
							alert("Access Granted ... ")
							var user = response.split("-")[1]
							window.location.replace("/user")
						}
					}
				})
			}, 1000)
		})
	})
})