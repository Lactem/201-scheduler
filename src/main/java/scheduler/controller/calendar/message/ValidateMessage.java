package scheduler.controller.calendar.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The message sent from the client to the server when a user wants to validate a calendar event.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ValidateMessage {
	private String title;
	private String startTime;
	private String endTime;
	private String weekOf;
	private boolean sunday;
	private boolean monday;
	private boolean tuesday;
	private boolean wednesday;
	private boolean thursday;
	private boolean friday;
	private boolean saturday;
	private String notes;
}
