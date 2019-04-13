package scheduler.controller.calendar.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The message sent from the server to the client when a user creates a calendar.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateMessageResponse {
	private String calendarId;
	private String response;
}
