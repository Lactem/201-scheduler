package scheduler.controller.calendar.message;

import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class FindMessage {
	private List<String> calendarIds; // The ids of the calendars to view
}