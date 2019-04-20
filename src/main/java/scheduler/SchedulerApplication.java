package scheduler;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

/**
 * 201-scheduler Spring Boot Application - automatically loads other classes
 */
@SpringBootApplication
public class SchedulerApplication {
	// The start of the fully-qualified URI to make REST calls to.
	public static String HOST = "http://localhost:8080";

	public static void main(String[] args) {
		SpringApplication.run(SchedulerApplication.class, args);
	}
	
	@Bean
	public RestTemplate restTemplate(RestTemplateBuilder builder) {
		return builder.build();
	}
}
