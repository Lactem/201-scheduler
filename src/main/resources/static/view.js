var stompClient = null;

function connect() {
    var socket = new SockJS('/calendar-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        populateControls();
        
        // Listen for responses to the week view we requested
        stompClient.subscribe('/topic/viewWeek', function (response) {
        	var events = JSON.parse(response.body).events;
        	console.log('received events, printing...');
        	console.log(events);
        	updateView(events);
        });
    });
}


// Sends a message to the server requesting a list of events for a given week
function requestWeek() {
	var calendarIds = [];
	$.each($('input[name="calendar"]:checked'), function() {
		calendarIds.push($(this).val());
	});
	var weekOf = $("#controls").children('input[name="viewingWeek"]').val();
	//console.log("WEEK OF " + weekOf);
	weekOf = moment(weekOf).format("D/M/YYYY");
	//console.log("NEW WEEK OF " + weekOf);

	stompClient.send("/app/calendar/viewWeek", {}, JSON.stringify(
			{
				'calendarIds': calendarIds,
				'weekOf': weekOf
			}));
}

function clearCalendar() {
	for(var i = 0; i < 7; i++) {
		for(var j = 8; j < 24; j+=2) {
			for(var k = 0; k < 4; k++) {
				var jStr = j.toString();
				if(j < 10) jStr = "0" + j.toString();				
				var curSelector = "#" + i + "-" + jStr + "-" + k;
				$(curSelector).empty();
			}
		}
	}
}

function updateView(events) {
	clearCalendar();
	if(events.length == 0) return;
	var weekOf = moment(events[0].weekOf);
	var daysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
	var datesOfWeek = [weekOf.day(0).format("D"), weekOf.day(1).format("D"), weekOf.day(2).format("D"), weekOf.day(3).format("D"), weekOf.day(4).format("D"), weekOf.day(5).format("D"), weekOf.day(6).format("D")];
	for(var i = 0; i < 7; i++) {
		$("#date" + i).html(datesOfWeek[i]);
	}
	var eventColors = ["#f49242", "#f441b2", "#7cf441", "#70cdf4", "#c97df2", "#f28a8f", "#f75960", "#f7ec88", "#8e8af7", "#fcb58f"];
	
	for (i in events) {
		event = events[i];
		var eventColor = eventColors[i%10];
		//console.log(moment(event.start).format("MMM D YY"));
		var startDate = moment(event.start).day();
		var startDayIDTag = "#date" + startDate;
		var startTime = moment(event.start).format("HH");
		var startTimeInt = parseInt(startTime);
		startTimeInt = startTimeInt % 2 == 0 ? startTimeInt : startTimeInt + 1;
		var startTimeStr = startTimeInt.toString();
		if(startTimeInt < 10) startTimeStr = "0" + startTimeInt.toString();
		
		var endTime = moment(event.end).format("HH");
		var endTimeInt = parseInt(endTime);
		endTimeInt = endTimeInt % 2 == 0 ? endTimeInt : endTimeInt + 1;
		var endTimeStr = endTimeInt.toString();
		if(endTimeInt < 10) endTimeStr = "0" + endTimeInt.toString();
		
		//console.log(event.title);
		
		var dayOfHourIDTag = "#" + startDate + "-" + startTimeInt.toString() + "-0";
		$(dayOfHourIDTag).html(event.title.toString() + "<br>"
				+ moment(event.start).format("HH:mm") + "-" + moment(event.end).format("HH:mm"));
		$(dayOfHourIDTag).css("border-top-left-radius", "10px");
		$(dayOfHourIDTag).css("border-top-right-radius", "10px");

		for(var j = startTimeInt; j < endTimeInt; j+=2) {
			var jStr = j.toString();
			if(j < 10) jStr = "0" + j.toString();
			var hourIDTag = "#" + jStr;
			var dayOfHourIDTag0 = "#" + startDate + "-" + jStr + "-0";
			var dayOfHourIDTag1 = "#" + startDate + "-" + jStr + "-1";
			var dayOfHourIDTag2 = "#" + startDate + "-" + jStr + "-2";
			var dayOfHourIDTag3 = "#" + startDate + "-" + jStr + "-3";
			//console.log("DAY OF HOUR TAG " + dayOfHourIDTag);
			
			//console.log($(dayOfHourIDTag));
			$(dayOfHourIDTag0).css("background-color", eventColor);
			$(dayOfHourIDTag1).css("background-color", eventColor);
			$(dayOfHourIDTag2).css("background-color", eventColor);
			$(dayOfHourIDTag3).css("background-color", eventColor);
		}
		//console.log(endTimeStr);
		dayOfHourIDTag = "#" + startDate + "-" + (endTimeInt - 2).toString() + "-3";
		$(dayOfHourIDTag).css("border-bottom-left-radius", "10px");
		$(dayOfHourIDTag).css("border-bottom-right-radius", "10px");
		/*html += "<tr> \
			<td>" + event.title + "</td> \
			<td>Starts: " + event.start + "</td> \
			<td>Ends: " + event.end + "</td> \
			<td>Notes: " + event.notes + "</td> \
		</tr>";*/
	}
	
}

function populateControls() {
	// Get the current week and display it
	var today = moment();
	var weekOf = today.startOf('week').isoWeekday(1);
	var weekOfStr = weekOf.format('D/M/YYYY');
	$('input[name="viewingWeek"]').val(weekOfStr);
	
	// Display the user's calendars and select a default
	var html = "<b><label>Select Calendar</label></b><br>";
	html += "<br><div class='selectCal'><input type='checkbox' class='selectCal' name='calendar' value='" + viewedCalendar.id + "' checked />" + viewedCalendar.name + "</div><br />";
	for (i in allCalendars) {
		calendar = allCalendars[i];
		if (calendar.id == viewedCalendar.id) continue;
		html += "<div class='selectCal'><input type='checkbox' class='selectCal' name='calendar' value='" + calendar.id + "' />" + calendar.name + "</div><br />";
	}
	html += "<button type='button' onclick='requestWeek();'>View</button>";
	$("#selectCalendars").html(html);
	
	// Show the calendar for this week
	requestWeek();
}

$(document).ready(connect());
$(document).ready( function() {
	var weekOf = moment("2019-04-08", "YYYY-MM-DD");
	var daysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
	var datesOfWeek = [weekOf.day(0).format("D"), weekOf.day(1).format("D"), weekOf.day(2).format("D"), weekOf.day(3).format("D"), weekOf.day(4).format("D"), weekOf.day(5).format("D"), weekOf.day(6).format("D")];
	var html = "<br><br><table><thead><tr><th></th>"; //<tbody>
	
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
				html += "<td style='border-top: 1px solid #c6cad0' id = '" + currHr.format("HH:mm") + "' class='hour' rowspan='4'> \
						<span>" + currHr.format("HH:mm") + "</span></td>";
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
	$("#viewEvents").html(html);
});

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $("#send").click(function() { sendChanges(); });
});