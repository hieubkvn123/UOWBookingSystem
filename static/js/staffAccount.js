$(document).ready(function(){
	$('.btn-expand-collapse').click(function(e) {
		$('.navbar-primary').toggleClass('collapsed');
	});

	$("#close-modal2").click(function(){
		$("#myModal2").fadeOut("fast") // fade out the dialog
		$("#room_id").val('')
		$("#myModal2 input").val('') // clear out the input entries
	})

	$("#view_room").click(function(){
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

							// this should be able to update in real time
							// lemme finish the editing and deal with you later
							// remind me alright
							// reformat checkin, checkout date
							var avail_from = new Date($(this).attr("avail_from"))
							var avail_to = new Date($(this).attr("avail_to"))

							// reformat to string of yyyy-mm-dd
							var avail_from_str = avail_from.getFullYear() + "-" + pad(avail_from.getMonth()+1,2) + "-" + pad(avail_from.getDate(),2)
							var avail_to_str = avail_to.getFullYear() + "-" + pad(avail_to.getMonth() + 1, 2) + "-" + pad(avail_to.getDate(),2)

							console.log(avail_from_str)
							console.log(avail_to_str)
							$("#avail_from").val(avail_from_str)
							$("#avail_to").val(avail_to_str)

							$("#rate").val($(this).attr("rate"))
							$("#capacity").val($(this).attr("capacity"))
							$("#description").val($(this).attr("description"))

							if($(this).attr("campus") == "UOW Wollongong Campus"){
								$("#campus").val("UOW Wollongong Campus")
							}else{
								$("#campus").val("Singapore Institute of Management")
							}

							if($(this).attr("occupied") == 1){
								$("#occupied").val("Yes")
							}else{
								$("#occupied").val("No")
							}

							$("#myModal2").fadeIn("fast")
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
	})

	$("#myModal2 input").on("input", function(){
		if($(this).val() == ""){
			$("#edit_room_btn").attr("disabled", true)
		}else{
			$("#edit_room_btn").attr("disabled", false)
		}
	})
})