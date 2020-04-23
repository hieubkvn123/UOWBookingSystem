$(document).ready(function(){
	$('.btn-expand-collapse').click(function(e) {
		$('.navbar-primary').toggleClass('collapsed');
	});

	$("#view_room").click(function(){
		alert("You selected view room")
	})
})