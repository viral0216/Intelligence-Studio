const { app, BrowserWindow, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const { spawn, execSync } = require('child_process')

let mainWindow
let backendProcess

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
  const pythonPath = findPython()

  if (!pythonPath) {
    console.warn('Python not found — backend will not start automatically.')
    console.warn('The app will try to connect to http://127.0.0.1:8000')
    console.warn('Start the backend manually: cd backend && uvicorn app.main:app --port 8000')
    return
  }

  // In dev: backend is at ../backend relative to desktop/
  // In production (packaged): backend is bundled at process.resourcesPath/backend
  const backendDir = app.isPackaged
    ? path.join(process.resourcesPath, 'backend')
    : path.join(__dirname, '..', 'backend')

  if (!fs.existsSync(backendDir)) {
    console.warn(`Backend directory not found at: ${backendDir}`)
    return
  }

  // Run pip install async so the UI thread isn't blocked, then launch uvicorn
  const pipInstall = spawn(pythonPath, ['-m', 'pip', 'install', '-e', '.', '-q', '--disable-pip-version-check'], {
    cwd: backendDir,
    stdio: 'ignore',
  })

  const launchUvicorn = () => {
    console.log(`Starting backend with: ${pythonPath} in ${backendDir}`)
    backendProcess = spawn(pythonPath, ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'], {
      cwd: backendDir,
      env: { ...process.env, PORT: '8000' },
    })

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`)
    })

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend: ${data}`)
    })

    backendProcess.on('error', (err) => {
      console.error(`Failed to start backend: ${err.message}`)
      backendProcess = null
    })

    backendProcess.on('close', (code) => {
      console.log(`Backend exited with code ${code}`)
      backendProcess = null
    })
  }

  pipInstall.on('close', () => launchUvicorn())
  pipInstall.on('error', (err) => {
    console.warn(`pip install failed (${err.message}) — attempting to start backend anyway`)
    launchUvicorn()
  })
}

app.whenReady().then(() => {
  // Show window immediately — frontend has a "Retry" button while backend starts
  createWindow()

  // Start backend (may take a moment on first launch while pip installs deps)
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
