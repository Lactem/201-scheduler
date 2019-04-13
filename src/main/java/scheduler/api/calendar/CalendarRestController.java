package scheduler.api.calendar;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import scheduler.data.Calendar;
import scheduler.data.CalendarEvent;
import scheduler.data.CalendarRepository;

/**
 * Handles REST API for the /api/calendar endpoint.
 * Does not display any view data - only JSON.
 */
@RestController
public class CalendarRestController {
	
	private final CalendarRepository calendarRepo;
	
	// The RestController annotation injects CalendarRepository into this constructor
	CalendarRestController(CalendarRepository calendarRepo) {
		this.calendarRepo = calendarRepo;
	}
    
	/**
	 * Finds a list of calendars by their email address of the user who owns them.
	 */
	@GetMapping("/api/calendar/email/{ownerEmail}")
	List<Calendar> findCalendars(@PathVariable String ownerEmail) {
		return calendarRepo.findAll().stream()
				.filter(calendar -> calendar != null && calendar.getOwnerEmail() != null && calendar.getOwnerEmail().equals(ownerEmail))
				.collect(Collectors.toList());
	}
	
	/**
	 * Finds a a calendar by its id.
	 */
	@GetMapping("/api/calendar/id/{id}")
	Calendar findCalendar(@PathVariable String id) {
		return calendarRepo.findAll().stream()
				.filter(calendar -> calendar != null && calendar.getId().equals(id))
				.findFirst().get();
	}
	
	/**
	 *  Creates a new calendar.
	 */
	@PostMapping("/api/calendar/new")
	Calendar createCalendar(@RequestBody Calendar newCalendar) {
		return calendarRepo.save(newCalendar);
	}
	
	/**
	 * Updates the list of users who are allowed to edit a calendar with the given identifier.
	 */
	@PutMapping("/api/calendar/updateEditors/{id}")
	Optional<Calendar> updateEditors(@RequestBody List<String> editorEmails, @PathVariable String id) {
		
		return calendarRepo.findById(id)
			.map(calendar -> {
				calendar.setEditorEmails(editorEmails);
				return calendarRepo.save(calendar);
			});
	}
	
	/**
	 * Updates the list of events in a calendar with the given identifier.
	 */
	@PutMapping("/api/calendar/updateEvents/{id}")
	Optional<Calendar> updateEvents(@RequestBody List<CalendarEvent> events, @PathVariable String id) {
		
		return calendarRepo.findById(id)
			.map(calendar -> {
				calendar.setEvents(events);
				return calendarRepo.save(calendar);
			});
	}
}
