package scheduler.controller;

import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.client.RestTemplate;

import scheduler.WebVisitor;
import scheduler.data.Calendar;
import scheduler.service.RoutingService;

/**
 * Provides routing information to direct the user to the homepage (index.html).
 */
@Controller
@SessionAttributes("webVisitor")
public class IndexController {
	
	@Autowired
	private RestTemplate restTemplate;
	
	@Autowired
	private RoutingService routingService;
	
	@RequestMapping({"/", "home", "index"})
	public String homepage(@ModelAttribute("webVisitor") WebVisitor webVisitor,
			Model model, HttpServletRequest request) {
		model.addAttribute("webVisitor", webVisitor);
		model.addAttribute("ROUTE", "http://" + request.getRequestURL().substring("http://".length()).split("/")[0]);
		
		return "index"; // Direct to index.html
	}
	
	@RequestMapping(value="/editDemo", method=RequestMethod.GET)
	public String editDemo(@ModelAttribute("webVisitor") WebVisitor webVisitor,
			Model model, HttpServletRequest request) {
		model.addAttribute("webVisitor", webVisitor);
		model.addAttribute("ROUTE", "http://" + request.getRequestURL().substring("http://".length()).split("/")[0]);
		
		// Prepopulate the guest calendar with some data
		Calendar calendar;
		if (webVisitor.getGuestCalendarId() == null || webVisitor.getGuestCalendarId().trim().isEmpty()) {
			calendar = new Calendar();
			calendar.setId("guest_" + RandomStringUtils.randomAlphanumeric(16));
			calendar.setName("Demo Calendar");
			calendar.setEditorEmails(new ArrayList<>());
			calendar.setEvents(new ArrayList<>());
			restTemplate.postForObject(routingService.getRoute() + "/api/calendar/new", calendar, Calendar.class);
		} else {
			calendar = restTemplate.getForObject(routingService.getRoute() + "/api/calendar/id/" + webVisitor.getGuestCalendarId(), Calendar.class);
		}
		
		model.addAttribute("guestCalendar", calendar);
		
		return "demo_edit"; //Direct to demo_edit.html
	}
	
	// Creates a new user when navigating to the site for the first time without any JSESSIONID cookie
	@ModelAttribute("webVisitor")
	public WebVisitor getWebVisitor() {
		return new WebVisitor();
	}
}
