$(document).ready(function(){
	$('.btn-expand-collapse').click(function(e) {
		$('.navbar-primary').toggleClass('collapsed');
	});

	$("#close-modal2").click(function(){
		$("#myModal2").fadeOut("fast") // fade out the dialog
		$("#room_id").val('')
		$("#myModal2 input").val('') // clear out the input entries
	})

	$("#close-modal3").click(function(){
		$("#myModal3").fadeOut("fast")
		$("#myModal3").val('')
	})

	$("#close-modal4").click(function(){
		$("#myModal4 input").val('')
		$("#add_promo_btn").attr('disabled', true)
		$("#myModal4").fadeOut("fast")
	})

	$("#close-modal6").click(function(){
		$("#myModal6 input").val('')
		$("#edit_promo_btn").attr("disabled", true)
		$("#myModal6").fadeOut("fast")
	})

	$("#close-modal7").click(function(){
		$("#myModal7").fadeOut("fast")
	})

	$("#not_delete_room").click(function(){
		$("#myModal7").fadeOut("fast")
	})

	var search_room = function(search_room_id){
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
				var counter = 0

				// clear whatever is in content div
				$("#content_").empty()

				// append a list to the content
				$("<ul>")
					.attr("id", "room_list")
					.appendTo("#content_")

				// each room is a list item
				for(var i = 0; i < objects.length; i++){
					if(!String(objects[i].room_id).includes(String(search_room_id))){
						continue
					}

					// increment counter
					counter += 1
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
						.slideDown(400)
				}

				if(counter == 0){
					$("<span>")
						.css("color", "red")
						.css("fontWeight", "bolder")
						.css("fontSize", "28px")
						.html("Sorry, No room found based on your input ... ")
						.appendTo("#room_list")
				}	
			}
		})
	}

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
				$("#content_").empty()

				// append a list to the content
				$("<ul>")
					.attr("id", "room_list")
					.appendTo("#content_")

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

	$("#add_room").click(function(){
		// simply show dialog 
		$("#myModal3").fadeIn("fast")
	})

	$("#myModal2 input").on("input", function(){
		if($(this).val() == ""){
			$("#edit_room_btn").attr("disabled", true)
		}else{
			$("#edit_room_btn").attr("disabled", false)
		}
	})

	$("#myModal3 input").on("input", function(){
		if($("#avail_from_").val() != "" &&
		   $("#avail_to_").val() != "" &&
		   $("#rate_").val() != "" &&
		   $("#capacity_").val() != "" &&
		   $("#description_").val() != "" &&
		   $("#img_path_").val()){
			$("#add_room_btn").attr("disabled", false)
		}else{
			$("#add_room_btn").attr("disabled", true)
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

		// pass the room id to the modal dialog
		$("#deleted_room_id").html(room_id)

		$("#myModal2").fadeOut("fast")
		$("#myModal7").fadeIn("fast")
	})

	$("#confirm_delete_room").click(function(){
		var room_id = $("#deleted_room_id").html()
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
				$("#myModal7").fadeOut("fast") // fade out the dialog
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

 	$("#add_room_btn").click(function(){
 		var avail_from = $("#avail_from_").val()
 		var avail_to = $("#avail_to_").val()
 		var rate = $("#rate_").val()
 		var capacity = $("#capacity_").val()
 		var campus = $("#campus_").val()
 		var occupied = $("#occupied").val()
 		var description = $("#description_").val()
 		var image = $("#img_path_").prop('files')[0]

 		var formData = new FormData()
 		formData.append("avail_from", avail_from)
 		formData.append("avail_to", avail_to)
 		formData.append("rate", rate)
 		formData.append("capacity", capacity)
 		formData.append("campus", campus)
 		formData.append("occupied", occupied)
 		formData.append("description", description)
 		formData.append("image", image)

 		$.ajax({
 			url : '/add_room',
 			type : 'POST',
 			data : formData,
 			async : true,
 			processData : false, 
 			contentType : false,
 			success : function(response){
 				if(response == "success"){
 					$("#myModal3").fadeOut("fast")
 					$("#myModal3 input").val('')
 					$("#add_room_btn").attr("disabled", true)
 					view_room()
 					alert("Room added successfully ... ")
 				}else{
					$("#myModal3").fadeOut("fast")
 					$("#myModal3 input").val('')
 					$("#add_room_btn").attr("disabled", true)
 					view_room()
 					alert("There is something wrong while adding this room ... ")
 				}
 			}
 		})
 	})

 	$("#add_promo").click(function(){
 		$("#myModal4").fadeIn("fast")
 	})

 	$("#myModal4 input").on("input", function(){
 		if($("#promo_code").val() != "" &&
 		   $("#value").val() != ""){
 			$("#add_promo_btn").attr("disabled", false)
 		}else{
 			$("#add_promo_btn").attr("disabled", true)
 		}
 	})

 	$("#add_promo_btn").click(function(){
 		var promo_code = $("#promo_code").val()
 		var applicable_for = $("#applicable_for").val()
 		var value = $("#value").val()

 		var formData = new FormData()
 		formData.append("promo_code", promo_code)
 		formData.append("applicable_for", applicable_for)
 		formData.append("value", value)

 		$.ajax({
 			url : "/add_promo",
 			type : "POST",
 			data : formData,
 			async : true,
 			processData : false,
 			contentType : false,
 			success : function(response){
 				if(response == 'success'){
 					alert("Promotion code has been added ... ")
 					$("#myModal4 input").val('')
 					$("#add_promo_btn").attr("disabled", true)
 					$("#myModal4").fadeOut("fast")
 				}else if(response == "dupplicate"){
 					alert("This promotion code has already existed ...")
 				}
 				else{
 					alert("There is something wrong while adding this code ... ")
 				}

 				view_promo()
 			}
 		})
 	})

 	$("#search_bar").on("input", function(){
 		if($(this).val() != "")
 			search_room($(this).val())

 	})

 	var view_promo = function(){
 		$("#content_").empty()

 		var promo_table = $("<div>")
 			.attr("id", "table-container")
 			.appendTo("#content_")

 		$("<table>")
 			.attr("id", "promo-code-table")
 			.appendTo("#table-container")

 		$("<tr>")
 			.attr("id", "promo-code-table-header")
 			.appendTo("#promo-code-table")

 		$("<th>")
 			.html("Promo Code")
 			.appendTo("#promo-code-table-header")

 		$("<th>")
 			.html("Applicable For")
 			.appendTo("#promo-code-table-header")

 		$("<th>")
 			.html("Discount Value")
 			.appendTo("#promo-code-table-header")


 		// Now query the server to see which promo codes are there
 		// response is in the form of JSON
 		var formData = new FormData()

 		// always have some kind of secret keys to sensitive data
 		formData.append("secret_key", "185d50608d0044c5cdbad284052bf9b4")
 		$.ajax({ // good old ajax
 			url : '/view_promo',
 			type : 'POST',
 			data : formData,
 			async : true,
 			processData : false,
 			contentType : false,
 			success : function(response){
 				if(response == 'Authentication failed'){
 					alert("Authentication failed ... ")
 				}else{
 					// create <tr> tags and append them to promo-code-table
 					var objects = JSON.parse(response)
 					for(var i = 0; i < objects.length; i++){
 						$("<tr>")
 							.attr("id", objects[i].code)
 							.addClass("promo-code-table-content")
 							.click(function(){
 								// now add some code that allow staff to modify the thingy
 								// instead of getting the information loaded and ready for use
 								// I'm just gonna request another time so that the information
 								// is updated in real time
 								var code = $(this).attr("id")

 								// another ajax
 								var formData = new FormData()

 								formData.append("code", code)
 								formData.append("secret_key", "185d50608d0044c5cdbad284052bf9b4")
 								$.ajax({
 									url : "/get_promo",
 									type : 'POST',
 									data : formData,
 									async : true,
 									processData : false,
 									contentType : false,
 									success : function(response){
 										if(response == 'Authentication failed'){
 											alert("Authentication failed ... ")
 										}else{
 											var object = JSON.parse(response)

 											$("#edit_promo_code").val(object.code)
 											$("#edit_value").val(object.value)
 											$("#edit_applicable_for").val(object.applicable_for)

 											$("#myModal6").fadeIn("fast")
 										}
 									}
 								})
 							})
 							.appendTo("#promo-code-table")

 						$("<td>")
 							.html(objects[i].code)
 							.appendTo("#" + objects[i].code)

 						$("<td>")
 							.html(objects[i].applicable_for)
 							.appendTo("#" + objects[i].code)

 						$("<td>")
 							.html(objects[i].value)
 							.appendTo("#" + objects[i].code)	
 					}
 				}
 			} 
 		})

 		promo_table.fadeIn("fast")
 	}

 	$("#view_promo").click(function(){	
 		view_promo()
 	})

 	$("#edit-promo-form input").on("input", function(){
 		if($("#edit_promo_code").val() == '' ||
 		   $("#edit_value").val() == '' ||
 		   $("#edit_applicable_for").val() == ''){ // if on input and input field empty
 			$("#edit_promo_btn").attr("disabled", true)
 		}else{
 			$("#edit_promo_btn").attr("disabled", false)
 		}
 	})

 	$("#edit_promo_btn").click(function(){
 		var code = $("#edit_promo_code").val()
 		var value = $("#edit_value").val()
 		var applicable_for = $("#edit_applicable_for").val()

 		var formData = new FormData()

 		formData.append('secret_key', '185d50608d0044c5cdbad284052bf9b4')
 		formData.append("code", code)
 		formData.append("value", value)
 		formData.append("applicable_for", applicable_for)

 		$.ajax({
 			url : '/edit_promo',
 			type : 'POST',
 			async : true,
 			data : formData,
 			processData : false,
 			contentType : false,
 			success : function(response){
 				if(response == 'Authentication failed'){
 					alert('Authentication failed ... ')
 				}else if(response == 'fail'){
 					alert("There is something wrong while editing promo code ... ")
 				}else if(response == 'success'){
 					alert("Promo code has been updated successfully ... ")
 				}

 				view_promo()
 				$("#myModal6").fadeOut("fast")
 			}	
 		})
 	})

 	$("#delete_promo_btn").click(function(){
 		var code = $("#edit_promo_code").val()

 		var formData = new FormData()
 		formData.append("secret_key", "185d50608d0044c5cdbad284052bf9b4")
 		formData.append("code", code)

 		$.ajax({
 			url : '/delete_promo',
 			type : 'POST',
 			async : true,
 			data : formData,
 			processData : false,
 			contentType : false,
 			success : function(response){
 				if(response == 'Authentication failed'){
 					alert("Authentication failed ... ")
 				}else if(response == 'fail'){
 					alert("There is something wrong while deleting this promo code ... ")
 				}else if(response == 'success'){
 					alert("Promo code has been deleted successfully ... ")
 				}

 				view_promo()
 				$("#myModal6").fadeOut("fast")
 			}
 		})
 	})

 	$("#room-mgmt").click(function(){
 		if($("#room-mgmt-dropdown").css("display") == "none"){
 		 	$("#arrow-room-mgmt").html("<i class='fa fa-caret-down'></i>")
 		}else{
 			$("#arrow-room-mgmt").html("<i class='fa fa-caret-right'></i>")
 		}

 		$("#room-mgmt-dropdown").slideToggle(400)
 	})

 	$("#promo-mgmt").click(function(){
 		if($("#promo-mgmt-dropdown").css("display") == "none"){
 		 	$("#arrow-promo-mgmt").html("<i class='fa fa-caret-down'></i>")
 		}else{
 			$("#arrow-promo-mgmt").html("<i class='fa fa-caret-right'></i>")
 		}

 		$("#promo-mgmt-dropdown").slideToggle(400)
 	})
})