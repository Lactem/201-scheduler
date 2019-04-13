package scheduler.controller.calendar.message;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import scheduler.data.CalendarEvent;

/**
 * The message sent from the server to the client when a user wants to validate a calendar event.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ValidateMessageResponse {
	private List<CalendarEvent> events;
}
