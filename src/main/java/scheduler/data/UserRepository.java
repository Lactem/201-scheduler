package scheduler.data;

import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * The repository for User objects - with a String (their email address) as their identifier.
 * Spring automatically gives us standard queries when it sees this interface.
 */
public interface UserRepository extends MongoRepository<User, String> {

}
