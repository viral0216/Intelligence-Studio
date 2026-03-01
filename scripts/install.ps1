# ============================================================================
#  Intelligence Studio — Setup & Install Script (Windows PowerShell)
# ============================================================================
#
#  Usage:
#    .\scripts\install.ps1              # Install everything
#    .\scripts\install.ps1 -Frontend    # Frontend only
#    .\scripts\install.ps1 -Backend     # Backend only
#    .\scripts\install.ps1 -Desktop     # Desktop only
#    .\scripts\install.ps1 -Cli         # CLI only
#    .\scripts\install.ps1 -Dev         # Include dev dependencies
#
# ============================================================================

param(
    [switch]$Frontend,
    [switch]$Backend,
    [switch]$Desktop,
    [switch]$Cli,
    [switch]$Dev,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# ── Help ─────────────────────────────────────────────────────────────────────

if ($Help) {
    Write-Host ""
    Write-Host "Intelligence Studio Setup Script (Windows)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\scripts\install.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Frontend    Install frontend dependencies only"
    Write-Host "  -Backend     Install backend dependencies only"
    Write-Host "  -Desktop     Install desktop dependencies only"
    Write-Host "  -Cli         Install CLI only"
    Write-Host "  -Dev         Include dev dependencies (test, lint)"
    Write-Host "  -Help        Show this help"
    Write-Host ""
    Write-Host "No options = install everything."
    exit 0
}

# Determine what to install
$InstallAll = -not ($Frontend -or $Backend -or $Desktop -or $Cli)
if ($InstallAll) {
    $Frontend = $true
    $Backend = $true
    $Desktop = $true
    $Cli = $true
}

# ── Helpers ──────────────────────────────────────────────────────────────────

function Write-Header($text) {
    Write-Host ""
    Write-Host ("=" * 64) -ForegroundColor Cyan
    Write-Host "  $text" -ForegroundColor Blue
    Write-Host ("=" * 64) -ForegroundColor Cyan
}

function Write-Step($text)  { Write-Host "  > $text" -ForegroundColor Yellow }
function Write-Ok($text)    { Write-Host "  + $text" -ForegroundColor Green }
function Write-Fail($text)  { Write-Host "  x $text" -ForegroundColor Red }
function Write-Warn($text)  { Write-Host "  ! $text" -ForegroundColor Yellow }
function Test-Cmd($cmd)     { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

# ── Banner ───────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "+======================================================+" -ForegroundColor Cyan
Write-Host "|  Intelligence Studio - Setup                          |" -ForegroundColor Cyan
Write-Host "+======================================================+" -ForegroundColor Cyan

# ── Prerequisites ────────────────────────────────────────────────────────────

Write-Header "Checking prerequisites"

$Missing = $false

if (Test-Cmd "node") {
    $nodeVer = (node --version)
    $nodeMajor = [int]($nodeVer -replace 'v(\d+)\..*', '$1')
    if ($nodeMajor -ge 18) {
        Write-Ok "Node.js $nodeVer"
    } else {
        Write-Fail "Node.js $nodeVer (requires >= 18)"
        $Missing = $true
    }
} else {
    Write-Fail "Node.js not found"
    $Missing = $true
}

if (Test-Cmd "npm") {
    Write-Ok "npm $(npm --version)"
} else {
    Write-Fail "npm not found"
    $Missing = $true
}

if (Test-Cmd "python") {
    $pyVer = (python --version 2>&1) -replace 'Python ', ''
    $pyParts = $pyVer.Split('.')
    if ([int]$pyParts[0] -ge 3 -and [int]$pyParts[1] -ge 11) {
        Write-Ok "Python $pyVer"
    } else {
        Write-Fail "Python $pyVer (requires >= 3.11)"
        $Missing = $true
    }
} else {
    Write-Fail "Python not found"
    $Missing = $true
}

if (Test-Cmd "pip") {
    Write-Ok "pip available"
} else {
    Write-Fail "pip not found"
    $Missing = $true
}

if (Test-Cmd "git") {
    Write-Ok "Git $(git --version)"
} else {
    Write-Warn "Git not found (optional)"
}

if ($Missing) {
    Write-Host ""
    Write-Fail "Missing required prerequisites. Please install them first:"
    Write-Host "  Node.js 18+:  https://nodejs.org"
    Write-Host "  Python 3.11+: https://python.org"
    exit 1
}

# ── Environment Files ────────────────────────────────────────────────────────

Write-Header "Setting up environment"

$envFile = Join-Path $RootDir ".env"
$envExample = Join-Path $RootDir ".env.example"

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Ok "Created .env from .env.example"
        Write-Warn "Edit .env with your Databricks credentials"
    }
} else {
    Write-Ok ".env already exists"
}

$backendEnv = Join-Path $RootDir "backend\.env"
$backendEnvExample = Join-Path $RootDir "backend\.env.example"

if (-not (Test-Path $backendEnv)) {
    if (Test-Path $backendEnvExample) {
        Copy-Item $backendEnvExample $backendEnv
        Write-Ok "Created backend\.env from .env.example"
    }
} else {
    Write-Ok "backend\.env already exists"
}

# ── Frontend ─────────────────────────────────────────────────────────────────

if ($Frontend) {
    Write-Header "Installing Frontend"

    Push-Location (Join-Path $RootDir "frontend")

    Write-Step "Installing npm packages..."
    npm install
    $pkgCount = (Get-ChildItem "node_modules" -Directory -ErrorAction SilentlyContinue).Count
    Write-Ok "Frontend dependencies installed ($pkgCount packages)"

    Write-Step "Verifying TypeScript compilation..."
    npx tsc --noEmit 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Ok "TypeScript OK" }
    else { Write-Warn "TypeScript has warnings (non-blocking)" }

    Pop-Location
}

# ── Backend ──────────────────────────────────────────────────────────────────

if ($Backend) {
    Write-Header "Installing Backend"

    Push-Location (Join-Path $RootDir "backend")

    if ($Dev) {
        Write-Step "Installing Python packages (with dev dependencies)..."
        pip install -e ".[dev]"
    } else {
        Write-Step "Installing Python packages..."
        pip install -e .
    }
    Write-Ok "Backend dependencies installed"

    Write-Step "Verifying backend imports..."
    python -c "from app.main import app; print('FastAPI app OK')" 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Ok "Backend imports OK" }
    else { Write-Warn "Some imports may need attention" }

    Pop-Location
}

# ── Desktop ──────────────────────────────────────────────────────────────────

if ($Desktop) {
    Write-Header "Installing Desktop"

    Push-Location (Join-Path $RootDir "desktop")

    Write-Step "Installing Electron packages..."
    npm install
    Write-Ok "Desktop dependencies installed"

    Pop-Location
}

# ── CLI ──────────────────────────────────────────────────────────────────────

if ($Cli) {
    Write-Header "Installing CLI"

    Push-Location (Join-Path $RootDir "cli")

    Write-Step "Installing CLI package..."
    pip install -e .
    Write-Ok "CLI installed"

    if (Test-Cmd "dbx-cli") {
        Write-Ok "dbx-cli command available"
    } else {
        Write-Warn "dbx-cli may need your PATH updated"
    }

    Pop-Location
}

# ── Summary ──────────────────────────────────────────────────────────────────

Write-Header "Setup Complete"

Write-Host ""
Write-Host "  Next steps:" -ForegroundColor White
Write-Host ""
Write-Host "  1. Edit .env with your Databricks credentials:" -ForegroundColor White
Write-Host "     DATABRICKS_HOST=https://your-workspace.cloud.databricks.com" -ForegroundColor Yellow
Write-Host "     DATABRICKS_TOKEN=dapi..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  2. Start the development servers:" -ForegroundColor White
Write-Host "     make dev" -ForegroundColor Green
Write-Host ""
Write-Host "  3. Open http://localhost:5173 in your browser" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Other commands:" -ForegroundColor White
Write-Host "     make test                   Run all tests" -ForegroundColor Green
Write-Host "     make build                  Build frontend" -ForegroundColor Green
Write-Host "     .\scripts\build-all.ps1     Full build (all platforms)" -ForegroundColor Green
Write-Host ""
