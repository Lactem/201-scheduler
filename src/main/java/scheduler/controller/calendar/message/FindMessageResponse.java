package scheduler.controller.calendar.message;


import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;
import scheduler.data.CalendarEvent;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FindMessageResponse {
	private List<CalendarEvent> conflictingEvents; // The ids of the calendars to view
}
