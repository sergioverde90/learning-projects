.PHONY: help elastic-up elastic-down elastic-logs elastic-restart observability-up observability-down all-up all-down

help:
	@echo "Available commands:"
	@echo "  make elastic-up          - Start Elasticsearch stack (es, es2, kibana)"
	@echo "  make elastic-down        - Stop Elasticsearch stack"
	@echo "  make elastic-logs        - View logs for Elasticsearch stack"
	@echo "  make elastic-restart     - Restart Elasticsearch stack"
	@echo "  make observability-up    - Start observability stack (jaeger, otelcol, prometheus)"
	@echo "  make observability-down  - Stop observability stack"
	@echo "  make all-up              - Start all services"
	@echo "  make all-down            - Stop all services"

# Elasticsearch stack commands
elastic-up:
	docker-compose --profile elasticsearch up -d

elastic-down:
	docker-compose --profile elasticsearch down

elastic-logs:
	docker-compose --profile elasticsearch logs -f

elastic-restart:
	docker-compose --profile elasticsearch restart

# Observability stack commands
observability-up:
	docker-compose up -d jaeger otelcol prometheus

observability-down:
	docker-compose stop jaeger otelcol prometheus

# All services commands
all-up:
	docker-compose --profile elasticsearch up -d

all-down:
	docker-compose down
