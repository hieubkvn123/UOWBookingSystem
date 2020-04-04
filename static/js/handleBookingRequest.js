$(document).ready(function(){
	var closeModal = document.getElementById('close-modal')
	var closeModal2 = document.getElementById('close-modal2')
	var selectedRooms = []

	closeModal.onclick = function(){
		document.getElementById('myModal').style.display = 'none'
	}

	closeModal2.onclick = function(){
		document.getElementById('myModal2').style.display = 'none'
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
						var checkin_str = checkin_date.getFullYear() + "/" + checkin_date.getMonth() + "/" + checkin_date.getDate()

						var checkout = objects[i].checkout 
						var checkout_date = new Date(checkout)
						var checkout_str = checkout_date.getFullYear() + "/" + checkout_date.getMonth() + "/" + checkout_date.getDate()
						var room_id = objects[i].room_id 
						var campus = objects[i].campus 

						var div_id = 'div_id_' + booking_id
						var li_id = 'li_id_' + booking_id

						$("<li>")
							.attr("id", li_id)
							.attr("width", "100%")
							.css("border", '1px black outset')
							.css('border-radius', '20px')
							.css("margin", "8px")
							.css("margin-top", "20px")
							.appendTo("#booking-info")

						$("<div>")
							.attr("id", div_id)
							.attr("width", "100%")
							.css("display", "inline-block")
							.css("margin", "8px")
							.appendTo("#" + li_id)

						$("<button>")
							.html("Cancel Booking")
							.addClass("btn btn-primary")
							.attr("id", "x_" + div_id)
							.attr("room_id", room_id)
							.attr("booking_id", booking_id)
							.css("background", "red")
							.appendTo("#" + li_id)
							
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

						var html_str = "Booking ID : " + booking_id + "<br>"
						html_str += "Room ID : " + room_id + "<br>"
						html_str += "Check in date : " + checkin_str + "<br>"
						html_str += "Check out date : " + checkout_str + "<br>"
						html_str += "Campus  : " + campus + "<br>"

						$("<p>")
							.html(html_str)
							.css('display', 'inline-block')
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

			var name = document.getElementById('name').value
			var uow_id = document.getElementById('uow_id').value
			var check_in = document.getElementById('check-in-date').value
			var check_out = document.getElementById('check-out-date').value
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
					$("#uow_id_input").val(uow_id)
					$("#checkin_input").val(check_in)
					$("#checkout_input").val(check_out)
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

				    		var avail_date = "From " + avail_date_from.getDate() + "/" + avail_date_from.getMonth() + "/" + avail_date_from.getFullYear()
				    		avail_date += " To " + avail_date_to.getDate() + "/" + avail_date_to.getMonth() + "/" + avail_date_to.getFullYear()
				    		
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
			var uow_id = document.getElementById('uow_id_input').value
			var checkin = document.getElementById('checkin_input').value
			var checkout = document.getElementById('checkout_input').value

			var num_people = document.getElementById('num_people_input').value
			var category = document.getElementById('category_input').value
			var campus = document.getElementById('campus_input').value
			var id_list = document.getElementById('id_list_input').value

			formData.append('name', name)
			formData.append('uow_id', uow_id)
			formData.append('checkin', checkin)
			formData.append('checkout', checkout)
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
					alert(response)
					$("#id_list_input").val("")
					selectedRooms = []
				}
			})
		}
	}
})