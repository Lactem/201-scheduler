package scheduler.controller.calendar.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import scheduler.data.Calendar;

/**
 * The message sent from the server to every client currently editing a calendar.
 * Sent whenever a user edits a calendar.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateMessageResponse {
	private Calendar updatedCalendar;
}
