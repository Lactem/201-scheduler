package scheduler.controller.calendar.message;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Message sent from the client to the server when a user tries to edit a calendar.
 */
@Data
@NoArgsConstructor
public class UpdateMessage {
	private String calendarId; // The id of the calendar to edit an event for
	private int editedEventIndex; // The index (of the list of events) of the event to modify
	private boolean remove; // Whether or not the event is being deleted
	private ValidateMessage editedEvent; // The (validated) event changes
}
