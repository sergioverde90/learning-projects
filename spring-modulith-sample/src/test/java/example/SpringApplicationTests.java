package example;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.modulith.docs.Documenter;
import org.springframework.modulith.model.ApplicationModules;

@SpringBootTest
class SpringApplicationTests {

	@Test
	void contextLoads() {
		var modules = ApplicationModules.of(SpringApplication.class);
		modules.forEach(System.out::println);

		new Documenter(modules)
				.writeModulesAsPlantUml()
				.writeIndividualModulesAsPlantUml();

		ApplicationModules.of(SpringApplication.class).verify();

	}

}
