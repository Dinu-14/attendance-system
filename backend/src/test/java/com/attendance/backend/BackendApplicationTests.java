package com.attendance.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test") // Add this annotation
class BackendApplicationTests {

	@Test
	void contextLoads() {
		// Test will pass if application context loads
	}
}