.PHONY: help elastic-up elastic-down elastic-logs elastic-restart observability-up observability-down all-up all-down

help:
	@echo "Available commands:"
	@echo "  make pip3-install        - Install pip3 (pip)"
	@echo "  make elastic-up          - Start Elasticsearch stack (es, es2, kibana)"
	@echo "  make elastic-down        - Stop Elasticsearch stack"
	@echo "  make elastic-logs        - View logs for Elasticsearch stack"
	@echo "  make elastic-restart     - Restart Elasticsearch stack"
	@echo "  make observability-up    - Start observability stack (jaeger, otelcol, prometheus)"
	@echo "  make observability-down  - Stop observability stack"
	@echo "  make all-up              - Start all services"
	@echo "  make all-down            - Stop all services"

# Elasticsearch stack commands (dedicated compose file)
elastic-up:
	docker compose -f docker-compose.elasticsearch.yaml up -d

elastic-down:
	docker compose -f docker-compose.elasticsearch.yaml down

elastic-logs:
	docker compose -f docker-compose.elasticsearch.yaml logs -f

elastic-restart:
	docker compose -f docker-compose.elasticsearch.yaml restart

# Observability stack commands (jaeger + prometheus)
observability-up:
	docker compose -f docker-compose.yaml up -d

observability-down:
	docker compose -f docker-compose.yaml down

# All services commands (both stacks)
all-up:
	docker compose -f docker-compose.yaml -f docker-compose.elasticsearch.yaml up -d

all-down:
	docker compose -f docker-compose.yaml -f docker-compose.elasticsearch.yaml down
