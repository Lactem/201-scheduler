package scheduler.controller.find;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.SessionAttributes;

import scheduler.WebVisitor;

/**
 * Provides routing information to direct the user to calendar search results (find_calendars.html).
 */
@Controller
@SessionAttributes("webVisitor")
public class FindController {
	
	// The user will be directed to /error if they don't have a WebVisitor object
	@RequestMapping("/find")
	public String findCalendars(@ModelAttribute("webVisitor") WebVisitor webVisitor,
			Model model) {
		model.addAttribute("webVisitor", webVisitor);
		return "find_calendars"; // Direct to find_calendars.html
	}

}
