package scheduler.controller.calendar.message;

import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;
import scheduler.data.CalendarEvent;

/**
 * Message sent from the client to the server when a user tries to edit a calendar.
 */
@Data
@NoArgsConstructor
public class UpdateMessage {
	private String calendarId;
	private List<CalendarEvent> updatedEvents;
}
