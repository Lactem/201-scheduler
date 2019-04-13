package scheduler.data;

import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * The repository for Calendar objects - with a randomly-generated String as their identifier.
 * Spring automatically gives us standard queries when it sees this interface.
 */
public interface CalendarRepository extends MongoRepository<Calendar, String> {
	
}
