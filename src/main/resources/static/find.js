var stompClient = null;

function connect() {
    var socket = new SockJS('/calendar-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        populateControls();
        
        // Listen for responses to the week view we requested
        stompClient.subscribe('/topic/conflicts', function (response) {
        	var events = JSON.parse(response.body).conflictingEvents;
        	updateView(events);
        });
    });
}

// Sends a message to the server requesting a list of events for a given week
function requestConflicts() {
	var calendarIds = [];
	$.each($('input[name="calendar"]:checked'), function() {
		calendarIds.push($(this).val());
	});

	stompClient.send("/app/calendar/conflicts", {}, JSON.stringify(
			{
				'calendarIds': calendarIds
			}));
}

function updateView(events) {
	var html = "<table><tbody>";
	for (var i = 0; i < events.length -1; i+=2) { //every two events are a conflict
		event = events[i];
		event2 = events[i+1];
		html += "<div class='conflict'>" + event.title + ": "
			+ moment(event.start).format("MMM DD, YYYY") + " at "
			+ moment(event.start).format("h:mm a") + " - "
			+ moment(event.end).format("h:mm a") + 
			 "<br><span class='conflictsWith'>   conflicts with </span><br>"
			+ event2.title + ": "
			+ moment(event2.start).format("MMM DD, YYYY") + " at "
			+ moment(event2.start).format("h:mm a") + " - "
			+ moment(event2.end).format("h:mm a") + "</div><br>";
	}
	
	html +=	"</tbody></table><br>";
	$("#viewEvents").html(html);
}

function populateControls() {
	
	// Display the user's calendars and select a default
	var html = "<b><label>Select Calendar</label><br></b>";
	for (i in allCalendars) {
		calendar = allCalendars[i];
		html += "<br><div class='selectCal'><input type='checkbox' name='calendar' value='" + calendar.id + "' />" + calendar.name + "<br />";
		
		// Add view button
		html += "<form action='/calendar/view' method='POST'>";
		html += "<input type='hidden' name='calendarId' value=" + calendar.id + " />";
		html += "<input type='hidden' name='webVisitor' value=" + webVisitor + " />";
		html += "<button class='submitEditSelect' type='submit'>View Calendar</button></form>";
		html += "<form action='/calendar/edit' method='POST'>";
		html += "<input type='hidden' name='calendarId' value=" + calendar.id + " />";
		html += "<input type='hidden' name='webVisitor' value=" + webVisitor + " />";
		html += "<button class='submitEditSelect' type='submit'>Edit Calendar</button></form></div>";
	}
	html += "<button id='checkConflicts' type='button' onclick='requestConflicts();'>Check Conflicts</button>";
	$("#selectCalendars").html(html);
		
}

$(document).ready(connect());

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
});