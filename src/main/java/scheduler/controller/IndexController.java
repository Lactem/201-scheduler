package scheduler.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.SessionAttributes;

import scheduler.WebVisitor;

/**
 * Provides routing information to direct the user to the homepage (index.html).
 */
@Controller
@SessionAttributes("webVisitor")
public class IndexController {
	
	@RequestMapping({"/", "home", "index"})
	public String homepage(@RequestParam(name="name", required=false, defaultValue="User") String name,
			@ModelAttribute("webVisitor") WebVisitor webVisitor,
			Model model) {
		model.addAttribute("name", name); // Add the "name" attribute if it's specified, or use a default value of "User"
		model.addAttribute("webVisitor", webVisitor);
		return "index"; // Direct to index.html
	}
	
	// Creates a new user when navigating to the site for the first time without any JSESSIONID cookie
	@ModelAttribute("webVisitor")
	public WebVisitor getWebVisitor() {
		return new WebVisitor();
	}
}
