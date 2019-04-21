package scheduler.controller.calendar.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The message sent from the server to the client when a user shares calendars.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShareMessageResponse {
	private String response;
}
