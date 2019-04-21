package scheduler.controller.calendar.message;

import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Message sent from the client to the server when a user wants to share calendars.
 */
@Data
@NoArgsConstructor
public class ShareMessage {
	private List<String> calendarIds; // The ids of the calendars to share
	private String emails; // The email addresses(es) of the user(s) to share with
}
