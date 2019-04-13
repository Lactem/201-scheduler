package scheduler.data;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder(builderClassName="Builder")
public class CalendarEvent {
	private String title; // The name of the event
	private String weekOf; // The Sunday that starts the week that the event takes place in
	private LocalDateTime start; // When the event starts
	private LocalDateTime end; // When the event starts
	private String notes; // Any note about the event (e.g. its location or what to wear)
}
