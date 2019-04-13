package scheduler.data;

import java.util.List;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Calendar {
	private @Id String id; // Randomly-generated identifier for this calendar
	private String name; // The name of this calendar
	private String ownerEmail; // The email address of the user who created this calendar
	private List<String> editorEmails; // All users who are allowed to edit this calendar
	private List<CalendarEvent> events; // All the events on this calendar
	
	@Builder
	public Calendar(String name, String ownerEmail, List<String> editorEmails, List<CalendarEvent> events) {
		id = RandomStringUtils.randomAlphanumeric(16);
		this.name = name;
		this.ownerEmail = ownerEmail;
		this.editorEmails = editorEmails;
		this.events = events;
	}
}
