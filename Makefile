.PHONY: help dev prod local up down logs ps build restart clean generate-compose status local-down local-logs logs-promtail

# Load .env
include .env
export

# Color output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
MAGENTA := \033[0;35m
NC := \033[0m # No Color

# Determine environment
ifeq ($(SPRING_PROFILES_ACTIVE),prod)
	ENV := prod
	ENV_COLOR := $(RED)
else
	ENV := dev
	ENV_COLOR := $(CYAN)
endif

# Docker compose command using generated config
# First generate docker-compose.yml, then use it
COMPOSE_CMD := bash scripts/generate-compose.sh > docker-compose.yml && docker compose
COMPOSE_LOCAL_CMD := bash scripts/generate-compose.sh --local > docker-compose.yml && docker compose

help:
	@echo "$(CYAN)╔════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║   Elegant Tex - Docker Compose Helper  ║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Current Environment:$(NC) $(ENV_COLOR)$(ENV)$(NC) (SPRING_PROFILES_ACTIVE=$(SPRING_PROFILES_ACTIVE))"
	@echo ""
	@echo "$(GREEN)Usage:$(NC)"
	@echo "  $(CYAN)make dev$(NC)            - Switch to development mode (full Docker)"
	@echo "  $(CYAN)make prod$(NC)           - Switch to production mode"
	@echo "  $(MAGENTA)make local$(NC)          - Start infrastructure only (run app locally)"
	@echo "  $(CYAN)make up$(NC)             - Start services (generates compose from env)"
	@echo "  $(CYAN)make down$(NC)           - Stop services"
	@echo "  $(CYAN)make ps$(NC)             - List running services"
	@echo "  $(CYAN)make logs$(NC)           - Tail service logs"
	@echo "  $(CYAN)make logs-app$(NC)       - Tail app logs only"
	@echo "  $(CYAN)make logs-nginx$(NC)     - Tail nginx logs"
	@echo "  $(CYAN)make logs-grafana$(NC)   - Tail grafana logs"
	@echo "  $(CYAN)make logs-promtail$(NC)  - Tail promtail logs"
	@echo "  $(MAGENTA)make local-down$(NC)     - Stop local infrastructure"
	@echo "  $(MAGENTA)make local-logs$(NC)     - View local infrastructure logs"
	@echo "  $(CYAN)make build$(NC)          - Build app image"
	@echo "  $(CYAN)make restart$(NC)        - Restart all services"
	@echo "  $(CYAN)make clean$(NC)          - Stop and remove all containers"
	@echo "  $(CYAN)make generate-compose$(NC) - Show generated docker-compose.yml"
	@echo "  $(CYAN)make status$(NC)         - Show current configuration"
	@echo ""

dev:
	@echo "$(GREEN)Switching to DEVELOPMENT environment...$(NC)"
	@if [ "$$(uname)" = "Darwin" ]; then \
		sed -i '' 's/^SPRING_PROFILES_ACTIVE=.*/SPRING_PROFILES_ACTIVE=dev/' .env; \
	else \
		sed -i 's/^SPRING_PROFILES_ACTIVE=.*/SPRING_PROFILES_ACTIVE=dev/' .env; \
	fi
	@echo "$(GREEN)✓ Set SPRING_PROFILES_ACTIVE=dev in .env$(NC)"

prod:
	@echo "$(GREEN)Switching to PRODUCTION environment...$(NC)"
	@if [ "$$(uname)" = "Darwin" ]; then \
		sed -i '' 's/^SPRING_PROFILES_ACTIVE=.*/SPRING_PROFILES_ACTIVE=prod/' .env; \
	else \
		sed -i 's/^SPRING_PROFILES_ACTIVE=.*/SPRING_PROFILES_ACTIVE=prod/' .env; \
	fi
	@echo "$(GREEN)✓ Set SPRING_PROFILES_ACTIVE=prod in .env$(NC)"

local:
	@echo "$(MAGENTA)╔════════════════════════════════════════╗$(NC)"
	@echo "$(MAGENTA)║     Starting Local Development Mode    ║$(NC)"
	@echo "$(MAGENTA)╚════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Setting environment to dev...$(NC)"
	@if [ "$$(uname)" = "Darwin" ]; then \
		sed -i '' 's/^SPRING_PROFILES_ACTIVE=.*/SPRING_PROFILES_ACTIVE=dev/' .env; \
	else \
		sed -i 's/^SPRING_PROFILES_ACTIVE=.*/SPRING_PROFILES_ACTIVE=dev/' .env; \
	fi
	@echo "$(GREEN)Starting infrastructure services only...$(NC)"
	@$(COMPOSE_LOCAL_CMD) up -d
	@echo ""
	@echo "$(GREEN)✅ Infrastructure services started!$(NC)"
	@echo ""
	@echo "$(CYAN)📋 Database Connection:$(NC)"
	@echo "  $(YELLOW)URL:$(NC) jdbc:postgresql://localhost:5432/$(POSTGRES_DB)"
	@echo "  $(YELLOW)User:$(NC) $(DATABASE_USERNAME)"
	@echo "  $(YELLOW)Password:$(NC) $(DATABASE_PASSWORD)"
	@echo ""
	@echo "$(CYAN)🚀 Next Steps:$(NC)"
	@echo "  1. Run Spring Boot app locally:"
	@echo "     $(GREEN)./mvnw spring-boot:run$(NC)"
	@echo "     or use your IDE's run configuration"
	@echo ""
	@echo "  2. Update DATABASE_URL in your IDE to:"
	@echo "     $(GREEN)jdbc:postgresql://localhost:5432/$(POSTGRES_DB)$(NC)"
	@echo ""
	@echo "$(CYAN)🌐 Services:$(NC)"
	@echo "  $(YELLOW)Prometheus:$(NC) http://localhost:9090"
	@echo "  $(YELLOW)Grafana:$(NC)    http://localhost:3000 (admin/admin)"
	@echo "  $(YELLOW)Loki:$(NC)       http://localhost:3100"
	@echo ""

up:
	@echo "$(GREEN)Starting services in $(ENV_COLOR)$(ENV)$(GREEN) environment...$(NC)"
	@$(COMPOSE_CMD) up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@echo ""
	@make ps

down:
	@echo "$(YELLOW)Stopping services...$(NC)"
	@$(COMPOSE_CMD) down
	@echo "$(GREEN)✓ Services stopped$(NC)"

ps:
	@$(COMPOSE_CMD) ps

logs:
	@$(COMPOSE_CMD) logs -f

logs-app:
	@$(COMPOSE_CMD) logs -f app

logs-nginx:
	@$(COMPOSE_CMD) logs -f nginx

logs-grafana:
	@$(COMPOSE_CMD) logs -f grafana

logs-promtail:
	@$(COMPOSE_CMD) logs -f promtail

build:
	@echo "$(GREEN)Building app image...$(NC)"
	@$(COMPOSE_CMD) build app
	@echo "$(GREEN)✓ Build complete$(NC)"

restart:
	@echo "$(YELLOW)Restarting all services...$(NC)"
	@$(COMPOSE_CMD) restart
	@echo "$(GREEN)✓ Services restarted$(NC)"

clean:
	@echo "$(RED)Cleaning up all containers and data...$(NC)"
	@$(COMPOSE_CMD) down -v
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

generate-compose:
	@./scripts/generate-compose.sh

# Show current configuration
status:
	@echo "$(CYAN)╔════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║         Current Configuration          ║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Environment:$(NC) $(ENV_COLOR)$(ENV)$(NC)"
	@echo "$(GREEN)Profile:$(NC) $(SPRING_PROFILES_ACTIVE)"
	@echo "$(GREEN)Nginx Config:$(NC) ./.docker/nginx/nginx.$(ENV).conf"
	@echo ""
	@echo "$(GREEN)Generated Compose Command:$(NC)"
	@echo "  $(COMPOSE_CMD) [action]"
	@echo ""
	@make ps

local-down:
	@echo "$(YELLOW)Stopping local infrastructure services...$(NC)"
	@docker compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

local-logs:
	@docker compose logs -f
