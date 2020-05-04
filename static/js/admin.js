$(document).ready(function(){
  $("#close-modal1").click(function(){
    $("#myModal1").fadeOut("fast")
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
          console.log("Room number " + objects[i].room_id + " occupied : " + objects[i].occupied)

          var color = "red"
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
            .css('listStyleType', 'none')
            .css('margin', '20px')
            .css("opacity", 1.0)
            .css('box-shadow', '5px 10px #888888')
            .css("border", "1px outset " + color)
            .tooltip({ show: { effect: "blind", duration: 800, content : tooltipContent } })
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
                  console.log(response)

                  var avail_from = new Date(obj.avail_from)
                  var avail_to = new Date(obj.avail_to)

                  var avail_from_str = avail_from.getFullYear() + "-" + pad(avail_from.getMonth()+1,2) + "-" + pad(avail_from.getDate(),2)
                  var avail_to_str = avail_to.getFullYear() + "-" + pad(avail_to.getMonth() + 1, 2) + "-" + pad(avail_to.getDate(),2)

                  // we can do it like this :
                  // 1. If the room is already approved -> then we disable editing
                  // 2. 
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
})
