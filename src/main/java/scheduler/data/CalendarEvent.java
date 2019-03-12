package scheduler.data;

import java.util.Date;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CalendarEvent {
	private Date start; // When the event starts
	private Date end; // When the event starts
	private String notes; // Any note about the event (e.g. its location or what to wear)
}
