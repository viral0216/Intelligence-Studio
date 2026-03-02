.PHONY: dev dev-frontend dev-backend install install-frontend install-backend test build-all build-mac build-win clean setup

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

# Desktop
desktop-dev:
	cd desktop && npm start

# CLI
cli-install:
	cd cli && pip install -e .

# Full Setup (prerequisites check + install all)
setup:
	./scripts/install.sh

setup-dev:
	./scripts/install.sh --dev

# Full Build (desktop + CLI)
build-all:
	./scripts/build-all.sh

build-all-clean:
	./scripts/build-all.sh --clean

build-all-skip-tests:
	./scripts/build-all.sh --skip-tests

build-mac:
	./scripts/build-all.sh --desktop-mac --skip-tests

build-win:
	./scripts/build-all.sh --desktop-win --skip-tests

build-cli:
	./scripts/build-all.sh --cli --skip-tests

# Clean
clean:
	rm -rf dist
	rm -rf frontend/dist frontend/node_modules
	rm -rf backend/__pycache__ backend/.pytest_cache
	rm -rf desktop/dist desktop/node_modules
