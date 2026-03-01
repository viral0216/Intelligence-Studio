.PHONY: dev dev-frontend dev-backend install install-frontend install-backend test build clean

# Development
dev:
	@echo "Starting frontend and backend..."
	$(MAKE) dev-backend &
	$(MAKE) dev-frontend

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Installation
install: install-frontend install-backend

install-frontend:
	cd frontend && npm install

install-backend:
	cd backend && pip install -e ".[dev]"

# Testing
test: test-frontend test-backend

test-frontend:
	cd frontend && npm test

test-backend:
	cd backend && pytest

# Build
build: build-frontend

build-frontend:
	cd frontend && npm run build

# Desktop
desktop-dev:
	cd desktop && npm start

desktop-build:
	cd desktop && npm run build

# CLI
cli-install:
	cd cli && pip install -e .

# Clean
clean:
	rm -rf frontend/dist frontend/node_modules
	rm -rf backend/__pycache__ backend/.pytest_cache
	rm -rf desktop/dist desktop/node_modules
