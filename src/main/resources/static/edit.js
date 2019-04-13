var stompClient = null;

function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
}

function connect() {
    var socket = new SockJS('/calendar-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        setConnected(true);
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/calendarChanges', function (calendarChange) {
        	var updatedCalendar = JSON.parse(calendarChange.body).updatedCalendar;
            // TODO: Make an AJAX call to get the updated calendar. Refresh the DOM using jQuery once the call is complete
            $.ajax({
                url: "http://localhost:8080/api/calendar/id/" + updatedCalendar.id
            }).then(function(response) { // It doesn't matter what the response is. We always update the page
            	console.log('printing response...');
            	console.log(response);
            	var updatedHtml = "<table>";
            	updatedHtml += "<td>Updated!!</td>";
            	updatedHtml += "</table>";
               $("#displayCalendar").html(updatedHtml);
            });
        });
    });
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

function sendChanges() {
	stompClient.send("/app/calendar/submitChanges", {}, JSON.stringify({'calendarId': calendar.id, 'updatedEvents': []}));
}

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $("#connect").click(function() { connect(); });
    $("#disconnect").click(function() { disconnect(); });
    $("#send").click(function() { sendChanges(); });
});