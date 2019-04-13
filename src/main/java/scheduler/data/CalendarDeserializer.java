package scheduler.data;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.ObjectCodec;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

public class CalendarDeserializer extends JsonDeserializer<Calendar> {

	@Override
	public Calendar deserialize(JsonParser parser, DeserializationContext ctxt) throws IOException, JsonProcessingException {
		System.out.println("using customer deserializer on Calendar...");
		ObjectCodec codec = parser.getCodec();
		System.out.println("PRINTING JSON:");
		System.out.println(parser.getCurrentLocation().getSourceRef());
		JsonNode node = codec.readTree(parser);
		String id = node.get("id").asText();
		String name = node.get("name").asText();
		String ownerEmail = node.get("ownerEmail").asText();
		System.out.println("parsed id: " + id);
		return new Calendar(id, name, ownerEmail, null, null);
	}

}
