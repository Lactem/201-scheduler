var stompClient = null;
var numEvents = 1;
var numValidatedEvents = 0;
var validatedEvents = [];

function connect() {
    var socket = new SockJS('/calendar-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        
        // Listen for responses to creating a new calendar
        stompClient.subscribe('/topic/calendarCreateResponse', function (response) {
        	var responseBody = JSON.parse(response.body);
        	var responseMsg = responseBody.response;
        	var calendarId = responseBody.calendarId;
        	console.log('response msg from /topic/calendarCreateResponse: ' + responseMsg);
        	console.log('received calendar id: ' + calendarId);

        	// Redirect the user to the "view calendar" page if the calendar was created successfully
        	if (responseMsg == "OK") {
        		$("#redirect").html('<form action="http://localhost:8080/calendar/view/' +
        				'" method="POST" name="redirect" style="display:none;">' +
        				'<input type="text" name="calendarId" value="' + calendarId + '" /></form>');
        		document.forms['redirect'].submit();
        	}
        });
        
        // Listen for responses to validating a calendar event
        stompClient.subscribe('/topic/calendarValidateResponse', function (response) {
        	var responseEvents = JSON.parse(response.body).events;
        	console.log('printing response msg from /topic/calendarValidateResponse...');
        	console.log(responseEvents);
        	validatedEvents = validatedEvents.concat(responseEvents);
        	numValidatedEvents++;
        	
        	// Send the "create calendar" message if all events are successfully validated
        	if (numValidatedEvents == numEvents) {
        		stompClient.send("/app/calendar/create", {}, JSON.stringify(
        				{
        					'name': $("#calendarName").val(),
        					'ownerEmail': ownerEmail,
        					'events': validatedEvents
        				}));
        	}
        });
    });
}

// Sends the fields from an event's div to the server to make sure they contain valid values
function validateEvent(div) {
	var eventData = 
		{
			'title': div.children('input[name="title"]').val(),
			'startTime': div.children('input[name="startTime"]').val(),
			'endTime': div.children('input[name="endTime"]').val(),
			'weekOf': div.children('input[name="weekOf"]').val(),
			'sunday': div.children('input[name="Sunday"]').is(":checked"),
			'monday': div.children('input[name="Monday"]').is(":checked"),
			'tuesday': div.children('input[name="Tuesday"]').is(":checked"),
			'wednesday': div.children('input[name="Wednesday"]').is(":checked"),
			'thursday': div.children('input[name="Thursday"]').is(":checked"),
			'friday': div.children('input[name="Friday"]').is(":checked"),
			'saturday': div.children('input[name="Saturday"]').is(":checked"),
			'notes': div.children('input[name="notes"]').val()
		};
	console.log('printing eventData...');
	console.log(eventData);
	
	stompClient.send("/app/calendar/validate", {}, JSON.stringify(eventData));
}

function sendNewCalendar() {
	// Validate all events
	for (i = 0; i < numEvents; i++) {
		console.log('looping event ' + (i+1));
		validateEvent($("#event" + (i+1)));
	}
}

$(document).ready(function() {
	connect();
});

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    
    $("#createCalendarButton").click(function() { sendNewCalendar(); });
    
	$("#addEventButton").click(function() {
		numEvents++;
		var html = "<div id=event" + numEvents + ">";
		html += "<b><label>Event #" + numEvents + "</label></b><br /> \
    		<label for='eventName'>Event Name</label> \
    		<input type='text' name='title' /><br /> \
    		<label for='startTime'>Start Time</label> \
    		<input type='text' name='startTime' value=\"1:30 PM\" /><br /> \
    		<label for='endTime'>End Time</label> \
    		<input type='text' name='endTime' value=\"3:00 PM\" /><br /><br /> \
    		\
    		Week Of <input type=\"text\" name=\"weekOf\" value=\"" + $("#weekOf").val() + "\" /><br /><br /> \
    		On Days<br />\
    		<input type=\"checkbox\" name=\"Sunday\" value=\"T\" />Sunday<br /> \
    		<input type=\"checkbox\" name=\"Monday\" value=\"T\" />Monday<br /> \
    		<input type=\"checkbox\" name=\"Tuesday\" value=\"T\" />Tuesday<br /> \
    		<input type=\"checkbox\" name=\"Wednesday\" value=\"T\" />Wednesday<br /> \
    		<input type=\"checkbox\" name=\"Thursday\" value=\"T\" />Thursday<br /> \
    		<input type=\"checkbox\" name=\"Friday\" value=\"T\" />Friday<br /> \
    		<input type=\"checkbox\" name=\"Saturday\" value=\"T\" />Saturday<br /><br/> \
    		<label for='notes'>Notes</label> \
    		<input type='text' name='notes' value='Note to self...' /><br /><br />";
		html += "</div>";
		$("#event" + (numEvents-1)).after(html);
	});
});