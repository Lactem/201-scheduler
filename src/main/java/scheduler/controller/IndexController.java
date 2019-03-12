package scheduler.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Provides routing information to direct the user to the homepage (index.html).
 */
@Controller
public class IndexController {
	
	@RequestMapping({"/", "home", "index"})
	public String homepage(@RequestParam(name="name", required=false, defaultValue="User") String name,
			Model model) {
		model.addAttribute("name", name); // Add the "name" attribute if it's specified, or use a default value of "User"
		return "index"; // Direct to index.html
	}
	
}
