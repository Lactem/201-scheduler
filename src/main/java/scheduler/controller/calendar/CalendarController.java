package scheduler.controller.calendar;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.client.RestTemplate;

import scheduler.WebVisitor;
import scheduler.controller.calendar.message.CreateMessage;
import scheduler.controller.calendar.message.CreateMessageResponse;
import scheduler.controller.calendar.message.FindMessageResponse;
import scheduler.controller.calendar.message.UpdateMessage;
import scheduler.controller.calendar.message.UpdateMessageResponse;
import scheduler.controller.calendar.message.ValidateMessage;
import scheduler.controller.calendar.message.ValidateMessageResponse;
import scheduler.controller.calendar.message.ViewMessage;
import scheduler.controller.calendar.message.ViewMessageResponse;
import scheduler.data.Calendar;
import scheduler.data.CalendarEvent;

/**
 * /calendar/new: Creating a new calendar (create_calendar.html).
 * /calendar/find: Searching for a calendar (find_calendars.html).
 * /calendar/view: Viewing a calendar's details (view_calendar.html).
 * /calendar/edit: Editing a calendar (edit_calendar.html).
 * 
 * For all of these pages, the user will be directed to /error if they don't have a WebVisitor object.
 */
@Controller
@SessionAttributes("webVisitor")
public class CalendarController {
	
	@Autowired
	private RestTemplate restTemplate;
	
	@RequestMapping(value="/calendar/new", method=RequestMethod.GET)
	public String newCalendarGet(@ModelAttribute("webVisitor") WebVisitor webVisitor, Model model) {
		model.addAttribute("webVisitor", webVisitor);
		
		return "create_calendar";
	}
	
	@RequestMapping("/calendar/find")
	public String findCalendars(@ModelAttribute("webVisitor") WebVisitor webVisitor,
			@RequestParam(name="calendarName", required=false, defaultValue="") String calendarName,
			Model model) {
		model.addAttribute("webVisitor", webVisitor);
		
		List<Calendar> calendars = new ArrayList<>();
		// If no calendar name is specified, return all of the calendars that this user has created
		// TODO: Return calendars that have been shared with this user, too
		if (calendarName.trim().isEmpty()) {
			ResponseEntity<List<Calendar>> userCalendars = restTemplate.exchange(
					"http://localhost:8080/api/calendar/email/" + webVisitor.getUser().getEmail(),
					HttpMethod.GET,
					null,
					new ParameterizedTypeReference<List<Calendar>>(){});
			if (userCalendars.getBody() != null) calendars.addAll(userCalendars.getBody());
		} else {
			// TODO: Add search functionality
		}
				
		model.addAttribute("allCalendars", calendars);
		return "find_calendars";
	}
	
	@RequestMapping(value= "/calendar/view", method=RequestMethod.POST)
	public String viewCalendar(@ModelAttribute("webVisitor") WebVisitor webVisitor,
			@RequestParam("calendarId") String calendarId,
			Model model) {
		model.addAttribute("webVisitor", webVisitor);
		model.addAttribute("viewedCalendar", restTemplate.getForObject("http://localhost:8080/api/calendar/id/" + calendarId, Calendar.class));
		ResponseEntity<List<Calendar>> userCalendars = restTemplate.exchange(
				"http://localhost:8080/api/calendar/email/" + webVisitor.getUser().getEmail(),
				HttpMethod.GET,
				null,
				new ParameterizedTypeReference<List<Calendar>>(){});
		model.addAttribute("allCalendars", userCalendars.getBody());
		
		return "view_calendar";
	}
	
	@RequestMapping(value= "/calendar/edit", method=RequestMethod.POST)
	public String editCalendar(@ModelAttribute("webVisitor") WebVisitor webVisitor,
			@RequestParam("calendarId") String calendarId,
			Model model) {
		model.addAttribute("webVisitor", webVisitor);
		model.addAttribute("calendar", restTemplate.getForObject("http://localhost:8080/api/calendar/id/" + calendarId, Calendar.class));
		
		return "edit_calendar";
	}
	
	/**
	 * Listens for a STOMP message to validate a calendar event.
	 */
	@MessageMapping("/calendar/validate")
	@SendTo("/topic/calendarValidateResponse")
	public ValidateMessageResponse validateEvent(ValidateMessage validate) {
		return new ValidateMessageResponse(ValidateMessage.toEvents(validate));
	}
	
	/**
	 * Listens for a STOMP message to create a new calendar.
	 */
	@MessageMapping("/calendar/create")
	@SendTo("/topic/calendarCreateResponse")
	public CreateMessageResponse createCalendar(CreateMessage create) {
		// Create a new calendar
		Calendar calendar = new Calendar();
		calendar.setName(create.getName());
		calendar.setOwnerEmail(create.getOwnerEmail());
		calendar.setEvents(create.getEvents());
		calendar.setEditorEmails(new ArrayList<>());
		
		// Save the new calendar
		calendar = restTemplate.postForObject("http://localhost:8080/api/calendar/new", calendar, Calendar.class);
		
		return new CreateMessageResponse(calendar.getId(), "OK");
	}
	
	/**
	 * Listens for a STOMP message to edit a calendar by saving its list of events (other info can't be edited).
	 */
	@MessageMapping("/calendar/submitChanges")
	@SendTo("/topic/calendarChanges")
	public UpdateMessageResponse submitChanges(UpdateMessage changes) {
		Calendar calendar = restTemplate.getForObject("http://localhost:8080/api/calendar/id/" + changes.getCalendarId(), Calendar.class);
		
		// Remove the edited event (an "edited index" of -1 represents adding a new event)
		if (changes.getEditedEventIndex() != -1) calendar.getEvents().remove(changes.getEditedEventIndex());
		
		if (!changes.isRemove()) calendar.getEvents().addAll(ValidateMessage.toEvents(changes.getEditedEvent()));
		
		// TODO: Handle conflicts - decide if the changes are accepted or rejected
		restTemplate.put("http://localhost:8080/api/calendar/updateEvents/" + calendar.getId(), calendar.getEvents());
		return new UpdateMessageResponse(calendar);
	}
	
	/**
	 * Listens for a STOMP message requesting a list of events for a given week.
	 */
	@MessageMapping("/calendar/viewWeek")
	@SendTo("/topic/viewWeek")
	public ViewMessageResponse viewEvents(ViewMessage message) {
		List<CalendarEvent> events = new ArrayList<>();
		LocalDateTime weekStart = ValidateMessage.strToDate(message.getWeekOf()).atStartOfDay();
		LocalDateTime weekEnd = weekStart.plusDays(7);
		
		// Get the events for the week for each calendar requested
		for (String calendarId : message.getCalendarIds()) {
			Calendar calendar = restTemplate.getForObject("http://localhost:8080/api/calendar/id/" + calendarId, Calendar.class);
			for (CalendarEvent event : calendar.getEvents()) {
				if (event.getStart().isAfter(weekStart) && event.getStart().isBefore(weekEnd)) {
					events.add(event);
				}
			}
		}
		
		return new ViewMessageResponse(events);
	}
	
	@MessageMapping("/calendar/conflicts")
	@SendTo("/topic/conflicts")
	public FindMessageResponse findConflicts(FindMessage message) {
		List<CalendarEvent> events = new ArrayList<>();
		// Get the events for the week for each calendar requested
		for (String calendarId : message.getCalendarIds()) {
			Calendar calendar = restTemplate.getForObject("http://localhost:8080/api/calendar/id/" + calendarId, Calendar.class);
			for (CalendarEvent event : calendar.getEvents()) {
				//for(CalnedarEvent event2 : calendar)
				events.add(event);
			}
		}
		
		List<CalendarEvent> conflicts = new ArrayList<>();
		for(int i = 0; i < events.size()-1; i++) {
			CalendarEvent firstEvent = events.get(i);
			for(int j = i+1; j < events.size(); j++) {
				CalendarEvent secondEvent = events.get(j);
				if(firstEvent.getStart().isBefore(secondEvent.getEnd()) && firstEvent.getEnd().isAfter(secondEvent.getStart())) {
					conflicts.add(firstEvent);
					conflicts.add(secondEvent);
					//adds both of them so that when displaying we know that every two is a conflict and those can then be displayed together
				}
			}
		}
		
		return new FindMessageResponse(conflicts);
	}
}
