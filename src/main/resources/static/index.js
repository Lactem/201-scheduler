function clearCalendar() {
	for(var i = 0; i < 7; i++) {
		for(var j = 8; j < 24; j+=2) {
			for(var k = 0; k < 4; k++) {
				var jStr = j.toString();				
				var curSelector = "#" + i + "-" + jStr + "-" + k;
				$(curSelector).empty();
				$(curSelector).css("background-color", "white");
			}
		}
	}
}

$(document).ready( function() {
	var visitorLoggedIn = document.getElementById("visitorLoggedIn").value;
	console.log(visitorLoggedIn);
	var weekOf = moment("2019-04-22", "YYYY-MM-DD");
	var eventColors = ["#f49242", "#f441b2", "#7cf441", "#70cdf4", "#c97df2", "#f28a8f", "#f75960", "#f7ec88", "#8e8af7", "#fcb58f"];
	var daysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
	var datesOfWeek = [weekOf.day(0).format("D"), weekOf.day(1).format("D"), weekOf.day(2).format("D"), weekOf.day(3).format("D"), weekOf.day(4).format("D"), weekOf.day(5).format("D"), weekOf.day(6).format("D")];
	var html = "<br><br><br><br><br><p class='weekOf'>Week of " + weekOf.day(0).format("MMM DD, YYYY") + "</p><br><br><table><thead><tr><th></th>"; //<tbody>
	
	for(var i = 0; i < 7; i++) {
		var day = i+1;
		html += "<th><span id='date" + i + "' class='day'>" +  datesOfWeek[i] + "</span> \
				<span class='short'>" + daysOfWeek[i] + "<br><br></span></th>";
	}
	
	html += "</tr></thead><tbody>";
	
	var currHr = moment("2018-01-01T08:00:00");
	
	for(var i = 0; i < 8; i++) {
		for(var j = 0; j < 4; j++) {
			html += "<tr>";
			if(j==0) {
				html += "<td id = '" + currHr.format("HH:mm") + "' class='hour' rowspan='4'> \
						<span>" + currHr.format("h:mm a") + "</span></td>";
			}
						
			
			html += "<td id='0-" + currHr.format("H") + "-" + j.toString() + "'></td> \
					<td id='1-" + currHr.format("H") + "-" + j.toString() + "'></td> \
					<td id='2-" + currHr.format("H") + "-" + j.toString() + "'></td> \
					<td id='3-" + currHr.format("H") + "-" + j.toString() + "'></td> \
					<td id='4-" + currHr.format("H") + "-" + j.toString() + "'></td> \
					<td id='5-" + currHr.format("H") + "-" + j.toString() + "'></td> \
					<td id='6-" + currHr.format("H") + "-" + j.toString() + "'></td> \
					</tr>";
			
			if(j == 3) currHr = moment(currHr).add(2, "hours");
		}
	}
	
	html += "</tbody></table>";
	$("#indexCalendar").html(html);

	if(visitorLoggedIn == "true") {
		$("#indexCalendar").click(function() {
			var go_to_url = "http://localhost:8080/calendar/new";
			document.location.href = go_to_url;
		})
		$("#indexCalendar").find("table").css("width", "90%");
	}
	
	if(visitorLoggedIn == "false") {
		$("#indexCalendar").click(function() {
			var go_to_url = "http://localhost:8080/editDemo";
			document.location.href = go_to_url;
		})
		for(var i = 1; i <= 5; i += 2) {
			$("#" + i.toString() + "-8-3").html("Band<br>8:00 am-10:00 am<br>");
			$("#" + i.toString() + "-8-3").css("border-top-left-radius", "10px");
			$("#" + i.toString() + "-8-3").css("border-top-right-radius", "10px");
			$("#" + i.toString() + "-8-3").css("background-color", eventColors[i%10]);
			$("#" + i.toString() + "-10-0").css("background-color", eventColors[i%10]);
			$("#" + i.toString() + "-10-1").css("background-color", eventColors[i%10]);
			$("#" + i.toString() + "-10-1").css("border-bottom-left-radius", "10px");
			$("#" + i.toString() + "-10-1").css("border-bottom-right-radius", "10px");
		}
		for(var i = 1; i <= 5; i++) {
			$("#" + i.toString() + "-14-3").html("Class<br>2:00 pm-5:00 pm<br>");
			$("#" + i.toString() + "-14-3").css("border-top-left-radius", "10px");
			$("#" + i.toString() + "-14-3").css("border-top-right-radius", "10px");
			$("#" + i.toString() + "-14-3").css("background-color", eventColors[(i+5)%10]);
			$("#" + i.toString() + "-16-0").css("background-color", eventColors[(i+5)%10]);
			$("#" + i.toString() + "-16-1").css("background-color", eventColors[(i+5)%10]);
			$("#" + i.toString() + "-16-2").css("background-color", eventColors[(i+5)%10]);
			$("#" + i.toString() + "-16-3").css("background-color", eventColors[(i+5)%10]);
			$("#" + i.toString() + "-16-3").css("border-bottom-left-radius", "10px");
			$("#" + i.toString() + "-16-3").css("border-bottom-right-radius", "10px");
		}
	}
	console.log(visitorLoggedIn);
	
});

$(document).on('load', function() {
	var visitorLoggedIn = document.getElementById("visitorLoggedIn").value;
	if(visitorLoggedIn == 'true') {
		$("#indexCalendar").find("table").css("width", "90%");
	}
});

$(document).on('submit', function() {
	var visitorLoggedIn = document.getElementById("visitorLoggedIn").value;
	if(visitorLoggedIn == 'true') {
		$("#indexCalendar").find("table").css("width", "90%");
	}
});

