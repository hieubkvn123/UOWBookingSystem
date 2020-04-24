$(document).ready(function(){
	var vidStream // for later use
	var interval

	var vidStream2
	var interval2

	$("#close-modal2").click(function(){
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

	$("#close-modal3").click(function(){
		vid = document.getElementById("face_video")

		// pause the video
		vid.pause()

		// suspend the video source, which is user webcam
		vid.src = ""

		// stop all tracks
		vidStream2.getTracks()[0].stop()

		// clear the interval
		clearInterval(interval2)

		$("#myModal3").fadeOut("fast")
	})

	$("#face_login").click(function(){
		$("#myModal3").fadeIn("fast")

		var video = document.getElementById("face_video")
		var canvas = document.getElementById("face_canvas")
		var recordingHint = {'video' : true}

		navigator.mediaDevices.getUserMedia(recordingHint).then(function(camera){
			vidStream2 = camera
			video.srcObject = camera

			// send frame to server every one second
			interval2 = setInterval(function(){
				var context = canvas.getContext("2d")
				var width = video.width
				var height = video.height

				context.drawImage(video, 0, 0, width, height)

				var dataURL = canvas.toDataURL().split(",")[1]
				var blobBin = atob(dataURL)
				var array = []

				for(var i = 0; i < blobBin.length; i++){
					array.push(blobBin.charCodeAt(i))
				}

				var blob = new Blob([new Uint8Array(array)], {type : 'img/jpg'})
				var formData = new FormData()
				formData.append("img", blob)

				$.ajax({
					url : "/face_login",
					type : "POST",
					data : formData, 
					async : true,
					processData : false,
					contentType : false,
					success : function(response){
						// success, fail or none
						if(response == 'none' || response == 'fail')
							console.log("Pending Face Authentication ... ")
						else{
							alert("Access Granted ... ")
							window.location.replace("/user")
						}
					}
				})
			}, 1000)
		})
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