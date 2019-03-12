package scheduler;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.test.context.junit4.SpringRunner;

import scheduler.data.User;
import scheduler.data.UserRepository;

/**
 * Class for tests. Currently used to demonstrate some database methods.
 * Might be used later for unit or integration tests.
 */
@RunWith(SpringRunner.class)
@SpringBootTest
public class ExampleTests {
	
	@Autowired UserRepository userRepo;
	@Autowired MongoOperations mongoOperations;

	User testUser;
	
	@Test
	public void contextLoads() {
		// Add a test user to the database
		testUser = userRepo.save(new User("milie@usc.edu", "password"));
		
		// Change a different user's password (or create the user if they didn't exist)
		Query query = new Query();
		query.addCriteria(Criteria.where("email").is("tilie@usc.edu"));
		Update update = new Update();
		update.set("password", "newpassword3");
		mongoOperations.upsert(query, update, User.class);
	}

}
