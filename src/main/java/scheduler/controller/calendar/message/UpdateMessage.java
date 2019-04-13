package scheduler.controller.calendar.message;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Message sent from the client to the server when a user tries to edit a calendar.
 */
@Data
@NoArgsConstructor
public class UpdateMessage {
	private String calendarId;
	private int editedEventIndex;
	private ValidateMessage editedEvent;
}
