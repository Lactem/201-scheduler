package scheduler.controller.calendar.message;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import scheduler.data.CalendarEvent;

/**
 * The message sent from the client to the server when a user wants to create a calendar.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateMessage {
	private String name;
	private String ownerEmail;
	private List<CalendarEvent> events;
}
