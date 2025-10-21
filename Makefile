.PHONY: setup ui api dev fmt

setup: ## Install UI and API deps
	@echo "==> Installing Python deps"
	python3 -m venv .venv
	. .venv/bin/activate && pip install -U pip && pip install -r apps/api/requirements.txt
	@echo "==> Installing UI deps (Next.js app)"
	cd apps/ui && npm install

ui: ## Run UI dev server
	cd apps/ui && npm run dev

api: ## Run API dev server
	. .venv/bin/activate && uvicorn apps.api.main:app --reload --port $${API_PORT:-8080}

dev: ## Run UI and API together
	@echo "==> Starting API & UI (Ctrl-C to stop)"
	( . .venv/bin/activate && uvicorn apps.api.main:app --reload --port $${API_PORT:-8080} ) &
	API_PID=$$!; \
	( cd apps/ui && npm run dev ) & \
	UI_PID=$$!; \
	trap 'kill $$API_PID $$UI_PID 2>/dev/null || true' INT TERM; \
	wait

fmt:
	npx prettier -w . || true
