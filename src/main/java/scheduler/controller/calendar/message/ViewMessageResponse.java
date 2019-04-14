package scheduler.controller.calendar.message;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import scheduler.data.CalendarEvent;

/**
 * The message sent from the server to every client to view events.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ViewMessageResponse {
	private List<CalendarEvent> events;
}
