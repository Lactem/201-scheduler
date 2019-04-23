package scheduler.controller.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import scheduler.WebVisitor;
import scheduler.data.User;
import scheduler.service.RoutingService;

@Controller
@SessionAttributes("webVisitor")
public class UserController {
	
	@Autowired
	private RestTemplate restTemplate;
	
	@Autowired
	private RoutingService routingService;

	/**
	 * Attempts to register (create) a new user.
	 * 
	 * @param email The email address that is logging in
	 * @param password The password that is logging in
	 * 
	 * @return The homepage, with an error message if applicable.
	 */
	@RequestMapping(value="/user/register", method=RequestMethod.POST)
	public String register(@RequestParam(name="email", required=true) String email,
			@RequestParam(name="password", required=true) String password,
			@RequestParam(name="confirmPassword", required=true) String confirmPassword,
			@ModelAttribute("webVisitor") WebVisitor webVisitor,
			Model model) {
		model.addAttribute("registerEmail", email);
		model.addAttribute("webVisitor", webVisitor);
		
		// Verify that the email address doesn't already exist
		try {
			restTemplate.getForObject(routingService.getRoute() + "/api/user/" + email, User.class);
			model.addAttribute("registerErr", "That email address is already associated with an account.");
			return "redirect:/index";
		} catch (HttpClientErrorException.NotFound ignored) {}
		
		// Verify that the password isn't empty
		if (password.trim().isEmpty()) {
			model.addAttribute("registerErr", "Password is too short.");
			return "redirect:/index";
		}
		
		// Verify that the password matches
		if (!password.equals(confirmPassword)) {
			model.addAttribute("registerErr", "Passwords don't match.");
			return "redirect:/index";
		}
		
		// Create a new user
		User user = new User(email, password);
		user = restTemplate.postForObject(routingService.getRoute() + "/api/user", user, User.class);
		
		// Log the user in
		webVisitor.setUser(user);
		
		// If the user had a guest Calendar previously, it can now be saved permanently
		if (webVisitor.getGuestCalendarId() != null && !webVisitor.getGuestCalendarId().trim().isEmpty()) {
			restTemplate.put(routingService.getRoute() + "/api/calendar/updateOwner/" + webVisitor.getGuestCalendarId(), email);
			webVisitor.setGuestCalendarId(null);
		}
		
		return "redirect:/index";
	}
	
	/**
	 * Attempts to log a user in.
	 * 
	 * @param email The email address that is logging in
	 * @param password The password that is logging in
	 * 
	 * @return The homepage, with an error message if applicable.
	 */
	@RequestMapping(value="/user/login", method=RequestMethod.POST)
	public String login(@RequestParam(name="email", required=true) String email,
			@RequestParam(name="password", required=true) String password,
			@ModelAttribute("webVisitor") WebVisitor webVisitor,
			Model model) {
		model.addAttribute("loginEmail", email);
		model.addAttribute("webVisitor", webVisitor);
		
		// Verify that the email address corresponds to an actual user
		User user;
		try {
			user = restTemplate.getForObject(routingService.getRoute() + "/api/user/" + email, User.class);
		} catch (HttpClientErrorException.NotFound userNotFoundEx) {
			model.addAttribute("loginErr", "No account associated with that email address exists.");
			return "redirect:/index";
		}
		
		// Verify that the password matches
		if (!user.getPassword().equals(password)) {
			model.addAttribute("loginErr", "Incorrect password.");
			return "redirect:/index";
		}
		
		// Log the user in
		webVisitor.setUser(user);
		
		return "redirect:/index";
	}
	
	// Creates a new user when logging in without any JSESSIONID cookie
	@ModelAttribute("webVisitor")
	public WebVisitor getWebVisitor() {
		return new WebVisitor();
	}
}
