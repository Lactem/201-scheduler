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

	stompClient.send("/app/calendar/viewWeek", {}, JSON.stringify(
			{
				'calendarIds': calendarIds,
				'weekOf': weekOf
			}));
}

function updateView(events) {
	var html = "<table><tbody>";
	for (i in events) {
		event = events[i];
		html += "<tr> \
			<td>" + event.title + "</td> \
			<td>Starts: " + event.start + "</td> \
			<td>Ends: " + event.end + "</td> \
			<td>Notes: " + event.notes + "</td> \
		</tr>";
	}
	
	html +=	"</tbody></table>";
	$("#viewEvents").html(html);
}

function populateControls() {
	// Get the current week and display it
	var today = moment();
	var weekOf = today.startOf('week').isoWeekday(1);
	var weekOfStr = weekOf.format('D/M/YYYY');
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