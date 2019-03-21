package scheduler;

import java.util.UUID;

import scheduler.data.Calendar;
import scheduler.data.User;

public class WebVisitor {
	private final UUID id;
	private User user;
	private Calendar guestCalendar; // Allow the user to create a calendar without logging on
	
	public WebVisitor() {
		id = UUID.randomUUID();
	}
	
	public UUID getId() {
		return id;
	}
	
	public User getUser() {
		return user;
	}
	
	public void setUser(User user) {
		this.user = user;
	}
	
	public boolean isLoggedIn() {
		return user != null;
	}
	
	public Calendar getGuestCalendar() {
		return guestCalendar;
	}
	
	public void setGuestCalendar(Calendar guestCalendar) {
		this.guestCalendar = guestCalendar;
	}
}
