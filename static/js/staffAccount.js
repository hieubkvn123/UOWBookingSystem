$(document).ready(function(){
	$('.btn-expand-collapse').click(function(e) {
		$('.navbar-primary').toggleClass('collapsed');
	});

	$("#close-modal2").click(function(){
		$("#myModal2").fadeOut("fast") // fade out the dialog
		$("#room_id").val('')
		$("#myModal2 input").val('') // clear out the input entries
	})

	var view_room = function(){
		// just make a simple ajax request to server
		var months = {
			1 : "January",
			2 : "Febuary",
			3 : "March",
			4 : "April",
			5 : "May",
			6 : "June",
			7 : "July",
			8 : "August",
			9 : "September",
			10: "October",
			11: "November",
			12: "December"
		}

		var pad = function(num, size) {
		    var s = num+"";
		    while (s.length < size) s = "0" + s;
		    return s;
		}


		$.ajax({
			url : '/view_room',
			type : "POST",
			data : {}, // no data obviously duh
			async : true,
			processData : false,
			contentType : false,
			success : function(response){
				// the response is a json serialized string
				var objects = JSON.parse(response)

				// clear whatever is in content div
				$("#content").empty()

				// append a list to the content
				$("<ul>")
					.attr("id", "room_list")
					.appendTo("#content")

				// each room is a list item
				for(var i = 0; i < objects.length; i++){
					// convert checkin and checkout date to yyyy-mm-dd
					console.log("Room number " + objects[i].room_id + " occupied : " + objects[i].occupied)

					$("<li>") // attach all information to this <li> for later use
						.attr("room_id", objects[i].room_id)
						.attr("avail_from", objects[i].avail_from)
						.attr("avail_to", objects[i].avail_to)
						.attr("rate", objects[i].rate)
						.attr("capacity", objects[i].capacity)
						.attr("campus", objects[i].campus)
						.attr("occupied", objects[i].occupied)
						.attr("description", objects[i].description)
						.attr("id", "li_" + i)
						.css('listStyleType', 'none')
						.css('margin', '20px')
						.css("opacity", 1.0)
						.css('box-shadow', '5px 10px #888888')
						.hover(function(){ // hover in
							$(this).css("opacity", 0.8)
							$(this).css("cursor", "pointer")
							$(this).css("border", "1px outset green")
						}, function(){ // hover out
							$(this).css("opacity", 1.0)
							$(this).css("border", "none")
						})
						.click(function(){
							$("#room_id").html($(this).attr("room_id"))
							var room_id = $(this).attr("room_id")

							// may be bulky but believe me
							// this gives you the ability to update
							// room details in real time
							var formData = new FormData()
							formData.append("room_id", room_id)
							$.ajax({
								url : '/view_room_by_id',
								type : 'POST',
								data : formData,
								async : true,
								processData : false,
								contentType : false,
								success : function(response){
									// upon receiving the response the information about
									// the room is present
									obj = JSON.parse(response)

									var avail_from = new Date(obj.avail_from)
									var avail_to = new Date(obj.avail_to)

									var avail_from_str = avail_from.getFullYear() + "-" + pad(avail_from.getMonth()+1,2) + "-" + pad(avail_from.getDate(),2)
									var avail_to_str = avail_to.getFullYear() + "-" + pad(avail_to.getMonth() + 1, 2) + "-" + pad(avail_to.getDate(),2)

									$("#avail_from").val(avail_from_str)
									$("#avail_to").val(avail_to_str)

									$("#rate").val(obj.rate)
									$("#capacity").val(obj.capacity)
									$("#description").val(obj.description)

									if(obj.campus == "UOW Wollongong Campus"){
										$("#campus").val("UOW Wollongong Campus")
									}else{
										$("#campus").val("Singapore Institute of Management")
									}

									if(obj.occupied == 1){
										$("#occupied").val("Yes")
									}else{
										$("#occupied").val("No")
									}

									$("#myModal2").fadeIn("fast")
								}
							})
							
						})
						.appendTo("#room_list")

					var html_str = "<strong>Room ID :</strong> " + objects[i].room_id + "<br>"
					
					var avail_from = new Date(objects[i].avail_from)
					var avail_to   = new Date(objects[i].avail_to)

					avail_from_str = months[avail_from.getMonth() + 1] + " " + pad(avail_from.getDate(), 2) + ", " + avail_from.getFullYear()
					avail_to_str = months[avail_to.getMonth() + 1] + " " + pad(avail_to.getDate(), 2) + ", " + avail_to.getFullYear()   
 					
 					html_str += "<strong>Available from : </strong>" + avail_from_str + "<br>"
 					html_str += "<strong>Available to : </strong>" + avail_to_str + "<br>"
 					html_str += "<strong>Rate : </strong>" + pad(objects[i].rate,2) + " $SGD<br>"
 					html_str += "<strong>Campus : </strong>" + objects[i].campus + "<br>"

 					$("<img>")
 						.attr("src", objects[i].img_path)
 						.attr("width", 360)
 						.attr("height", 240)
 						.css("marginRight", "20px")
 						.css("display", "inline-block")
 						.appendTo("#li_" + i)

					$("<p>")
						.html(html_str)
						.attr("id", "p_" + i)
						.css("verticalAlign", "center")
						.css("display", "inline-block")
						.appendTo("#li_" + i)

					$("#li_" + i)
						.hide()
						.fadeIn("slow")
				}	
			}
		})
	}

	$("#view_room").click(function(){
		view_room()
	})

	$("#myModal2 input").on("input", function(){
		if($(this).val() == ""){
			$("#edit_room_btn").attr("disabled", true)
		}else{
			$("#edit_room_btn").attr("disabled", false)
		}
	})

	$("#myModal2 select").change(function(){
		if($(this).val() == ""){
			$("#edit_room_btn").attr("disabled", true)
		}else{
			$("#edit_room_btn").attr("disabled", false)
		}
	})

	// omg I swear to god 
	// all I ask for is delete the damn room -_-
	$("#delete_room_btn").click(function(){
		var room_id = $("#room_id").html() // get room id
		// then just send to server and bam
		// gone
		var formData = new FormData()
		formData.append("room_id", room_id)

		// just a simple good ol ajax
		$.ajax({
			url : "/delete_room",
			type : "POST",
			data : formData,
			async : true,
			processData : false,
			contentType : false,
			success : function(response){
				if(response == "success"){
					alert("Room deleted successfully ... ")
				}else{
					alert("There is something wrong while deleting this room ... ")
				}

				$("#room_id").val('')
				$("#myModal2 input").val('') // clear out the input entries
				$("#edit_room_btn").attr("disabled", true)
				$("#myModal2").fadeOut("fast") // fade out the dialog
				view_room() // refresh the room view
			}
		})
	})

	$("#edit_room_btn").click(function(){
		var avail_from = $("#avail_from").val()
		var avail_to = $("#avail_to").val()
		var rate = $("#rate").val()
		var capacity = $("#capacity").val()
		var description = $("#description").val()
		var campus = $("#campus").val()
		var occupied = $("#occupied").val()
		var room_id = $("#room_id").html()

		var formData = new FormData()
		formData.append("avail_from", avail_from)
		formData.append("avail_to", avail_to)
		formData.append("rate", rate)
		formData.append("capacity", capacity)
		formData.append("description", description)
		formData.append("campus", campus)
		formData.append("occupied", occupied)
		formData.append("room_id", room_id)

		$.ajax({
			url : "/edit_room",
			type : "POST",
			data : formData,
			async : true,
			processData : false,
			contentType : false,
			success : function(response){
				// simply consider if the edit is successful
				// then close the edit dialog
				if(response == 'success'){
					alert("Room details edited successfully ...")
				}else{
					alert("There was something wrong with editing room details ... ")
				}

				// disable the edit button and fadeout the dialog
				$("#room_id").val('')
				$("#myModal2 input").val('') // clear out the input entries
				$("#edit_room_btn").attr("disabled", true)
				$("#myModal2").fadeOut("fast") // fade out the dialog
				view_room() // refresh the room view
			}
		})
 	})
})