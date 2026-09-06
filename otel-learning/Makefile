.PHONY: spin-up

spin-up:
	./mvnw clean package
	docker-compose up
	java -jar -javaagent:./opentelemetry-javaagent.jar target/otel-learning-0.0.1-SNAPSHOT.jar
