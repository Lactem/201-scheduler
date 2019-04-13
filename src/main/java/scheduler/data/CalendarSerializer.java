package scheduler.data;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

public class CalendarSerializer extends JsonSerializer<Calendar> {

	@Override
	public void serialize(Calendar calendar, JsonGenerator jgen, SerializerProvider serializers) throws IOException {
		calendar.getId().toString();
	}

}
