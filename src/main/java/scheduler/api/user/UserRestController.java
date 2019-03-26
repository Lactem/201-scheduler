package scheduler.api.user;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import scheduler.data.User;
import scheduler.data.UserRepository;

/**
 * Handles REST API for the /api/user endpoint.
 * Does not display any view data - only JSON.
 */
@RestController
public class UserRestController {
	
	private final UserRepository userRepo;
	
	// The RestController annotation injects UserRepository into this constructor
	UserRestController(UserRepository userRepo) {
		this.userRepo = userRepo;
	}
    
	/**
	 * Finds a user by their email address, or
	 * throws an exception if no user exists with that email.
	 */
	@GetMapping("/api/user/{email}")
	User findUser(@PathVariable String email) {
		return userRepo.findById(email)
				.orElseThrow(() -> new UserNotFoundException(email));
	}
	
	/**
	 *  Creates a new user.
	 */
	@PostMapping("/api/user")
	User createUser(@RequestBody User newUser) {
		return userRepo.save(newUser);
	}
}
