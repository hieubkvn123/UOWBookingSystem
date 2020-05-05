$(document).ready(function(){
  $("#close-modal1").click(function(){
    $("#myModal1").fadeOut("fast")
  })

  $("#close-modal5").click(function(){
    $("#bar-chart").slideUp()
    $("#to_date").val("")
    $("#from_date").val("")
    $("#myModal5").fadeOut("fast")
  })
  var view_status = function(){
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
      url : '/view_status',
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
          var color = "yellow"
          var tooltipContent = "Pending Approval"
          if(objects[i].approved == 1)
            color = "green"
            tooltipContent = "Approved"

          $("<li>") // attach all information to this <li> for later use
            .attr("room_id", objects[i].room_id)
            .attr("avail_from", objects[i].avail_from)
            .attr("avail_to", objects[i].avail_to)
            .attr("rate", objects[i].rate)
            .attr("capacity", objects[i].capacity)
            .attr("campus", objects[i].campus)
            .attr("occupied", objects[i].occupied)
            .attr("description", objects[i].description)
            .attr("approved", objects[i].approved)
            .attr("id", "li_" + i)
            .attr("title", objects[i].approved == 1 ? "Approved" : "Pending Approval")
            .css('listStyleType', 'none')
            .css('margin', '20px')
            .css("opacity", 1.0)
            .css('box-shadow', '5px 10px #888888')
            .css("border", "1px outset " + color)
            .tooltip({ show: { effect: "blind", duration: 200, content : tooltipContent } })
            .hover(function(){ // hover in
              $(this).css("opacity", 0.8)
              $(this).css("cursor", "pointer")

              $(this).css("border-width", "2px")
            }, function(){ // hover out
              $(this).css("opacity", 1.0)
              $(this).css("border-width", "1px")
            })
            .click(function(){
              $("#room_id_").html($(this).attr("room_id"))
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

                  // we can do it like this :
                  // 1. If the room is already approved -> then we disable editing
                  // 2. If the room has not been approved -> allow the admin to edit room before approval
                  // 1. Approved -> Allow disapproval
                  // 2. Pending -> Approved or Disapprove
                  $("#avail_from__").val(avail_from_str)
                  $("#avail_to__").val(avail_to_str)

                  $("#rate__").val(obj.rate)
                  $("#capacity__").val(obj.capacity)
                  $("#description__").val(obj.description)

                  if(obj.campus == "UOW Wollongong Campus"){
                    $("#campus__").val("UOW Wollongong Campus")
                  }else{
                    $("#campus__").val("Singapore Institute of Management")
                  }

                  if(obj.occupied == 1){
                    $("#occupied__").val("Yes")
                  }else{
                    $("#occupied__").val("No")
                  }

                  // if the list item with this room id has status approved
                  if($("li[room_id=" + $("#room_id_").html() + "]").attr("approved") == 1){
                    // disable editing
                    // admin can only choose either to disapprove or not
                    $("#approve_btn").hide()
                    $("#disapprove_btn").hide()
                    $("#footer-text").html("(This room has been approved by administrators)")
                    $("#edit-status-form input").attr("disabled", true)
                    $("#edit-status-form select").attr("disabled", true)
                  }else{ // if room is not yet approved
                    // still enable editing
                    // admin can edit before approve
                    $("#approve_btn").show()
                    $("#disapprove_btn").show()
                    $("#footer-text").html('')
                    $("#occupied__").attr("disabled", true)
                    $("#edit-status-form input").attr("disabled", false)
                    $("#edit-status-form select").attr("disabled", false)
                  }

                  $("#myModal1").fadeIn("fast")
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

          $("<button>")
            .html("<i class='fa fa-bars'>")
            .attr("class", "btn btn-primary")
            .css("float", "right")
            .css("margin-right", "8px")
            .css("margin-top", "8px")
            .attr("id", "dropdown_button_" + i)
            .addClass("toggleBtn")
            .click(function(e){
              $(this).children("ul").slideToggle("fast")
              e.stopPropagation()
            })
            .hover(function(){
              $(this).parent().css("opacity", 1.0)
            }, function(){ // hover out
              $(this).parent().css("opacity", 0.8)
            })
            .appendTo("#li_" + i)

            $("<ul>")
              .appendTo("#dropdown_button_" + i)
              .attr("id", "menu_list_" + i)
              .css("display", "none")
              .css("padding", "0")
              .css('list-style-type', 'none')

            if($("#li_" + i).attr("approved") == 0){
              $("<li>")
                .attr("room_id", $("#li_" + i).attr("room_id"))
                .html("Disapprove")
                .css("background", "red")
                .css("width", "100%")
                .css("padding", "8px")
                .hover(function(){
                  $(this).css("cursor", "pointer")
                  $(this).css("opacity", 0.8)
                }, function(){
                  $(this).css("opacity", 1.0)
                })
                .click(function(e){
                  var room_id = $(this).attr("room_id")

                  var formData = new FormData()
                  formData.append("room_id", room_id)

                  // just send the room id to server
                  // for deletion
                  $.ajax({
                    url : '/delete_room',
                    type : 'POST',
                    async : true,
                    data : formData,
                    processData : false,
                    contentType : false,
                    success : function(response){
                      if(response == 'success'){
                        alert("Room " + room_id + " is disapproved and deleted ... ")
                        view_status()
                      }else{
                        alert("There is something wrong with deleting this room ... ")
                      }
                    }
                  })
                })
                .appendTo("#menu_list_" + i)
                .addClass("menu_item")

                $("<li>")
                  .attr("room_id", $("#li_" + i).attr("room_id"))
                  .html("Approve")
                  .hover(function(){
                    $(this).css("cursor", "pointer")
                    $(this).css("opacity", 0.8)
                    }, function(){
                      $(this).css("opacity", 1.0)
                    })
                  .click(function(e){
                      var room_id = $(this).attr("room_id")

                      var formData = new FormData()
                      formData.append("room_id", room_id)

                      $.ajax({
                        url : '/approve_only',
                        type : 'POST',
                        async : true,
                        data : formData,
                        processData : false,
                        contentType : false,
                        success : function(response){
                          if(response == 'success'){
                            alert("Room " + room_id + " has been approved and will be shown to users ... ")
                            view_status()
                          }else{
                            alert("There is something wrong with approving this room ... ")
                          }
                        }
                      })

                      e.stopPropagation()
                  })
                  .css("background", "green")
                  .css('width', "100%")
                  .css("padding", "8px")
                  .appendTo("#menu_list_" + i)
                  .addClass("menu_item")
            }else{
              $("<li>")
                .attr("room_id", $("#li_" + i).attr("room_id"))
                .html("View Usage")
                .hover(function(){
                  $(this).css("cursor", "pointer")
                  $(this).css("opacity", 0.8)
                }, function(){
                  $(this).css("opacity", 1.0)
                })
                .click(function(e){
                  $("#_room_id_").html($(this).attr("room_id"))
                  $("#myModal5").fadeIn("fast")
                  e.stopPropagation()
                })
                .css("width", "100%")
                .css("padding", "8px")
                .appendTo("#menu_list_" + i)
                .addClass("menu_item")
            }

          $("#li_" + i)
            .hide()
            .fadeIn("slow")
        }
      }
    })
  }

  $("#view_room_status").click(function(){
    view_status()
  })

  // when admin disapprove a room
  // just modify its info in the DATABASE
  // then reload the view
  $("#disapprove_btn").click(function(){
    var room_id = $("#room_id_").html()

    var formData = new FormData()
    formData.append("room_id", room_id)

    // just send the room id to server
    // for deletion
    $.ajax({
      url : '/delete_room',
      type : 'POST',
      async : true,
      data : formData,
      processData : false,
      contentType : false,
      success : function(response){
        if(response == 'success'){
          alert("Room " + room_id + " is disapproved and deleted ... ")
          $("#myModal1").fadeOut("fast")
          view_status()
        }else{
          alert("There is something wrong with deleting this room ... ")
        }
      }
    })
  })

  $("#approve_btn").click(function(){
    // first, get the room id
    var room_id = $("#room_id_").html()
    var formData = new FormData()

    formData.append('room_id', room_id)

    // wait, we forget something.
    // we need to send all of the info to the server as well
    // in case the admin changed something

    // obtain all necessary information
    var avail_from = $("#avail_from__").val()
    var avail_to = $("#avail_to__").val()
    var rate = $("#rate__").val()
    var description = $("#description__").val()
    var capacity = $("#capacity__").val()
    var campus = $("#campus__").val()

    formData.append("avail_from", avail_from)
    formData.append("avail_to", avail_to)
    formData.append("rate", rate)
    formData.append("description", description)
    formData.append("capacity", capacity)
    formData.append("campus", campus)

    $.ajax({
      url : "/approve_room",
      type : "POST",
      async : true,
      data : formData,
      processData : false,
      contentType : false,
      success : function(response){
        if(response == "success"){
          alert("Room " + room_id + " has been approved and will be publicly shown to users ... ")
          $("#myModal1").fadeOut("fast")
          view_status()
        }else{
          $("#myModal1").fadeOut("fast")
          alert("There is some thing wrong happened ... ")
        }
      }
    })
  })

  $("#view_room_usage").click(function(){
    $("#myModal5").fadeIn("fast")
  })

  var plot_usage = function(room_id){
    // we already have the room id, now we needs the date
    // in which the room has a checkin or checkout
    // then we need the duration of these corresponding bookings
    // to plot on the bar chart
    var from_date = $("#from_date").val()
    var to_date = $("#to_date").val()

    var formData = new FormData()
    formData.append("room_id", room_id)
    formData.append("from_date", from_date)
    formData.append("to_date", to_date)

    // New feature of Ajax & JQuery -> write to note later
    return new Promise(function(resolve, reject){
      $.ajax({
        url : '/plot_bar',
        type : 'POST',
        async : true,
        data : formData,
        processData : false,
        contentType : false,
        success : function(data){
          resolve(data)
        },
        error : function(data){
          reject(data)
        }
      })
    })
  }

  var myChart // for further references
  $("#from_date").change(function(){
    var room_id = $("#_room_id_").html()
    if($("#from_date").val() != "" && $("#to_date").val() != ""){
      plot_usage(room_id).then(function(data){
        var objects = JSON.parse(data)

        var tick_labels = []
        var durations = []
        for(var i = 0; i < objects.length; i++){
          tick_labels.push(objects[i].checkin)
          durations.push(objects[i].duration)
        }

        /////////////--The Plot (Write to note after)--//////////////////////////////
        var ctx = document.getElementById("bar-chart")
        var context = ctx.getContext('2d')
        //clear the canvas first
        context.clearRect(0,0,ctx.width, ctx.height)

        if(myChart != null){
          myChart.destroy()
        }

        console.log("Creating chart")
        myChart = new Chart(ctx, {
          type: 'horizontalBar',
          data: {
            labels: tick_labels,
            datasets: [{
              label : 'Duration of booking',
              data: durations,
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              xAxes: [{
                ticks: {
                  maxRotation: 90,
                  minRotation: 80,
                  beginAtZero : true
                }
              }],
              yAxes: [{
                ticks: {
                  beginAtZero: true
                }
              }]
            }
          }
        });

        $("#bar-chart").slideDown()

      })
    }
  })

  $("#to_date").change(function(){
    var room_id = $("#_room_id_").html()
    if($("#from_date").val() != "" && $("#to_date").val() != ""){
      // $("#footer-text-modal5").html("Ahihi")
      console.log(room_id)
      plot_usage(room_id).then(function(data){
        console.log(data)
        var objects = JSON.parse(data)

        var tick_labels = []
        var durations = []
        for(var i = 0; i < objects.length; i++){
          tick_labels.push(objects[i].checkin)
          durations.push(objects[i].duration)
        }

        var ctx = document.getElementById("bar-chart")
        var context = ctx.getContext('2d')
        //clear the canvas first
        context.clearRect(0,0,ctx.width, ctx.height)
        console.log("Creating chart")

        if(myChart != null){
          myChart.destroy()
        }

        myChart = new Chart(ctx, {
          type: 'horizontalBar',
          data: {
            labels: tick_labels,
            datasets: [{
              label : 'Duration of booking',
              data: durations,
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              xAxes: [{
                ticks: {
                  maxRotation: 90,
                  minRotation: 80,
                  beginAtZero : true
                }
              }],
              yAxes: [{
                ticks: {
                  beginAtZero: true
                }
              }]
            }
          }
        });

        $("#bar-chart").slideDown()
      })
    }
  })
})
