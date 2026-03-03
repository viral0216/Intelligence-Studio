const { app, BrowserWindow, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const { spawn, execSync } = require('child_process')

let mainWindow
let backendProcess

/**
 * On macOS, strip the quarantine flag from the entire .app bundle recursively.
 * macOS 15 removed `xattr -r`, so we use `find` to walk every file/dir.
 * Runs once on first launch (after the user clicks through the Gatekeeper dialog).
 * All subsequent launches are fully silent — no dialogs.
 */
function removeQuarantine() {
  if (process.platform !== 'darwin' || !app.isPackaged) return

  // .app bundle root → e.g. /Applications/Intelligence Studio.app
  const appBundle = path.resolve(process.resourcesPath, '..', '..')

  try {
    // `-r` was removed in macOS 15 — use `find` to recurse every file and dir
    execSync(
      `find "${appBundle}" -exec xattr -d com.apple.quarantine {} \\; 2>/dev/null; true`,
      { stdio: 'ignore' }
    )
  } catch (_) {
    // Attribute not present or already clean — safe to ignore
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Intelligence Studio',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0d1117',
  })

  // Determine how to load the frontend:
  // 1. Packaged app: load from extraResources (process.resourcesPath/frontend/)
  // 2. Dev with built frontend: load from ../frontend/dist/
  // 3. Dev with Vite server: load from http://localhost:5173
  const packagedFrontend = path.join(process.resourcesPath, 'frontend', 'index.html')
  const localFrontend = path.join(__dirname, '..', 'frontend', 'dist', 'index.html')

  if (app.isPackaged && fs.existsSync(packagedFrontend)) {
    mainWindow.loadFile(packagedFrontend)
  } else if (fs.existsSync(localFrontend)) {
    mainWindow.loadFile(localFrontend)
  } else {
    // Fallback to Vite dev server
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  }

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function findPython() {
  // Check explicit env var first
  if (process.env.PYTHON_PATH) {
    return process.env.PYTHON_PATH
  }

  // Try common Python paths
  const candidates = process.platform === 'win32'
    ? ['python', 'python3', 'py']
    : ['python3', 'python', '/usr/bin/python3', '/usr/local/bin/python3', '/opt/homebrew/bin/python3']

  for (const cmd of candidates) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' })
      return cmd
    } catch {
      // not found, try next
    }
  }

  return null
}

function startBackend() {
  if (app.isPackaged) {
    // --- Packaged app: run the bundled PyInstaller binary (no Python needed) ---
    const exeName = process.platform === 'win32' ? 'backend-server.exe' : 'backend-server'
    const backendExe = path.join(process.resourcesPath, 'backend-server', exeName)

    if (!fs.existsSync(backendExe)) {
      console.error(`Bundled backend binary not found at: ${backendExe}`)
      return
    }

    // Ensure the binary is executable on macOS/Linux
    if (process.platform !== 'win32') {
      try { fs.chmodSync(backendExe, 0o755) } catch (_) {}
    }

    console.log(`Starting bundled backend: ${backendExe}`)
    backendProcess = spawn(backendExe, [], {
      env: { ...process.env, PORT: '8000' },
    })
  } else {
    // --- Dev mode: spawn Python + uvicorn ---
    const pythonPath = findPython()
    if (!pythonPath) {
      console.warn('Python not found — start backend manually: cd backend && uvicorn app.main:app --port 8000')
      return
    }
    const backendDir = path.join(__dirname, '..', 'backend')
    console.log(`Starting dev backend: ${pythonPath} in ${backendDir}`)
    backendProcess = spawn(pythonPath, ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'], {
      cwd: backendDir,
      env: { ...process.env, PORT: '8000' },
    })
  }

  backendProcess.stdout?.on('data', (data) => console.log(`Backend: ${data}`))
  backendProcess.stderr?.on('data', (data) => console.error(`Backend: ${data}`))
  backendProcess.on('error', (err) => {
    console.error(`Backend launch error: ${err.message}`)
    backendProcess = null
  })
  backendProcess.on('close', (code) => {
    console.log(`Backend exited with code ${code}`)
    backendProcess = null
  })
}

app.whenReady().then(() => {
  // Strip macOS quarantine flag from the app bundle + backend binary on first run
  removeQuarantine()

  // Show window immediately — frontend has a "Retry" button while backend starts
  createWindow()

  // Start backend
  startBackend()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill()
  }
})
