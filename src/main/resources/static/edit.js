var stompClient = null;

function connect() {
    var socket = new SockJS('/calendar-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        
        // Listen for responses to the changes we send to the server
        stompClient.subscribe('/topic/calendarChanges', function (calendarChange) {
        	var updatedCalendar = JSON.parse(calendarChange.body).updatedCalendar;
            // Make an AJAX call to get the updated calendar. Refresh the DOM using jQuery once the call is complete
            $.ajax({
                url: ROUTE + "/api/calendar/id/" + updatedCalendar.id
            }).then(function(response) {
            	refreshCalendar(response);
            });
        });
    });
}

function sendChanges() {
	stompClient.send("/app/calendar/submitChanges", {}, JSON.stringify({'calendarId': calendar.id, 'updatedEvents': calendar.events}));
}

function clearCalendar() {
	for(var i = 0; i <= 7; i++) {
		for(var j = 8; j < 24; j++) {
			for(var k = 0; k < 4; k++) {		
				var curSelector = "#" + i + "-" + j.toString() + "-" + k.toString();
				$(curSelector).html('');
				$(curSelector).empty();
				$(curSelector).css("background-color", "");
				$(curSelector).css("border-top-left-radius", "");
				$(curSelector).css("border-top-right-radius", "");
				$(curSelector).css("border-bottom-left-radius", "");
				$(curSelector).css("border-bottom-right-radius", "");
			}
		}
	}
}

function nearestTime(time) {
	var curTime = parseInt(time);
	if(curTime%2 != 0) curTime += 1;
	return curTime;
}

// Displays the most recently updated calendar without forcing the user to refresh the whole page
function refreshCalendar(updatedCalendar) {
	clearCalendar();
	
	calendar = updatedCalendar;
	
	var updatedHtml = "<label>Events for calendar: " + calendar.name + "</label><table><tbody>";
    
	// Update events

	var events = calendar.events;
	
	if(events.length == 0) return;
	var weekOf = moment(calendar.events[0].weekOf);
	var daysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
	var datesOfWeek = [weekOf.day(0).format("D"), weekOf.day(1).format("D"), weekOf.day(2).format("D"), weekOf.day(3).format("D"), weekOf.day(4).format("D"), weekOf.day(5).format("D"), weekOf.day(6).format("D")];
	var eventColors = ["#f49242", "#f441b2", "#7cf441", "#70cdf4", "#c97df2", "#f28a8f", "#f75960", "#f7ec88", "#8e8af7", "#fcb58f"];
	for (var eventIndex = 0; eventIndex < events.length; eventIndex++) {
		var event = calendar.events[eventIndex];
		
		var eventColor = eventColors[eventIndex%10];
		
		var eventDayOfWeek = moment(event.start).day();
		
		var startTime = moment(event.start).format("h:mm a");
		var endTime = moment(event.end).format("h:mm a");
		
		var startTimeInt = parseInt(moment(event.start).format("H")); //for JQuery tag selection
		startTimeInt = nearestTime(startTimeInt);
		
		var endTimeInt = parseInt(moment(event.end).format("H")); //for JQuery tag selection
		endTimeInt = nearestTime(endTimeInt);
		
		var dayOfHourIDTag = "#" + eventDayOfWeek + "-" + startTimeInt.toString() + "-0";
		$(dayOfHourIDTag).attr('onClick', 'editEvent(' + eventIndex + ');');
		
		
		$(dayOfHourIDTag).html(event.title.toString() + "<br>"
				+ startTime + "-" + endTime);
		$(dayOfHourIDTag).css("border-top-left-radius", "10px");
		$(dayOfHourIDTag).css("border-top-right-radius", "10px");
		
		for(curTime = startTimeInt; curTime < endTimeInt; curTime += 2) {
			var curSelector0 = "#" + eventDayOfWeek + "-" + curTime.toString() + "-0";
			var curSelector1 = "#" + eventDayOfWeek + "-" + curTime.toString() + "-1";
			var curSelector2 = "#" + eventDayOfWeek + "-" + curTime.toString() + "-2";
			var curSelector3 = "#" + eventDayOfWeek + "-" + curTime.toString() + "-3";
			
			$(curSelector0).css("background-color", eventColor);
			$(curSelector0).attr('onClick', 'editEvent(' + eventIndex + ');');
			
			$(curSelector1).css("background-color", eventColor);
			$(curSelector1).attr('onClick', 'editEvent(' + eventIndex + ');');
			
			$(curSelector2).css("background-color", eventColor);
			$(curSelector2).attr('onClick', 'editEvent(' + eventIndex + ');');
			
			$(curSelector3).css("background-color", eventColor);
			$(curSelector3).attr('onClick', 'editEvent(' + eventIndex + ');');
		}
		
		dayOfHourIDTag = "#" + eventDayOfWeek + "-" + (endTimeInt - 2).toString() + "-3";
		$(dayOfHourIDTag).css("border-bottom-left-radius", "10px");
		$(dayOfHourIDTag).css("border-bottom-right-radius", "10px");
		
		/*updatedHtml += '<tr onclick="editEvent(' + eventIndex + ');">';
		
		updatedHtml += "<td>" + event.title + "</td>";
		updatedHtml += "<td>Starts:" + event.start + "</td>";
		updatedHtml += "<td>Ends:" + event.end + "</td>";
		updatedHtml += "<td>Note:" + event.notes + "</td>";
		
		updatedHtml += "</tr>";*/
	}
	
	// Display updated calendar
	/*updatedHtml += "</tbody></table>";
    $("#displayCalendar").html(updatedHtml);*/
    
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
	var event = calendar.events[eventIndex];
	var date = moment(event.start);
	var weekDay = date.day(); // 1-7 where 1 is Monday and 7 is Sunday
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
    	<input type='checkbox' name='Sunday'" + (weekDay == 0 ? "checked" : "") + " />Sunday<br /><br /> \
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
	var weekOfStr = weekOf.format('M/D/YYYY');
	
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

function generateCalendar () {
	var weekOf = moment("2019-04-15", "YYYY-MM-DD");
	if(calendar.events.length != 0) weekOf = moment(calendar.events[0].weekOf);
	var daysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
	var datesOfWeek = [weekOf.day(0).format("D"), weekOf.day(1).format("D"), weekOf.day(2).format("D"), weekOf.day(3).format("D"), weekOf.day(4).format("D"), weekOf.day(5).format("D"), weekOf.day(6).format("D")];
	var html = "<br><br><table id='newCalendar'><thead><tr style='border-bottom: 3px solid #cbcbcb;'><th style='border-right: 3px solid #cbcbcb; border-bottom: 3px solid #cbcbcb;'></th>"; //<tbody>
	
	html += "<th style='border-bottom: 3px solid #cbcbcb;'><span id='date" + 0 + "' class='day'><br>" +  datesOfWeek[0] + "</span> \
	<span class='short'>" + daysOfWeek[0] + "<br><br><br></span></th>";
	for(var i = 1; i < 7; i++) {
		var day = i+1;
		html += "<th style='border-left: 3px solid #cbcbcb; border-bottom: 3px solid #cbcbcb;'><span id='date" + i + "' class='day'><br>" +  datesOfWeek[i] + "</span> \
				<span class='short'>" + daysOfWeek[i] + "<br><br><br></span></th>";
	}
	
	html += "</tr></thead><tbody>";
	
	var currHr = moment("2018-01-01T08:00:00");
	
	for(var i = 0; i < 8; i++) {
		for(var j = 0; j < 4; j++) {
			html += "<tr>";
			if(j==0) {
				if(currHr.format("HH:mm").toString() == "08:00") html += "<td style='border-right: 3px solid #cbcbcb;' id = '" + currHr.format("HH:mm") + "' class='hour' rowspan='4'> \
				<span>" + currHr.format("h:mm a") + "</span></td>";
				else html += "<td style='border-top: 3px solid #cbcbcb; border-right: 3px solid #cbcbcb;' id = '" + currHr.format("HH:mm") + "' class='hour' rowspan='4'> \
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
	$("#viewEvents").html(html);
}

$(document).ready(function() {
	connect();
	generateCalendar();
	refreshCalendar(calendar);
	populateAddEvent();
});

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $("#send").click(function() { sendChanges(); });
});