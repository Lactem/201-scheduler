package scheduler;

import java.util.List;
import java.util.UUID;

import lombok.Getter;
import lombok.Setter;
import scheduler.data.Calendar;
import scheduler.data.CalendarEvent;
import scheduler.data.User;

public class WebVisitor {
	private final @Getter UUID id;
	private @Getter @Setter User user;
	
	// Allow the user to create a calendar without logging in
	@Getter @Setter
	private Calendar guestCalendar;
	
	// A list of events the user is creating before they're saved to a calendar
	@Getter @Setter
	private List<CalendarEvent> preCalendarEvents;
	
	public WebVisitor() {
		id = UUID.randomUUID();
	}
	
	public boolean isLoggedIn() {
		return user != null;
	}
}
