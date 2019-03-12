package scheduler.controller.user;

public class UserNotFoundException extends RuntimeException {
	private static final long serialVersionUID = 1L;

	UserNotFoundException(String email) {
		super("Could not find user with email address: " + email);
	}
}