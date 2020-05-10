$(document).ready(function(){
	var closeModal = document.getElementById('close-modal')
	var closeModal2 = document.getElementById('close-modal2')
	var closeModal3 = document.getElementById('close-modal3')
	var selectedRooms = []

	closeModal.onclick = function(){
		document.getElementById('myModal').style.display = 'none'
	}

	closeModal2.onclick = function(){
		document.getElementById('myModal2').style.display = 'none'
	}

	closeModal3.onclick = function(){
		document.getElementById('myModal3').style.display = 'none'
	}

	function pad(num, size) {
	    var s = num+"";
	    while (s.length < size) s = "0" + s;
	    return s;
	}

	var checkBtn = document.getElementById('check')
	var checkOrderBtn = document.getElementById('check-order')
	var orderBtn = document.getElementById('place-order-btn')
	var viewOrderBtn = document.getElementById('view-order-btn')

	checkOrderBtn.onclick = function(){
		var modal = document.getElementById('myModal2')
		// modal.style.display = 'block'
		$("#myModal2").fadeIn('fast')
		$('#id_list_input').val()
		selectedRooms = []
	}

	$("#uow_id_order").on('input', function(){
		if(document.getElementById("uow_id_order").value == ""){
			$("#view-order-btn").attr("disabled", true)
		}else{
			$("#view-order-btn").attr("disabled", false)
		}
	})

	viewOrderBtn.onclick = function(){
		var formData = new FormData()
		var uow_id = document.getElementById('uow_id_order').value

		formData.append('uow_id', uow_id)

		$.ajax({
			url : '/check_booking',
			method : 'POST',
			data : formData,
			processData : false,
			contentType : false,
			success : function(response){
				var objects = JSON.parse(response)

				// empty the booking info div
				$("#booking-info").empty()

				if(objects.length != 0){
					for(var i = 0; i < objects.length; i++){
						// for each object we have booking id, checkin, checkout and room id and campus
						var booking_id = objects[i].booking_id
						var checkin = objects[i].checkin
						var checkin_date = new Date(checkin)
						var checkin_str = checkin_date.getFullYear() + "/" + pad(checkin_date.getMonth()+1,2) + "/" + checkin_date.getDate()

						var checkout = objects[i].checkout
						var checkout_date = new Date(checkout)
						var checkout_str = checkout_date.getFullYear() + "/" + pad(checkout_date.getMonth()+1,2) + "/" + checkout_date.getDate()
						var room_id = objects[i].room_id
						var campus = objects[i].campus

						var div_id = 'div_id_' + booking_id
						var li_id = 'li_id_' + booking_id

						$("<li>")
							.attr("id", li_id)
							.attr("width", "100%")
							.css("border", '1px black outset')
							.css("margin", "8px")
							.css("margin-top", "20px")
							.css("box-shadow", "5px 10px #888888")
							.appendTo("#booking-info")

						$("<div>")
							.attr("id", div_id)
							.attr("width", "100%")
							.css("display", "inline-block")
							.css("margin", "8px")
							.appendTo("#" + li_id)

						$("<table>")
							.attr("id", "table_" + div_id)
							.css("display", "block")
							.appendTo("#" + li_id)

						$("<button>")
							.html("Cancel Booking")
							.addClass("btn btn-primary")
							.attr("id", "x_" + div_id)
							.attr("room_id", room_id)
							.attr("booking_id", booking_id)
							.css("background", "red")
							.css("display", "inline")
							.css("margin", "8px")
							.css("marginRight", "0px")
							.css("marginTop", "0px")
							.appendTo("#table_" + div_id)
							.wrap("<td>")

						$("<button>")
							.html("Edit Booking")
							.addClass("btn btn-primary")
							.attr("id", "edit_" + div_id)
							.attr("room_id", room_id)
							.attr("booking_id", booking_id)
							.css("background", "green")
							.css("display", "inline")
							.css("margin", "8px")
							.css("marginLeft", "0px")
							.css("marginTop", "0px")
							.appendTo("#table_" + div_id)
							.wrap("<td>")

						$("#x_" + div_id).click(function(){
								// need to go back to NodeJS and do :
								// 1.Delete the row from bookings table
								// 2.Change the room status to unoccupied
								// 3.Delete the <li> tag
								var formData = new FormData()
								console.log($(this).attr('room_id'))
								formData.append("room_id", $(this).attr('room_id'))
								formData.append("booking_id", $(this).attr('booking_id'))

								// AJAX over here
								$.ajax({
									url : '/cancel_booking',
									type : 'POST',
									data : formData,
									async : true,
									processData : false,
									contentType : false,
									success : function(response){
										alert(response)
									}
								})

								// delete the li tag
								$(this).parents("li").remove()
						})

						$("#edit_" + div_id).click(function(){
							// go back to NodeJS and do:
							// 1. Look for the booking based on the booking id
							// 2. display the booking ID onto the form
							var formData = new FormData()
							formData.append("booking_id", $(this).attr("booking_id"))
							console.log( $(this).attr("booking_id"))

							$.ajax({
								url : '/edit_booking',
								type : 'POST',
								data : formData,
								async : true,
								processData : false,
								contentType : false,
								success : function(response){
									// get the serialized object and put the info
									// onto the form
									var booking = JSON.parse(response)

									// for date data type we have to handle differently
									var checkin_date = new Date(booking['checkin'])
									var checkout_date = new Date(booking['checkout'])

									var checkin_str = checkin_date.getFullYear() + "-" + pad(checkin_date.getMonth() + 1,2) + "-" + checkin_date.getDate()
									var checkout_str = checkout_date.getFullYear() + "-" + pad(checkout_date.getMonth() + 1,2) + "-" + checkout_date.getDate()

									$("#edit_booking_id").val(booking['booking_id'])
									$("#edit_name").val(booking['name'])
									$("#edit_uow_id").val(booking['uow_id'])
									$("#edit_checkin_date").val(checkin_str)
									$("#edit_checkout_date").val(checkout_str)
									$("#edit_checkin_time").val(booking['checkin_time'])
									$("#edit_checkout_time").val(booking['checkout_time'])

									$("#myModal3").fadeIn("fast")
								}
							})
						})

						var html_str = "Booking ID : " + booking_id + "<br>"
						html_str += "Room ID : " + room_id + "<br>"
						html_str += "Check in date : " + checkin_str + "<br>"
						html_str += "Check out date : " + checkout_str + "<br>"
						html_str += "Campus  : " + campus

						$("<p>")
							.html(html_str)
							.css('display', 'block')
							.appendTo("#" + div_id)
					}
				}else{
					$("<p>")
						.html("There is no booking records under this ID")
						.css('marginTop', '20px')
						.css('marginLeft', '-20px')
						.css('color', 'red')
						.css('fontWeight', 'bolder')
						.css('fontSize', '18px')
						.appendTo("#booking-info")
				}
			}
		})
	}

	checkBtn.onclick = function(){
		$('#final-booking-form').trigger('reset')
		if($("#id_list_input").val() == ""){
			$("#place-order-btn").attr("disabled", true)
		}
		selectedRooms = []

		if(document.getElementById('name').value == "" ||
		   document.getElementById('uow_id').value == "" ||
		   document.getElementById('check-in-date').value == "" ||
		   document.getElementById('check-out-date').value == ""){
			alert("Please fill in the neccessary fields")
		}else{
	 		var formData = new FormData()
			var modal = document.getElementById("myModal");
			var modal_p = document.getElementById('modal-p')

			// get all data from the primary form
			var name = document.getElementById('name').value
			var password = document.getElementById('password').value
			var uow_id = document.getElementById('uow_id').value
			var promo_code = document.getElementById('promo_code').value
			var check_in = document.getElementById('check-in-date').value
			var check_out = document.getElementById('check-out-date').value
			var check_in_time = document.getElementById('check-in-time').value
			var check_out_time = document.getElementById('check-out-time').value
			var num_people_select = document.getElementById('num-people-select')
			var staff_student_select = document.getElementById('staff-student-select')
			var campus_select = document.getElementById('campus-select')

			var num_people = num_people_select.options[num_people_select.selectedIndex].text
			var staff_student = staff_student_select.options[staff_student_select.selectedIndex].text
			var campus = campus_select.options[campus_select.selectedIndex].text

			formData.append('name', name)
			formData.append('check_in', check_in)
			formData.append('check_out', check_out)
			formData.append('num_people', num_people)
			formData.append('staff_student', staff_student)
			formData.append('campus', campus)

			$.ajax({
				url : '/book',
				type : 'POST',
				data : formData,
				async : true,
				processData : false,
				contentType : false,
				success : function(response){
					// First, migrate all data from previous form to this form
					$("#name_input").val(name)
					$("#password_input").val(password)
					$("#uow_id_input").val(uow_id)
					$("#promo_code_input").val(promo_code)
					$("#checkin_input").val(check_in)
					$("#checkout_input").val(check_out)
					$("#checkin_time_input").val(check_in_time)
					$("#checkout_time_input").val(check_out_time)
					$("#num_people_input").val(num_people)
					$("#category_input").val(staff_student)
					$("#campus_input").val(campus)

					var objects = JSON.parse(response)

				    // first, we need to update the modal dialog
				    $("#points_list").empty()

				    var counter = 0 // number of valid rooms
				    for(var i = 0 ; i < objects.length; i++){
				    	var object = objects[i]

				    	// then we fill in what we need based on customer's input
				    	if(object != null){
				    		counter += 1
				    		console.log("Object number " + i)
				    		// $('<div>').html('')
				    		var table = $('<table>')
				    		var avail_date_from = new Date(object.avail_from)
				    		var avail_date_to = new Date(object.avail_to)

				    		var avail_date = "From " + avail_date_from.getDate() + "/" + (avail_date_from.getMonth()+1) + "/" + avail_date_from.getFullYear()
				    		avail_date += " To " + avail_date_to.getDate() + "/" + (avail_date_to.getMonth()+1) + "/" + avail_date_to.getFullYear()

				    		var html_str = "<span class='info-header'>Availability</span> : " + avail_date + "<br/>"
				    		html_str += "<span class='info-header'>Per day rate</span> : " + object.rate + " $SGD <br/>"
				    		html_str += "<span class='info-header'>Capacity</span> : " + object.capacity + " (Pax) <br/>"
				    		html_str += "<span class='info-header'>Venue</span> : " + object.campus + "<br/>"
				    		html_str += "<span class='info-header'>Description</span> : " + object.description + "<br/>"


				    		unique_div_id = 'room_div_' + object.room_id
				    		unique_img_id = 'room_img_' + object.room_id
				    		$("<li>")
				    			.attr("id", object.room_id)
				    			.attr("selected", false)
				    			.css("box-shadow", "5px 10px #888888")
				    			.appendTo("#points_list")
				    			.click(function(){
				    				var id_list_field = $("#id_list_input")
				    				if($("li#"+this.id).attr('selected')){
				    					selectedRooms.splice(selectedRooms.indexOf(this.id), 1)
				    					$("li#" + this.id).attr('selected', false)
				    					$("li#" + this.id).css('border', '1px black outset')
				    				}else{
				    					selectedRooms.push(this.id)
				    					$("li#" + this.id).attr('selected', true)
				    					$("li#" + this.id).css('border', '2px solid green')
				    				}

				    				if(selectedRooms.length == 0){
				    					$("#place-order-btn").attr('disabled', true)
				    				}else{
				    					$("#place-order-btn").attr('disabled', false)
				    				}

				    				var selectedList = ''
				    				for(var i = 0; i < selectedRooms.length; i++){
				    					selectedList += selectedRooms[i] + "-"
				    				}

				    				id_list_field.val(selectedList)
				    			})

				    		$('<div>')
				    			.attr("id", unique_div_id)
				    			.attr("width", "100%")
				    			.css("display", "inline-block")
				    			.css('margin', '8px')
				    			.appendTo("#" + object.room_id)

				    		$('<img>')
				    			.addClass("room_img")
				    			.attr('id', unique_img_id)
				    			.attr('src', object.img_path)
				    			.attr('width', 360)
				    			.attr('height', 240)
				    			.css('marginRight', '20px')
				    			.css('display', 'inline-block')
				    			.appendTo("#" + unique_div_id)

				    		$('<p>')
				    			.html(html_str)
				    			.css('display', 'inline-block')
				    			.appendTo("#" + unique_div_id)
				    	}
				    }
					if(counter == 0){
						$("#modal-sub-info").css('color', 'red')
						// $('#place-order-btn').attr("disabled", true)
						$("#modal-sub-info").html("No available room satisfied your requirements")
					}else{
						$("#modal-sub-info").css('color', 'green')
						// $('#place-order-btn').attr("disabled", false)
						$("#modal-sub-info").html("(Please click on the room information to select)")
					}
					$("#myModal").fadeIn()
					// alert(response)
				}
			})
		}

		orderBtn.onclick = function(){
			var formData = new FormData()
			var name = document.getElementById('name_input').value
			var password = document.getElementById('password_input').value
			var uow_id = document.getElementById('uow_id_input').value
			var promo_code = document.getElementById('promo_code_input').value
			var checkin = document.getElementById('checkin_input').value
			var checkout = document.getElementById('checkout_input').value
			var checkin_time = document.getElementById('checkin_time_input').value
			var checkout_time = document.getElementById('checkout_time_input').value
			var num_people = document.getElementById('num_people_input').value
			var category = document.getElementById('category_input').value
			var campus = document.getElementById('campus_input').value
			var id_list = document.getElementById('id_list_input').value

			formData.append('name', name)
			formData.append('password', password)
			formData.append('uow_id', uow_id)
			formData.append('promo_code', promo_code)
			formData.append('checkin', checkin)
			formData.append('checkout', checkout)
			formData.append('checkin_time', checkin_time)
			formData.append('checkout_time', checkout_time)
			formData.append('num_people', num_people)
			formData.append('category', category)
			formData.append('campus', campus)
			formData.append('id_list', id_list)

			$.ajax({
				url : '/process_form',
				type : 'POST',
				data : formData,
				async : true,
				processData : false,
				contentType : false,
				success : function(response){
					document.getElementById('myModal').style.display = 'none'
					if(response == "Invalid"){
						alert("This promo code is either invalid or is not applicable for you ...")
					}else if(response == "Account invalid"){
						alert("This account either does not exists or is invalid ... ")
					}else{
						window.location.replace('/payment') // redirects to payment page
					}
					$("#id_list_input").val("")
					selectedRooms = []
				}
			})
		}
	}

	$("#confirm_edit").click(function(){
		var booking_id = document.getElementById('edit_booking_id').value
		var name = document.getElementById('edit_name').value
		var uow_id = document.getElementById('edit_uow_id').value
		var checkin = document.getElementById('edit_checkin_date').value
		var checkout = document.getElementById('edit_checkout_date').value
		var checkin_time = document.getElementById('edit_checkin_time').value
		var checkout_time = document.getElementById('edit_checkout_time').value

		// gather into a form data then send to server via ajax
		var formData = new FormData()
		formData.append("booking_id", booking_id)
		formData.append("name", name)
		formData.append("uow_id", uow_id)
		formData.append("checkin", checkin)
		formData.append("checkout", checkout)
		formData.append("checkin_time", checkin_time)
		formData.append("checkout_time", checkout_time)

		$.ajax({
			url : '/confirm_edit',
			data : formData,
			type : "POST",
			async : true,
			processData : false,
			contentType : false,
			success : function(response){
				alert(response)
				$("#myModal3").fadeOut('fast')
				// empty the booking info div
				$("#booking-info").empty()
				$("#confirm_edit").attr("disabled", true)
			}
		})
	})

	$(".booking-form input").on("input", function(){
		console.log("Input")
		if($(this).val() == ""){
			$("#confirm_edit").attr("disabled", true)
		}
		else{
			$("#confirm_edit").attr("disabled", false)
		}
	})
})
