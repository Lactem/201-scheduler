package scheduler.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Service that provides routing information.
 * Other classes use this info to direct their REST calls to a configurable host/port.
 */
@Service
public class RoutingService {
	private final int port;
	
	// Gets server.port from application.properties
	@Autowired
	public RoutingService(@Value("${server.port}") int port) {
		this.port = port;
	}
	
	/**
	 * @return The start of the fully-qualified URI to make REST calls to.
	 */
	public String getRoute() {
		return getHost() + ":" + getPort();
	}
	
	public String getHost() {
		return "http://localhost";
	}
	
	public int getPort() {
		return port;
	}
}
