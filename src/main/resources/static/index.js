$(document).ready( function() {
	var weekOf = moment("2019-04-22", "YYYY-MM-DD");
	var daysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
	var datesOfWeek = [weekOf.day(0).format("D"), weekOf.day(1).format("D"), weekOf.day(2).format("D"), weekOf.day(3).format("D"), weekOf.day(4).format("D"), weekOf.day(5).format("D"), weekOf.day(6).format("D")];
	var html = "<br><br><br><br><br><p class='weekOf'>Week of " + weekOf.day(0).format("MMM DD, YYYY") + "</p><br><br><table><thead><tr><th></th>"; //<tbody>
	
	for(var i = 0; i < 7; i++) {
		var day = i+1;
		html += "<th><span id='date" + i + "' class='day'>" +  datesOfWeek[i] + "</span> \
				<span class='short'>" + daysOfWeek[i] + "</span></th>";
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
						
			
			html += "<td id='0-" + currHr.format("HH") + "-" + j.toString() + "'></td> \
					<td id='1-" + currHr.format("HH") + "-" + j.toString() + "'></td> \
					<td id='2-" + currHr.format("HH") + "-" + j.toString() + "'></td> \
					<td id='3-" + currHr.format("HH") + "-" + j.toString() + "'></td> \
					<td id='4-" + currHr.format("HH") + "-" + j.toString() + "'></td> \
					<td id='5-" + currHr.format("HH") + "-" + j.toString() + "'></td> \
					<td id='6-" + currHr.format("HH") + "-" + j.toString() + "'></td> \
					</tr>";
			
			if(j == 3) currHr = moment(currHr).add(2, "hours");
		}
	}
	
	html += "</tbody></table>";
	$("#indexCalendar").html(html);
});

