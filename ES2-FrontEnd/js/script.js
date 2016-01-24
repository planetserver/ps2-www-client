
	/*left menu opening function*/
$(document).ready(function () {
	$('#menu-toggle').click(function() {
		if($('#menu').hasClass('open')) {
			$('#menu').removeClass('open');
			$('#menu-toggle').removeClass('open');
		}
		else {
			$('#menu').addClass('open');
			$('#menu-toggle').addClass('open');
		}
	});
});

	/*right menu opening function*/
$(document).ready(function () {
	$('#right-menu-toggle').click(function() {
		if($('#right-menu').hasClass('open')) {
			$('#right-menu').removeClass('open');
			$('#right-menu-toggle').removeClass('open');
		}
		else {
			$('#right-menu').addClass('open');
			$('#right-menu-toggle').addClass('open');
		}
	});
});

	/*right menu opening function*/
$(document).ready(function () {
	$('#right-layer-menu-toggle').click(function() {
		if($('#right-layer-menu').hasClass('open')) {
			$('#right-layer-menu').removeClass('open');
			$('#right-layer-menu-toggle').removeClass('open');
		}
		else {
			$('#right-layer-menu').addClass('open');
			$('#right-layer-menu-toggle').addClass('open');
		}
	});
});


var xhttp = new XMLHttpRequest();
xhttp.open("GET", "https://raw.githubusercontent.com/planetserver/ps2-documentation/master/about.md", true);
xhttp.send();
xhttp.onreadystatechange = function() {
  if (xhttp.readyState == 4 && xhttp.status == 200) {
    document.getElementById("collapse1").innerHTML = xhttp.responseText;
  }
};




  
