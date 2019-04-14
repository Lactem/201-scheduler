package scheduler.controller.calendar.message;

import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Message sent from the client to the server when a user wants to view calendar events.
 */
@Data
@NoArgsConstructor
public class ViewMessage {
	private List<String> calendarIds; // The ids of the calendars to view
	private String weekOf; // The week to display events for
}
