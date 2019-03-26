package scheduler.data;

import java.util.ArrayList;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import lombok.extern.slf4j.Slf4j;

/**
 * Spring automatically calls all CommandLineRunner beans when it starts up.
 * These CommandLineRunner beans populate the database with a user and a calendar.
 */
@Configuration
@Slf4j
public class LoadDatabase {

	@Bean
	CommandLineRunner populateUserDatabase(UserRepository repo) {
		return args -> {
			log.info("Preloading " + repo.save(new User("ttrojan@usc.edu", "password")));
		};
	}
	
	@Bean
	CommandLineRunner populateCalendarDatabase(CalendarRepository repo) {
		return args -> {
			log.info("Preloading " + repo.save(new Calendar("School", "ttrojan@usc.edu", new ArrayList<>(), new ArrayList<>())));
		};
	}
	
}
