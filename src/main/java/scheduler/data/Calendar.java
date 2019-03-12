package scheduler.data;

import java.math.BigInteger;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Document
@Data
public class Calendar {
	private @Id BigInteger id; // Randomly-generated identifier for this calendar
	private String ownerEmail; // The email address of the user who created this calendar
	private List<String> editorEmails; // All users who are allowed to edit this calendar
	private List<CalendarEvent> events; // All the events on this calendar
	
	public Calendar(String ownerEmail, List<String> editorEmails, List<CalendarEvent> events) {
		this.ownerEmail = ownerEmail;
		this.editorEmails = editorEmails;
		this.events = events;
	}
}
