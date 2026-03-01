# ============================================================================
#  Intelligence Studio — Full Build Script (Windows PowerShell)
# ============================================================================
#
#  Usage:
#    .\scripts\build-all.ps1                   # Build everything
#    .\scripts\build-all.ps1 -Desktop          # Build desktop app only
#    .\scripts\build-all.ps1 -DesktopWin       # Desktop for Windows only
#    .\scripts\build-all.ps1 -Cli              # Package CLI only
#    .\scripts\build-all.ps1 -SkipTests        # Build all, skip tests
#    .\scripts\build-all.ps1 -Clean            # Clean before building
#
# ============================================================================

param(
    [switch]$Desktop,
    [switch]$DesktopWin,
    [switch]$DesktopMac,
    [switch]$Cli,
    [switch]$SkipTests,
    [switch]$Clean,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$BuildDir = Join-Path $RootDir "dist"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$VersionLine = (Get-Content (Join-Path $RootDir "desktop\package.json") | Select-String '"version"' | Select-Object -First 1).ToString()
$Version = ($VersionLine -replace '.*"version":\s*"([^"]+)".*', '$1')

# ── Help ─────────────────────────────────────────────────────────────────────

if ($Help) {
    Write-Host ""
    Write-Host "Intelligence Studio Build Script (Windows)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\scripts\build-all.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Desktop        Build desktop app (all platforms)"
    Write-Host "  -DesktopWin     Build desktop app for Windows only"
    Write-Host "  -DesktopMac     Build desktop app for macOS only"
    Write-Host "  -Cli            Package CLI only"
    Write-Host "  -SkipTests      Skip running tests"
    Write-Host "  -Clean          Clean build artifacts before building"
    Write-Host "  -Help           Show this help"
    Write-Host ""
    Write-Host "No options = build everything (desktop + CLI)."
    exit 0
}

# ── Determine what to build ──────────────────────────────────────────────────

$BuildAll = -not ($Desktop -or $DesktopWin -or $DesktopMac -or $Cli)

if ($BuildAll) {
    $DesktopWin = $true
    $Cli = $true
}

# ── Helpers ──────────────────────────────────────────────────────────────────

function Write-Header($text) {
    Write-Host ""
    Write-Host ("=" * 64) -ForegroundColor Cyan
    Write-Host "  $text" -ForegroundColor Blue
    Write-Host ("=" * 64) -ForegroundColor Cyan
}

function Write-Step($text) {
    Write-Host "  > $text" -ForegroundColor Yellow
}

function Write-Ok($text) {
    Write-Host "  + $text" -ForegroundColor Green
}

function Write-Fail($text) {
    Write-Host "  x $text" -ForegroundColor Red
}

function Write-Warn($text) {
    Write-Host "  ! $text" -ForegroundColor Yellow
}

function Test-Command($cmd) {
    return [bool](Get-Command $cmd -ErrorAction SilentlyContinue)
}

# ── Banner ───────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "+======================================================+" -ForegroundColor Cyan
Write-Host "|  Intelligence Studio - Build System                   |" -ForegroundColor Cyan
Write-Host "|  Version: $Version    Build: $Timestamp        |" -ForegroundColor Cyan
Write-Host "+======================================================+" -ForegroundColor Cyan

# ── Prerequisites ────────────────────────────────────────────────────────────

Write-Header "Checking prerequisites"

$Missing = $false

if ($Desktop -or $DesktopWin -or $DesktopMac) {
    if (Test-Command "node") {
        Write-Ok "Node.js $(node --version)"
    } else {
        Write-Fail "Node.js is not installed"
        $Missing = $true
    }
    if (Test-Command "npm") {
        Write-Ok "npm $(npm --version)"
    } else {
        Write-Fail "npm is not installed"
        $Missing = $true
    }
}

if ($Cli) {
    if (Test-Command "python") {
        Write-Ok "Python $(python --version 2>&1)"
    } elseif (Test-Command "python3") {
        Write-Ok "Python $(python3 --version 2>&1)"
    } else {
        Write-Fail "Python is not installed"
        $Missing = $true
    }
    if (Test-Command "pip") {
        Write-Ok "pip $(pip --version 2>&1)"
    } elseif (Test-Command "pip3") {
        Write-Ok "pip3 available"
    } else {
        Write-Fail "pip is not installed"
        $Missing = $true
    }
}

if ($Missing) {
    Write-Host ""
    Write-Fail "Missing prerequisites. Please install them and try again."
    exit 1
}

# ── Clean ────────────────────────────────────────────────────────────────────

if ($Clean) {
    Write-Header "Cleaning previous builds"

    Write-Step "Removing dist/"
    if (Test-Path $BuildDir) { Remove-Item -Recurse -Force $BuildDir }

    Write-Step "Removing frontend/dist/"
    $fd = Join-Path $RootDir "frontend\dist"
    if (Test-Path $fd) { Remove-Item -Recurse -Force $fd }

    Write-Step "Removing desktop/dist/"
    $dd = Join-Path $RootDir "desktop\dist"
    if (Test-Path $dd) { Remove-Item -Recurse -Force $dd }

    Write-Ok "Clean complete"
}

# Create output directory
New-Item -ItemType Directory -Force -Path $BuildDir | Out-Null

# ── Tests ────────────────────────────────────────────────────────────────────

if (-not $SkipTests) {
    Write-Header "Running tests"

    if ($Desktop -or $DesktopWin -or $DesktopMac) {
        Write-Step "Frontend tests (Vitest)..."
        Push-Location (Join-Path $RootDir "frontend")
        $testOutput = npx vitest run --passWithNoTests 2>&1 | Out-String
        if ($testOutput -match "No test files found") {
            Write-Ok "Frontend tests skipped (no test files)"
        } elseif ($LASTEXITCODE -eq 0) {
            Write-Ok "Frontend tests passed"
        } else {
            Write-Fail "Frontend tests failed"
            Write-Warn "Tip: Use -SkipTests to skip"
            Pop-Location
            exit 1
        }
        Pop-Location
    }

    if ($Cli) {
        Write-Step "Backend tests (pytest)..."
        Push-Location (Join-Path $RootDir "backend")
        $testOutput = python -m pytest -q 2>&1 | Out-String
        if ($testOutput -match "no tests ran") {
            Write-Ok "Backend tests skipped (no tests found)"
        } elseif ($LASTEXITCODE -eq 0) {
            Write-Ok "Backend tests passed"
        } else {
            Write-Fail "Backend tests failed"
            Write-Warn "Tip: Use -SkipTests to skip"
            Pop-Location
            exit 1
        }
        Pop-Location
    }
}

# ── Desktop Build ────────────────────────────────────────────────────────────

if ($Desktop -or $DesktopWin -or $DesktopMac) {
    Write-Header "Building Desktop App"

    # Build frontend first (bundled into the desktop app)
    $frontendDist = Join-Path $RootDir "frontend\dist"
    if (-not (Test-Path $frontendDist)) {
        Write-Step "Building frontend (bundled into desktop app)..."
        Push-Location (Join-Path $RootDir "frontend")
        npm ci --silent 2>$null
        if ($LASTEXITCODE -ne 0) { npm install --silent }
        Write-Ok "Frontend dependencies installed"

        Write-Step "Running TypeScript check..."
        npx tsc --noEmit 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Ok "TypeScript OK"
        } else {
            Write-Warn "TypeScript warnings (non-blocking)"
        }

        Write-Step "Building with Vite..."
        npm run build
        Write-Ok "Frontend built -> frontend\dist\"
        Pop-Location
    } else {
        Write-Ok "Frontend already built (frontend\dist\ exists)"
    }

    Push-Location (Join-Path $RootDir "desktop")

    Write-Step "Installing Electron dependencies..."
    npm ci --silent 2>$null
    if ($LASTEXITCODE -ne 0) { npm install --silent }
    Write-Ok "Electron dependencies installed"

    if ($Desktop -or $DesktopWin) {
        Write-Step "Building Windows NSIS + Portable..."
        npx electron-builder --win
        Write-Ok "Windows build complete"

        # Copy Windows artifacts
        $outWin = Join-Path $BuildDir "desktop\win"
        New-Item -ItemType Directory -Force -Path $outWin | Out-Null
        Get-ChildItem "dist\*.exe" -ErrorAction SilentlyContinue | Copy-Item -Destination $outWin
        Get-ChildItem "dist\*.msi" -ErrorAction SilentlyContinue | Copy-Item -Destination $outWin
        Write-Ok "Windows artifacts -> dist\desktop\win\"
    }

    if ($Desktop -or $DesktopMac) {
        Write-Warn "macOS builds require running on macOS (use build-all.sh)"
    }

    Pop-Location
}

# ── CLI Package ──────────────────────────────────────────────────────────────

if ($Cli) {
    Write-Header "Packaging CLI"

    $outCli = Join-Path $BuildDir "cli"
    New-Item -ItemType Directory -Force -Path $outCli | Out-Null

    Write-Step "Copying CLI source..."
    Copy-Item -Recurse -Force (Join-Path $RootDir "cli\cli") $outCli
    Copy-Item -Force (Join-Path $RootDir "cli\pyproject.toml") $outCli

    # Create Windows install script
    @"
@echo off
cd /d "%~dp0"
echo Installing Intelligence Studio CLI...
pip install -e .
echo.
echo Done! Run 'dbx-cli --help' to get started.
"@ | Set-Content (Join-Path $outCli "install.bat")

    Write-Ok "CLI packaged -> dist\cli\"
}

# ── Summary ──────────────────────────────────────────────────────────────────

Write-Header "Build Complete"

Write-Host ""
Write-Host "  Output directory: $BuildDir" -ForegroundColor White
Write-Host ""

$dirs = @(
    @{ Name = "Desktop (Win)";  Path = "desktop\win" },
    @{ Name = "Desktop (Mac)";  Path = "desktop\mac" },
    @{ Name = "CLI";            Path = "cli" }
)

foreach ($d in $dirs) {
    $fullPath = Join-Path $BuildDir $d.Path
    if (Test-Path $fullPath) {
        $size = "{0:N1} MB" -f ((Get-ChildItem $fullPath -Recurse -ErrorAction SilentlyContinue |
            Measure-Object -Property Length -Sum).Sum / 1MB)
        Write-Host "  + $($d.Name.PadRight(18)) $($size.PadRight(10)) dist\$($d.Path)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "  Version:  $Version" -ForegroundColor White
Write-Host "  Build:    $Timestamp" -ForegroundColor White
Write-Host ""
