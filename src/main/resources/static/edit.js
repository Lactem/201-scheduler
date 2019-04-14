var stompClient = null;

function connect() {
    var socket = new SockJS('/calendar-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        
        // Listen for responses to the changes we send to the server
        stompClient.subscribe('/topic/calendarChanges', function (calendarChange) {
        	var updatedCalendar = JSON.parse(calendarChange.body).updatedCalendar;
            // Make an AJAX call to get the updated calendar. Refresh the DOM using jQuery once the call is complete
            $.ajax({
                url: "http://localhost:8080/api/calendar/id/" + updatedCalendar.id
            }).then(function(response) {
            	console.log('printing response...');
            	console.log(response);
            	refreshCalendar(response);
            });
        });
    });
}

function sendChanges() {
	stompClient.send("/app/calendar/submitChanges", {}, JSON.stringify({'calendarId': calendar.id, 'updatedEvents': calendar.events}));
}

// Displays the most recently updated calendar without forcing the user to refresh the whole page
function refreshCalendar(updatedCalendar) {
	calendar = updatedCalendar;
	console.log('Refreshing calendar with...');
	console.log(calendar);
	
	var updatedHtml = "<label>Events for calendar: " + calendar.name + "</label><table><tbody>";
    
	// Update events
	var eventIndex = 0;
	for (eventIndex = 0; eventIndex < calendar.events.length; eventIndex++) {
		console.log('eventIndex: ' + eventIndex);
		var event = calendar.events[eventIndex];
		console.log('printing event at ' + eventIndex + '...');
		console.log(event);
		
		updatedHtml += '<tr onclick="editEvent(' + eventIndex + ');">';
		
		updatedHtml += "<td>" + event.title + "</td>";
		updatedHtml += "<td>Starts:" + event.start + "</td>";
		updatedHtml += "<td>Ends:" + event.end + "</td>";
		updatedHtml += "<td>Note:" + event.notes + "</td>";
		
		updatedHtml += "</tr>";
	}
	
	// Display updated calendar
	updatedHtml += "</tbody></table>";
    $("#displayCalendar").html(updatedHtml);
    
    // Clear the updates so the user isn't updating an old event
    $("#editEvent").html('');
}

/**
 * Saves changes to an event
 * @param eventIndex the index of the event being modified
 * @param remove true to delete the event, false to just modify it
 */
function saveChanges(eventIndex, remove) {
	// eventIndex of -1 indicates adding a new event. Any other number represents editing an existing event
	var eventData = null;
	if (!remove) {
		var div = eventIndex == -1 ? $("#addEvent") : $("#editEvent");
		eventData =
		{
				'title': div.children('input[name="title"]').val(),
				'startTime': div.children('input[name="startTime"]').val(),
				'endTime': div.children('input[name="endTime"]').val(),
				'weekOf': div.children('input[name="weekOf"]').val(),
				'monday': div.children('input[name="Monday"]').is(":checked"),
				'tuesday': div.children('input[name="Tuesday"]').is(":checked"),
				'wednesday': div.children('input[name="Wednesday"]').is(":checked"),
				'thursday': div.children('input[name="Thursday"]').is(":checked"),
				'friday': div.children('input[name="Friday"]').is(":checked"),
				'saturday': div.children('input[name="Saturday"]').is(":checked"),
				'sunday': div.children('input[name="Sunday"]').is(":checked"),
				'notes': div.children('input[name="notes"]').val()
		};
	}

	stompClient.send("/app/calendar/submitChanges", {}, JSON.stringify(
			{
				'calendarId': calendar.id,
				'editedEventIndex': eventIndex,
				'remove': remove,
				'editedEvent': eventData
			}));
}

function editEvent(eventIndex) {
	console.log('editing event with index: ' + eventIndex);
	var event = calendar.events[eventIndex];
	console.log('printing event at ' + eventIndex + '...');
	console.log(event);
	
	var date = moment(event.start, 'YYYY-MM-DD');
	var weekDay = date.isoWeekday(); // 1-7 where 1 is Monday and 7 is Sunday
	console.log(date);
	console.log('weekDay: ' + weekDay);
	var startTime = moment(event.start).format("h:mm a").toUpperCase();
	var endTime = moment(event.end).format("h:mm a").toUpperCase();
	
	var html = "<b><label>Edit Event</label></b><br /> \
		<label for='eventName'>Event Name</label> \
		<input type='text' name='title' value='" + event.title + "'/><br /> \
		<label for='startTime'>Start Time</label> \
		<input type='text' name='startTime' value='" + startTime + "' /><br /> \
		<label for='endTime'>End Time</label> \
		<input type='text' name='endTime' value='" + endTime + "' /><br /><br /> \
		\
    	Week Of <input type=\"text\" name=\"weekOf\" value=\"" + event.weekOf + "\" /><br /><br /> \
		On Days<br />\
    	<input type='checkbox' name='Monday'" + (weekDay == 1 ? "checked" : "") + " />Monday<br /> \
    	<input type='checkbox' name='Tuesday'" + (weekDay == 2 ? "checked" : "") + " />Tuesday<br /> \
    	<input type='checkbox' name='Wednesday'" + (weekDay == 3 ? "checked" : "") + " />Wednesday<br /> \
    	<input type='checkbox' name='Thursday'" + (weekDay == 4 ? "checked" : "") + " />Thursday<br /> \
    	<input type='checkbox' name='Friday'" + (weekDay == 5 ? "checked" : "") + " />Friday<br /> \
    	<input type='checkbox' name='Saturday'" + (weekDay == 6 ? "checked" : "") + " />Saturday<br /> \
    	<input type='checkbox' name='Sunday'" + (weekDay == 7 ? "checked" : "") + " />Sunday<br /><br /> \
		<label for='notes'>Notes</label> \
		<input type='text' name='notes' value='Note to self...' /><br /><br /> \
    	<button type='button' onclick='saveChanges(" + eventIndex + ", false);'>Save Changes</button> \
    	<button type='button' onclick='saveChanges(" + eventIndex + ", true);'>Delete Event</button>";
	$("#editEvent").html(html);
}

function populateAddEvent() {
	// Get the current week
	var today = moment();
	var weekOf = today.startOf('week').isoWeekday(1);
	var weekOfStr = weekOf.format('D/M/YYYY');
	
	var html = "<b><label>Add New Event</label></b><br /> \
		<label for='eventName'>Event Name</label> \
		<input type='text' name='title'/><br /> \
		<label for='startTime'>Start Time</label> \
		<input type='text' name='startTime' value='1:30 PM' /><br /> \
		<label for='endTime'>End Time</label> \
		<input type='text' name='endTime' value='3:30 PM' /><br /><br /> \
		\
    	Week Of <input type=\"text\" name=\"weekOf\" value=\"" + weekOfStr + "\" /><br /><br /> \
		On Days<br />\
    	<input type='checkbox' name='Monday' />Monday<br /> \
    	<input type='checkbox' name='Tuesday' />Tuesday<br /> \
    	<input type='checkbox' name='Wednesday' />Wednesday<br /> \
    	<input type='checkbox' name='Thursday' />Thursday<br /> \
    	<input type='checkbox' name='Friday' />Friday<br /> \
    	<input type='checkbox' name='Saturday' />Saturday<br /> \
    	<input type='checkbox' name='Sunday' />Sunday<br /><br /> \
		<label for='notes'>Notes</label> \
		<input type='text' name='notes' value='Note to self...' /><br /><br /> \
    	<button type='button' onclick='saveChanges(-1);'>Add Event</button>"; // -1 represents adding a new event
	$("#addEvent").html(html);
}

$(document).ready(function() {
	connect();
	refreshCalendar(calendar);
	populateAddEvent();
});

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $("#send").click(function() { sendChanges(); });
});