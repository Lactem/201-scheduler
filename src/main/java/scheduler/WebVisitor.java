package scheduler;

import java.util.UUID;

import lombok.Getter;
import lombok.Setter;
import scheduler.data.User;

public class WebVisitor {
	private final @Getter UUID id;
	private @Getter @Setter User user;
	
	// Allow the user to create a calendar without logging in
	@Getter @Setter
	private String guestCalendarId;
	
	public WebVisitor() {
		id = UUID.randomUUID();
	}
	
	public boolean isLoggedIn() {
		return user != null;
	}
}
