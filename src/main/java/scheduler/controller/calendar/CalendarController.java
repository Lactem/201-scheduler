package scheduler.controller.calendar;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
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
import scheduler.controller.calendar.message.UpdateMessage;
import scheduler.controller.calendar.message.UpdateMessageResponse;
import scheduler.controller.calendar.message.ValidateMessage;
import scheduler.controller.calendar.message.ValidateMessageResponse;
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
		
		// Add a blank calendar object that will be modified and posted after the user edits it
		model.addAttribute("calendar", Calendar.builder().events(new ArrayList<>()).build());
		
		// The user can add multiple events before actually submitting the calendar (thus saving it to the database)
		model.addAttribute("event", CalendarEvent.builder().build());
		webVisitor.setPreCalendarEvents(new ArrayList<>());
		
		// When adding a new event, the user can select from days starting from the next Sunday
		LocalDate nextSunday = LocalDate.now();
		if (nextSunday.getDayOfWeek() != DayOfWeek.SUNDAY) nextSunday = nextSunday.with(TemporalAdjusters.next(DayOfWeek.SUNDAY));
		model.addAttribute("weekOf", LocalDate.now().getMonthValue() + "/" + LocalDate.now().getDayOfMonth() + "/" + LocalDate.now().getYear());
		
		return "create_calendar";
	}
	
	@RequestMapping(value="/calendar/new", method=RequestMethod.POST)
	public String newCalendarPost(@ModelAttribute("webVisitor") WebVisitor webVisitor,
			Calendar calendar,
			Model model) {
		model.addAttribute("webVisitor", webVisitor);
		
		// Only registered users can create a new calendar
		if (!webVisitor.isLoggedIn())
			return "error";
		
		// Don't allow creating a calendar without a name
		if (calendar.getName() == null || calendar.getName().trim().isEmpty())
			return "error";
		
		// Don't allow users to create multiple calendars with the same name
		ResponseEntity<List<Calendar>> userCalendars = restTemplate.exchange(
				"http://localhost:8080/api/calendar/email/" + webVisitor.getUser().getEmail(),
				HttpMethod.GET,
				null,
				new ParameterizedTypeReference<List<Calendar>>(){});
		for (Calendar currentCalendar : userCalendars.getBody()) {
			if (currentCalendar.getName().equalsIgnoreCase(calendar.getName())) return "error";
		}
		
		// Make sure there are no null values (use empty lists instead)
		if (calendar.getEditorEmails() == null) calendar.setEditorEmails(new ArrayList<>());
		if (calendar.getEvents() == null) calendar.setEvents(new ArrayList<>());
		
		// Add in any events that the user created
		calendar.getEvents().addAll(webVisitor.getPreCalendarEvents());
		webVisitor.setPreCalendarEvents(new ArrayList<>());
		
		// TODO: Add in the last event (it wouldn't have been submitted separately yet)
		
		// Save the new calendar
		calendar.setOwnerEmail(webVisitor.getUser().getEmail());
		restTemplate.postForObject("http://localhost:8080/api/calendar/new", calendar, Calendar.class);
		
		return "view_calendar";
	}
	
	@RequestMapping(value="/calendar/new", params={"addEvent"}, method=RequestMethod.POST)
	public String newCalendarAddAnotherEvent(@ModelAttribute("webVisitor") WebVisitor webVisitor,
			Calendar calendar,
			@RequestParam("title") String title,
			@RequestParam("startTime") String startTime,
			@RequestParam("endTime") String endTime,
			@RequestParam("weekOf") String weekOf,
			@RequestParam(name="Sunday", required=false, defaultValue="F") String sunday,
			@RequestParam(name="Monday", required=false, defaultValue="F") String monday,
			@RequestParam(name="Tuesday", required=false, defaultValue="F") String tuesday,
			@RequestParam(name="Wednesday", required=false, defaultValue="F") String wednesday,
			@RequestParam(name="Thursday", required=false, defaultValue="F") String thursday,
			@RequestParam(name="Friday", required=false, defaultValue="F") String friday,
			@RequestParam(name="Saturday", required=false, defaultValue="F") String saturday,
			Model model) {
		model.addAttribute("webVisitor", webVisitor);
		
		// Use the time info to create a LocalDate object for the week the event will occur
		int weekOfMonth = Integer.valueOf(weekOf.split("/")[0]);
		int weekOfDay = Integer.valueOf(weekOf.split("/")[1]);
		int weekOfYear = Integer.valueOf(weekOf.split("/")[2]);
		LocalDate weekOfDate = LocalDate.of(weekOfYear, weekOfMonth, weekOfDay);
		
		// Use the time info to create a LocalTime object for start and end
		String startTimeHour = startTime.split(":")[0];
		String startTimeMin = startTime.split(":")[1].split(" ")[0];
		String startTimeDayTime = startTime.split(":")[1].split(" ")[1].toLowerCase();
		String endTimeHour = endTime.split(":")[0];
		String endTimeMin = endTime.split(":")[1].split(" ")[0];
		String endTimeDayTime = endTime.split(":")[1].split(" ")[1].toLowerCase();
		LocalTime start = LocalTime.of(Integer.valueOf(startTimeHour) + (startTimeDayTime.equals("pm") ? 12 : 0),
				Integer.valueOf(startTimeMin));
		LocalTime end = LocalTime.of(Integer.valueOf(endTimeHour) + (endTimeDayTime.equals("pm") ? 12 : 0),
				Integer.valueOf(endTimeMin));
		
		// Create a new event for each date (TODO: This can be cleaned up by taking a difference of dates)
		List<LocalDate> dates = new ArrayList<>();
		if (sunday.equals("T")) {
			dates.add(weekOfDate);
		}
		if (monday.equals("T")) {
			dates.add(weekOfDate.plusDays(1));
		}
		if (tuesday.equals("T")) {
			dates.add(weekOfDate.plusDays(2));
		}
		if (wednesday.equals("T")) {
			dates.add(weekOfDate.plusDays(3));
		}
		if (thursday.equals("T")) {
			dates.add(weekOfDate.plusDays(4));
		}
		if (friday.equals("T")) {
			dates.add(weekOfDate.plusDays(5));
		}
		if (saturday.equals("T")) {
			dates.add(weekOfDate.plusDays(6));
		}
		for (LocalDate date : dates) {
			// Add the event to the user's session
			CalendarEvent event = CalendarEvent.builder().title(title)
					.start(LocalDateTime.of(date, start))
					.end(LocalDateTime.of(date, end))
					.notes("")
					.build();
			webVisitor.getPreCalendarEvents().add(event);
		}
		
		// Return the "New Calendar" page to allow the user to add more events
		model.addAttribute("calendar", calendar);
		model.addAttribute("weekOf", weekOf);
		model.addAttribute("event", CalendarEvent.builder().build());
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
				
		model.addAttribute("calendars", calendars);
		return "find_calendars";
	}
	
	@RequestMapping(value= "/calendar/view", method=RequestMethod.POST)
	public String viewCalendar(@ModelAttribute("webVisitor") WebVisitor webVisitor,
			@RequestParam("calendarId") String calendarId,
			Model model) {
		model.addAttribute("webVisitor", webVisitor);
		model.addAttribute("calendar", restTemplate.getForObject("http://localhost:8080/api/calendar/id/" + calendarId, Calendar.class));
		
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
		// Use the time info to create a LocalDate object for the week the event will occur
		int weekOfMonth = Integer.valueOf(validate.getWeekOf().split("/")[0]);
		int weekOfDay = Integer.valueOf(validate.getWeekOf().split("/")[1]);
		int weekOfYear = Integer.valueOf(validate.getWeekOf().split("/")[2]);
		LocalDate weekOfDate = LocalDate.of(weekOfYear, weekOfMonth, weekOfDay);
		
		// Use the time info to create a LocalTime object for start and end
		String startTimeHour = validate.getStartTime().split(":")[0];
		String startTimeMin = validate.getStartTime().split(":")[1].split(" ")[0];
		String startTimeDayTime = validate.getStartTime().split(":")[1].split(" ")[1].toLowerCase();
		String endTimeHour = validate.getEndTime().split(":")[0];
		String endTimeMin = validate.getEndTime().split(":")[1].split(" ")[0];
		String endTimeDayTime = validate.getEndTime().split(":")[1].split(" ")[1].toLowerCase();
		LocalTime start = LocalTime.of(Integer.valueOf(startTimeHour) + (startTimeDayTime.equals("pm") ? 12 : 0),
				Integer.valueOf(startTimeMin));
		LocalTime end = LocalTime.of(Integer.valueOf(endTimeHour) + (endTimeDayTime.equals("pm") ? 12 : 0),
				Integer.valueOf(endTimeMin));
		
		// Create a new event for each date (TODO: This can be cleaned up by taking a difference of dates)
		List<LocalDate> dates = new ArrayList<>();
		if (validate.isSunday()) {
			dates.add(weekOfDate);
		}
		if (validate.isMonday()) {
			dates.add(weekOfDate.plusDays(1));
		}
		if (validate.isTuesday()) {
			dates.add(weekOfDate.plusDays(2));
		}
		if (validate.isWednesday()) {
			dates.add(weekOfDate.plusDays(3));
		}
		if (validate.isThursday()) {
			dates.add(weekOfDate.plusDays(4));
		}
		if (validate.isFriday()) {
			dates.add(weekOfDate.plusDays(5));
		}
		if (validate.isSaturday()) {
			dates.add(weekOfDate.plusDays(6));
		}
		List<CalendarEvent> events = new ArrayList<>();
		for (LocalDate date : dates) {
			// Add the event to the user's session
			CalendarEvent event = CalendarEvent.builder().title(validate.getTitle())
					.start(LocalDateTime.of(date, start))
					.end(LocalDateTime.of(date, end))
					.notes(validate.getNotes())
					.build();
			events.add(event);
		}
		return new ValidateMessageResponse(events);
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
		System.out.println("updating calendar with id: " + changes.getCalendarId());
		Calendar calendar = restTemplate.getForObject("http://localhost:8080/api/calendar/id/" + changes.getCalendarId(), Calendar.class);
		System.out.println("fetched the calendar to update: " + calendar);
		calendar.setEvents(new ArrayList<>());
		// TODO: Handle conflicts - decide if the changes are accepted or rejected
		restTemplate.put("http://localhost:8080/api/calendar/updateEvents/" + calendar.getId(), changes.getUpdatedEvents());
		return new UpdateMessageResponse(calendar);
		// TODO: Make sure everyone subscribed to topic/calendarChanges gets this update and modifies their page
	}
}
