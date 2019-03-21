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

@Controller
@SessionAttributes("webVisitor")
public class UserController {
	
	@Autowired
	private RestTemplate restTemplate;
	
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
		model.addAttribute("webVisitor", webVisitor);
		
		// Verify that the email address corresponds to an actual user
		User user;
		try {
			user = restTemplate.getForObject("http://localhost:8080/api/user/" + email, User.class);
		} catch (HttpClientErrorException.NotFound userNotFoundEx) {
			model.addAttribute("loginErr", "No account associated with that email address exists.");
			return "index";
		}
		
		// Verify that the password matches
		if (!user.getPassword().equals(password)) {
			model.addAttribute("loginErr", "Incorrect password.");
			return "index";
		}
		
		// Log the user in
		webVisitor.setUser(user);
		
		return "index";
	}
	
	// Creates a new user when logging in without any JSESSIONID cookie
	@ModelAttribute("webVisitor")
	public WebVisitor getWebVisitor() {
		return new WebVisitor();
	}
}
