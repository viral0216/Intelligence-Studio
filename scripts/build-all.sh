#!/bin/bash
set -e

# ============================================================================
#  Intelligence Studio — Full Build Script (macOS / Linux)
# ============================================================================
#
#  Usage:
#    ./scripts/build-all.sh                   # Build everything
#    ./scripts/build-all.sh --desktop         # Build desktop app only
#    ./scripts/build-all.sh --desktop-mac     # Desktop for macOS only
#    ./scripts/build-all.sh --desktop-win     # Desktop for Windows only
#    ./scripts/build-all.sh --cli             # Package CLI only
#    ./scripts/build-all.sh --skip-tests      # Build all, skip tests
#    ./scripts/build-all.sh --clean           # Clean before building
#
# ============================================================================

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/dist"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
VERSION=$(grep '"version"' "$ROOT_DIR/desktop/package.json" | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Flags
BUILD_DESKTOP=false
BUILD_DESKTOP_MAC=false
BUILD_DESKTOP_WIN=false
BUILD_CLI=false
SKIP_TESTS=false
CLEAN_FIRST=false
BUILD_ALL=true

# Parse arguments
for arg in "$@"; do
  case $arg in
    --desktop)      BUILD_DESKTOP=true;  BUILD_ALL=false ;;
    --desktop-mac)  BUILD_DESKTOP_MAC=true; BUILD_ALL=false ;;
    --desktop-win)  BUILD_DESKTOP_WIN=true; BUILD_ALL=false ;;
    --cli)          BUILD_CLI=true;      BUILD_ALL=false ;;
    --skip-tests)   SKIP_TESTS=true ;;
    --clean)        CLEAN_FIRST=true ;;
    --help|-h)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --desktop        Build desktop app (all platforms)"
      echo "  --desktop-mac    Build desktop app for macOS only"
      echo "  --desktop-win    Build desktop app for Windows only (requires Wine)"
      echo "  --cli            Package CLI only"
      echo "  --skip-tests     Skip running tests"
      echo "  --clean          Clean build artifacts before building"
      echo "  --help, -h       Show this help"
      echo ""
      echo "No options = build everything (desktop + CLI)."
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $arg${NC}"
      exit 1
      ;;
  esac
done

# If building all, enable everything
if $BUILD_ALL; then
  BUILD_DESKTOP=true
  BUILD_CLI=true
fi

# ── Helpers ──────────────────────────────────────────────────────────────────

print_header() {
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}${BLUE}  $1${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_step() {
  echo -e "${YELLOW}  ▸${NC} $1"
}

print_success() {
  echo -e "${GREEN}  ✓${NC} $1"
}

print_error() {
  echo -e "${RED}  ✗${NC} $1"
}

check_command() {
  if ! command -v "$1" &>/dev/null; then
    print_error "$1 is not installed"
    return 1
  fi
  return 0
}

# ── Banner ───────────────────────────────────────────────────────────────────

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  ${BOLD}Intelligence Studio — Build System${NC}                  ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  Version: ${GREEN}$VERSION${NC}    Build: ${GREEN}$TIMESTAMP${NC}     ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════╝${NC}"

# ── Prerequisites ────────────────────────────────────────────────────────────

print_header "Checking prerequisites"

MISSING=false

if $BUILD_DESKTOP || $BUILD_DESKTOP_MAC || $BUILD_DESKTOP_WIN; then
  if check_command node; then
    print_success "Node.js $(node --version)"
  else
    MISSING=true
  fi
  if check_command npm; then
    print_success "npm $(npm --version)"
  else
    MISSING=true
  fi
fi

if $BUILD_CLI; then
  if check_command python3; then
    print_success "Python $(python3 --version 2>&1 | awk '{print $2}')"
  else
    MISSING=true
  fi
  if check_command pip3; then
    print_success "pip $(pip3 --version 2>&1 | awk '{print $2}')"
  else
    MISSING=true
  fi
fi

if $MISSING; then
  echo ""
  print_error "Missing prerequisites. Please install them and try again."
  exit 1
fi

# ── Clean ────────────────────────────────────────────────────────────────────

if $CLEAN_FIRST; then
  print_header "Cleaning previous builds"

  print_step "Removing dist/"
  rm -rf "$BUILD_DIR"

  print_step "Removing frontend/dist/"
  rm -rf "$ROOT_DIR/frontend/dist"

  print_step "Removing desktop/dist/"
  rm -rf "$ROOT_DIR/desktop/dist"

  print_success "Clean complete"
fi

# Create output directory
mkdir -p "$BUILD_DIR"

# ── Tests ────────────────────────────────────────────────────────────────────

if ! $SKIP_TESTS; then
  print_header "Running tests"

  if $BUILD_DESKTOP || $BUILD_DESKTOP_MAC || $BUILD_DESKTOP_WIN; then
    print_step "Frontend tests (Vitest)..."
    cd "$ROOT_DIR/frontend"
    TEST_OUTPUT=$(npx vitest run --passWithNoTests 2>&1) && FRONTEND_TEST_OK=true || FRONTEND_TEST_OK=false
    if echo "$TEST_OUTPUT" | grep -q "No test files found"; then
      print_success "Frontend tests skipped (no test files)"
    elif $FRONTEND_TEST_OK; then
      print_success "Frontend tests passed"
    else
      print_error "Frontend tests failed"
      echo "$TEST_OUTPUT" | tail -5
      echo -e "${YELLOW}  Tip: Use --skip-tests to skip${NC}"
      exit 1
    fi
  fi

  if $BUILD_CLI; then
    print_step "Backend tests (pytest)..."
    cd "$ROOT_DIR/backend"
    TEST_OUTPUT=$(python3 -m pytest -q 2>&1) && BACKEND_TEST_OK=true || BACKEND_TEST_OK=false
    if echo "$TEST_OUTPUT" | grep -q "no tests ran"; then
      print_success "Backend tests skipped (no tests found)"
    elif $BACKEND_TEST_OK; then
      print_success "Backend tests passed"
    else
      print_error "Backend tests failed"
      echo "$TEST_OUTPUT" | tail -5
      echo -e "${YELLOW}  Tip: Use --skip-tests to skip${NC}"
      exit 1
    fi
  fi
fi

# ── Desktop Build ────────────────────────────────────────────────────────────
#
#  macOS Code Signing & Notarization
#  By default, the app is built unsigned (safe for local development).
#  For distribution, provide Apple credentials:
#    export APPLE_ID="your-email@example.com"
#    export APPLE_ID_PASSWORD="app-specific-password"
#    export APPLE_TEAM_ID="XXXXXXXXXX"
#
#  See: docs/SIGNING.md for setup instructions
#

if $BUILD_DESKTOP || $BUILD_DESKTOP_MAC || $BUILD_DESKTOP_WIN; then
  print_header "Building Desktop App"

  # Build frontend first (bundled into the desktop app)
  if [ ! -d "$ROOT_DIR/frontend/dist" ]; then
    print_step "Building frontend (bundled into desktop app)..."
    cd "$ROOT_DIR/frontend"
    npm ci --silent 2>/dev/null || npm install --silent
    print_success "Frontend dependencies installed"

    print_step "Running TypeScript check..."
    npx tsc --noEmit 2>/dev/null && print_success "TypeScript OK" || echo -e "${YELLOW}  ⚠ TypeScript warnings (non-blocking)${NC}"

    print_step "Building with Vite..."
    npm run build
    print_success "Frontend built → frontend/dist/"
  else
    print_success "Frontend already built (frontend/dist/ exists)"
  fi

  cd "$ROOT_DIR/desktop"

  print_step "Installing Electron dependencies..."
  npm ci --silent 2>/dev/null || npm install --silent
  print_success "Electron dependencies installed"

  # Determine targets
  if $BUILD_DESKTOP || $BUILD_DESKTOP_MAC; then
    if [[ "$(uname)" == "Darwin" ]]; then
      print_step "Building macOS ZIP + App (arm64)..."
      npx electron-builder --mac
      print_success "macOS build complete"

      # Copy macOS artifacts
      mkdir -p "$BUILD_DIR/desktop/mac"
      cp -r dist/*.zip "$BUILD_DIR/desktop/mac/" 2>/dev/null || true
      cp -r dist/mac-arm64/*.app "$BUILD_DIR/desktop/mac/" 2>/dev/null || true
      print_success "macOS artifacts → dist/desktop/mac/"
    else
      echo -e "${YELLOW}  ⚠ Skipping macOS build (not on macOS)${NC}"
    fi
  fi

  if $BUILD_DESKTOP || $BUILD_DESKTOP_WIN; then
    print_step "Building Windows NSIS + Portable..."
    if [[ "$(uname)" == "Darwin" ]] || [[ "$(uname)" == "Linux" ]]; then
      # Cross-compilation: requires wine on macOS/Linux
      if command -v wine &>/dev/null || command -v wine64 &>/dev/null; then
        npx electron-builder --win
        print_success "Windows build complete"
      else
        echo -e "${YELLOW}  ⚠ Skipping Windows build (wine not installed for cross-compilation)${NC}"
        echo -e "${YELLOW}    Install wine to cross-compile: brew install --cask wine-stable${NC}"
      fi
    else
      npx electron-builder --win
      print_success "Windows build complete"
    fi

    # Copy Windows artifacts
    mkdir -p "$BUILD_DIR/desktop/win"
    cp -r dist/*.exe "$BUILD_DIR/desktop/win/" 2>/dev/null || true
    cp -r dist/*.msi "$BUILD_DIR/desktop/win/" 2>/dev/null || true
    print_success "Windows artifacts → dist/desktop/win/"
  fi
fi

# ── CLI Package ──────────────────────────────────────────────────────────────

if $BUILD_CLI; then
  print_header "Packaging CLI"

  cd "$ROOT_DIR/cli"

  print_step "Creating CLI distribution..."
  mkdir -p "$BUILD_DIR/cli"

  # Copy CLI source
  cp -r cli "$BUILD_DIR/cli/"
  cp pyproject.toml "$BUILD_DIR/cli/"

  # Create install script
  cat > "$BUILD_DIR/cli/install.sh" << 'CLISCRIPT'
#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
echo "Installing Intelligence Studio CLI..."
pip install -e .
echo ""
echo "Done! Run 'dbx-cli --help' to get started."
CLISCRIPT
  chmod +x "$BUILD_DIR/cli/install.sh"

  print_success "CLI packaged → dist/cli/"
fi

# ── Summary ──────────────────────────────────────────────────────────────────

print_header "Build Complete"

echo ""
echo -e "  ${BOLD}Output directory:${NC} $BUILD_DIR"
echo ""

# List outputs
if [ -d "$BUILD_DIR/desktop/mac" ]; then
  SIZE=$(du -sh "$BUILD_DIR/desktop/mac" 2>/dev/null | awk '{print $1}')
  echo -e "  ${GREEN}✓${NC} Desktop (Mac)   $SIZE    dist/desktop/mac/"
fi

if [ -d "$BUILD_DIR/desktop/win" ]; then
  SIZE=$(du -sh "$BUILD_DIR/desktop/win" 2>/dev/null | awk '{print $1}')
  echo -e "  ${GREEN}✓${NC} Desktop (Win)   $SIZE    dist/desktop/win/"
fi

if [ -d "$BUILD_DIR/cli" ]; then
  SIZE=$(du -sh "$BUILD_DIR/cli" 2>/dev/null | awk '{print $1}')
  echo -e "  ${GREEN}✓${NC} CLI             $SIZE    dist/cli/"
fi

echo ""
echo -e "  ${BOLD}Version:${NC}  $VERSION"
echo -e "  ${BOLD}Build:${NC}    $TIMESTAMP"
echo ""
