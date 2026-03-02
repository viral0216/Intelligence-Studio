#!/bin/bash
set -e

# ============================================================================
#  Intelligence Studio — Setup & Install Script (macOS / Linux)
# ============================================================================
#
#  Usage:
#    ./scripts/install.sh              # Install everything
#    ./scripts/install.sh --frontend   # Frontend only
#    ./scripts/install.sh --backend    # Backend only
#    ./scripts/install.sh --desktop    # Desktop only
#    ./scripts/install.sh --cli        # CLI only
#    ./scripts/install.sh --dev        # Install with dev dependencies
#
# ============================================================================

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

# Flags
INSTALL_FRONTEND=false
INSTALL_BACKEND=false
INSTALL_DESKTOP=false
INSTALL_CLI=false
DEV_MODE=false
INSTALL_ALL=true

for arg in "$@"; do
  case $arg in
    --frontend)  INSTALL_FRONTEND=true; INSTALL_ALL=false ;;
    --backend)   INSTALL_BACKEND=true;  INSTALL_ALL=false ;;
    --desktop)   INSTALL_DESKTOP=true;  INSTALL_ALL=false ;;
    --cli)       INSTALL_CLI=true;      INSTALL_ALL=false ;;
    --dev)       DEV_MODE=true ;;
    --help|-h)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --frontend   Install frontend dependencies only"
      echo "  --backend    Install backend dependencies only"
      echo "  --desktop    Install desktop dependencies only"
      echo "  --cli        Install CLI only"
      echo "  --dev        Include dev dependencies (test, lint)"
      echo "  --help, -h   Show this help"
      exit 0
      ;;
  esac
done

if $INSTALL_ALL; then
  INSTALL_FRONTEND=true
  INSTALL_BACKEND=true
  INSTALL_DESKTOP=true
  INSTALL_CLI=true
fi

# ── Helpers ──────────────────────────────────────────────────────────────────

print_header() {
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}${BLUE}  $1${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_step() { echo -e "${YELLOW}  ▸${NC} $1"; }
print_ok()   { echo -e "${GREEN}  ✓${NC} $1"; }
print_fail() { echo -e "${RED}  ✗${NC} $1"; }
print_warn() { echo -e "${YELLOW}  ⚠${NC} $1"; }

# ── Banner ───────────────────────────────────────────────────────────────────

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  ${BOLD}Intelligence Studio — Setup${NC}                         ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════╝${NC}"

# ── Prerequisites Check ─────────────────────────────────────────────────────

print_header "Checking prerequisites"

MISSING=false

# Node.js
if command -v node &>/dev/null; then
  NODE_VER=$(node --version)
  NODE_MAJOR=$(echo "$NODE_VER" | sed 's/v\([0-9]*\).*/\1/')
  if [ "$NODE_MAJOR" -ge 18 ]; then
    print_ok "Node.js $NODE_VER"
  else
    print_fail "Node.js $NODE_VER (requires >= 18)"
    MISSING=true
  fi
else
  print_fail "Node.js not found"
  MISSING=true
fi

# npm
if command -v npm &>/dev/null; then
  print_ok "npm $(npm --version)"
else
  print_fail "npm not found"
  MISSING=true
fi

# Python
if command -v python3 &>/dev/null; then
  PY_VER=$(python3 --version 2>&1 | awk '{print $2}')
  PY_MAJOR=$(echo "$PY_VER" | cut -d. -f1)
  PY_MINOR=$(echo "$PY_VER" | cut -d. -f2)
  if [ "$PY_MAJOR" -ge 3 ] && [ "$PY_MINOR" -ge 11 ]; then
    print_ok "Python $PY_VER"
  else
    print_fail "Python $PY_VER (requires >= 3.11)"
    MISSING=true
  fi
else
  print_fail "Python 3 not found"
  MISSING=true
fi

# pip
if command -v pip3 &>/dev/null || python3 -m pip --version &>/dev/null 2>&1; then
  print_ok "pip available"
else
  print_fail "pip not found"
  MISSING=true
fi

# Git
if command -v git &>/dev/null; then
  print_ok "Git $(git --version | awk '{print $3}')"
else
  print_warn "Git not found (optional)"
fi

if $MISSING; then
  echo ""
  print_fail "Missing required prerequisites. Please install them first:"
  echo "  Node.js 18+:  https://nodejs.org"
  echo "  Python 3.11+: https://python.org"
  exit 1
fi

# ── Environment Files ────────────────────────────────────────────────────────

print_header "Setting up environment"

if [ ! -f "$ROOT_DIR/.env" ]; then
  if [ -f "$ROOT_DIR/.env.example" ]; then
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
    print_ok "Created .env from .env.example"
    print_warn "Edit .env with your Databricks credentials"
  fi
else
  print_ok ".env already exists"
fi

if [ ! -f "$ROOT_DIR/backend/.env" ]; then
  if [ -f "$ROOT_DIR/backend/.env.example" ]; then
    cp "$ROOT_DIR/backend/.env.example" "$ROOT_DIR/backend/.env"
    print_ok "Created backend/.env from .env.example"
  fi
else
  print_ok "backend/.env already exists"
fi

# ── Frontend ─────────────────────────────────────────────────────────────────

if $INSTALL_FRONTEND; then
  print_header "Installing Frontend"

  cd "$ROOT_DIR/frontend"

  print_step "Installing npm packages..."
  npm install
  print_ok "Frontend dependencies installed ($(ls node_modules | wc -l | tr -d ' ') packages)"

  # Verify build works
  print_step "Verifying TypeScript compilation..."
  npx tsc --noEmit 2>/dev/null && print_ok "TypeScript OK" || print_warn "TypeScript has warnings (non-blocking)"
fi

# ── Backend ──────────────────────────────────────────────────────────────────

if $INSTALL_BACKEND; then
  print_header "Installing Backend"

  cd "$ROOT_DIR/backend"

  if $DEV_MODE; then
    print_step "Installing Python packages (with dev dependencies)..."
    pip3 install -e ".[dev]"
  else
    print_step "Installing Python packages..."
    pip3 install -e .
  fi
  print_ok "Backend dependencies installed"

  # Verify import
  print_step "Verifying backend imports..."
  python3 -c "from app.main import app; print('FastAPI app OK')" 2>/dev/null && print_ok "Backend imports OK" || print_warn "Some imports may need attention"
fi

# ── Desktop ──────────────────────────────────────────────────────────────────

if $INSTALL_DESKTOP; then
  print_header "Installing Desktop"

  cd "$ROOT_DIR/desktop"

  print_step "Installing Electron packages..."
  npm install
  print_ok "Desktop dependencies installed"
fi

# ── CLI ──────────────────────────────────────────────────────────────────────

if $INSTALL_CLI; then
  print_header "Installing CLI"

  cd "$ROOT_DIR/cli"

  print_step "Installing CLI package..."
  pip3 install -e .
  print_ok "CLI installed"

  if command -v dbx-cli &>/dev/null; then
    print_ok "dbx-cli command available"
  else
    print_warn "dbx-cli may need your PATH updated"
  fi
fi

# ── Summary ──────────────────────────────────────────────────────────────────

print_header "Setup Complete"

echo ""
echo -e "  ${BOLD}Next steps:${NC}"
echo ""
echo -e "  1. Edit ${CYAN}.env${NC} with your Databricks credentials:"
echo -e "     ${YELLOW}DATABRICKS_HOST${NC}=https://your-workspace.cloud.databricks.com"
echo -e "     ${YELLOW}DATABRICKS_TOKEN${NC}=dapi..."
echo ""
echo -e "  2. Start the development servers:"
echo -e "     ${GREEN}make dev${NC}          or     ${GREEN}./start.sh${NC}"
echo ""
echo -e "  3. Open ${CYAN}http://localhost:5173${NC} in your browser"
echo ""
echo -e "  ${BOLD}Other commands:${NC}"
echo -e "     ${GREEN}make test${NC}         Run all tests"
echo -e "     ${GREEN}make build${NC}        Build frontend for production"
echo -e "     ${GREEN}./scripts/build-all.sh${NC}    Full build (all platforms)"
echo ""
