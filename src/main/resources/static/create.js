var stompClient = null;
var numEvents = 1;
var numValidatedEvents = 0;
var validatedEvents = [];

function connect() {
    var socket = new SockJS('/calendar-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        
        // Listen for responses to creating a new calendar
        stompClient.subscribe('/topic/calendarCreateResponse', function (response) {
        	var responseBody = JSON.parse(response.body);
        	var responseMsg = responseBody.response;
        	var calendarId = responseBody.calendarId;

        	// Redirect the user to the "view calendar" page if the calendar was created successfully
        	if (responseMsg == "OK") {
        		$("#redirect").html('<form action="' + ROUTE + '/calendar/view/' +
        				'" method="POST" name="redirect" style="display:none;">' +
        				'<input type="text" name="calendarId" value="' + calendarId + '" /></form>');
        		document.forms['redirect'].submit();
        	}
        });
        
        // Listen for responses to validating a calendar event
        stompClient.subscribe('/topic/calendarValidateResponse', function (response) {
        	var responseEvents = JSON.parse(response.body).events;
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

function generateCalendar() {
	var weekOf = moment().day(0);
	var eventColors = ["#f49242", "#f441b2", "#7cf441", "#70cdf4", "#c97df2", "#f28a8f", "#f75960", "#f7ec88", "#8e8af7", "#fcb58f"];
	var daysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
	var datesOfWeek = [weekOf.day(0).format("D"), weekOf.day(1).format("D"), weekOf.day(2).format("D"), weekOf.day(3).format("D"), weekOf.day(4).format("D"), weekOf.day(5).format("D"), weekOf.day(6).format("D")];
	var html = "<p class='weekOf' style='font-size: 20px; font-weight: bold'> Week of " + weekOf.day(0).format("MMM DD, YYYY") + "</p><br><table><thead><tr><th></th>"; //<tbody>
	
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
	$("#generateCalendar").html(html);
}

// Sends the fields from an event's div to the server to make sure they contain valid values
function validateEvent(div) {
	var eventData = 
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
	
	stompClient.send("/app/calendar/validate", {}, JSON.stringify(eventData));
}

function sendNewCalendar() {
	// Validate all events
	for (i = 0; i < numEvents; i++) {
		validateEvent($("#event" + (i+1)));
	}
}

$(document).ready(function() {
	connect();
	// Get the current week
	var today = moment();
	var weekOf = today.startOf('week').isoWeekday(1);
	var weekOfStr = weekOf.format('M/D/YYYY');
	generateCalendar();
	$("#weekOf").val(weekOfStr);
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
    		<input type='checkbox' name='Monday' />Monday<br /> \
    		<input type='checkbox' name='Tuesday' />Tuesday<br /> \
    		<input type='checkbox' name='Wednesday' />Wednesday<br /> \
    		<input type='checkbox' name='Thursday' />Thursday<br /> \
    		<input type='checkbox' name='Friday' />Friday<br /> \
    		<input type='checkbox' name='Saturday' />Saturday<br /> \
    		<input type='checkbox' name='Sunday' />Sunday<br /><br /> \
    		<label for='notes'>Notes</label> \
    		<input type='text' name='notes' value='Note to self...' /><br /><br />";
		html += "</div>";
		$("#event" + (numEvents-1)).after(html);
	});
});