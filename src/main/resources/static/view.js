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

function updateView(events) {
	
	var weekOf = moment(events[0].weekOf);
	var daysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
	var datesOfWeek = [weekOf.day(0).format("D"), weekOf.day(1).format("D"), weekOf.day(2).format("D"), weekOf.day(3).format("D"), weekOf.day(4).format("D"), weekOf.day(5).format("D"), weekOf.day(6).format("D")];
	var html = "<br><br><table><thead><tr><th></th>"; //<tbody>
	
	for(var i = 0; i < 7; i++) {
		var day = i+1;
		html += "<th><span class='day'>" +  datesOfWeek[i] + "</span> \
				<span class='short'>" + daysOfWeek[i] + "</span></th>";
	}
	
	html += "</tr></thead><tbody>";
	
	var currHr = moment("2018-01-01T08:00:00");
	
	for(var i = 0; i < 8; i++) {
		for(var j = 0; j < 4; j++) {
			html += "<tr>";
			if(j == 0) {
				html += "<td id = '" + currHr.format("HH:mm") + "' class='hour' rowspan='4'> \
						<span>" + currHr.format("HH:mm") + "</span></td>";
				currHr = moment(currHr).add(2, "hours");
			}
			html += "<td></td> \
					<td></td> \
					<td></td> \
					<td></td> \
					<td></td> \
					<td></td> \
					<td></td> \
					</tr>";
		}
	}
	
	html += "</tbody></table>";
	for (i in events) {
		event = events[i];
		console.log(moment(event.start).format("MMM D YY"));
		/*html += "<tr> \
			<td>" + event.title + "</td> \
			<td>Starts: " + event.start + "</td> \
			<td>Ends: " + event.end + "</td> \
			<td>Notes: " + event.notes + "</td> \
		</tr>";*/
	}
	
	html +=	"</tbody></table>";
	$("#viewEvents").html(html);
}

function populateControls() {
	// Get the current week and display it
	var today = moment();
	var weekOf = today.startOf('week').isoWeekday(1);
	var weekOfStr = weekOf.format('M/D/YYYY');
	$('input[name="viewingWeek"]').val(weekOfStr);
	
	// Display the user's calendars and select a default
	var html = "<b><label>Select Calendar</label></b>";
	html += "<input type='checkbox' name='calendar' value='" + viewedCalendar.id + "' checked />" + viewedCalendar.name + "<br />";
	for (i in allCalendars) {
		calendar = allCalendars[i];
		if (calendar.id == viewedCalendar.id) continue;
		html += "<input type='checkbox' name='calendar' value='" + calendar.id + "' />" + calendar.name + "<br />";
	}
	html += "<button type='button' onclick='requestWeek();'>View</button>";
	$("#selectCalendars").html(html);
	
	// Show the calendar for this week
	requestWeek();
}

$(document).ready(connect());


$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $("#send").click(function() { sendChanges(); });
});