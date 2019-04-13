package scheduler.controller.calendar.message;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import scheduler.data.CalendarEvent;

/**
 * The message sent from the client to the server when a user wants to validate a calendar event.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ValidateMessage {
	private String title;
	private String startTime;
	private String endTime;
	private String weekOf;
	private boolean monday;
	private boolean tuesday;
	private boolean wednesday;
	private boolean thursday;
	private boolean friday;
	private boolean saturday;
	private boolean sunday;
	private String notes;
	
	public static List<CalendarEvent> toEvents(ValidateMessage validate) {
		// Use the time info to create a LocalDate object for the week the event will occur
		int day = Integer.valueOf(validate.getWeekOf().split("/")[0]);
		int month = Integer.valueOf(validate.getWeekOf().split("/")[1]);
		int year = Integer.valueOf(validate.getWeekOf().split("/")[2]);
		LocalDate weekOfDate = LocalDate.of(year, month, day);
		
		// Use the time info to create a LocalTime object for start and end
		String startTimeHour = validate.getStartTime().split(":")[0];
		String startTimeMin = validate.getStartTime().split(":")[1].split(" ")[0];
		String startTimeDayTime = validate.getStartTime().split(":")[1].split(" ")[1].toLowerCase();
		String endTimeHour = validate.getEndTime().split(":")[0];
		String endTimeMin = validate.getEndTime().split(":")[1].split(" ")[0];
		String endTimeDayTime = validate.getEndTime().split(":")[1].split(" ")[1].toLowerCase();
		LocalTime start = LocalTime.of(Integer.valueOf(startTimeHour) + (startTimeDayTime.equals("pm") ? 12 : 0),
				Integer.valueOf(startTimeMin));
		LocalTime end = LocalTime.of(Integer.valueOf(endTimeHour) + (endTimeDayTime.equals("pm") ? 12 : 0),
				Integer.valueOf(endTimeMin));
		
		// Create a new event for each date (TODO: This can be cleaned up by taking a difference of dates)
		List<LocalDate> dates = new ArrayList<>();
		if (validate.isMonday()) {
			dates.add(weekOfDate);
		}
		if (validate.isTuesday()) {
			dates.add(weekOfDate.plusDays(1));
		}
		if (validate.isWednesday()) {
			dates.add(weekOfDate.plusDays(2));
		}
		if (validate.isThursday()) {
			dates.add(weekOfDate.plusDays(3));
		}
		if (validate.isFriday()) {
			dates.add(weekOfDate.plusDays(4));
		}
		if (validate.isSaturday()) {
			dates.add(weekOfDate.plusDays(5));
		}
		if (validate.isSunday()) {
			dates.add(weekOfDate.plusDays(6));
		}
		List<CalendarEvent> events = new ArrayList<>();
		for (LocalDate date : dates) {
			// Add the event to the user's session
			CalendarEvent event = CalendarEvent.builder().title(validate.getTitle())
					.weekOf(validate.getWeekOf())
					.start(LocalDateTime.of(date, start))
					.end(LocalDateTime.of(date, end))
					.notes(validate.getNotes())
					.build();
			events.add(event);
		}
		
		return events;
	}
}
