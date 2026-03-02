import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { spawn, execSync, type ChildProcess } from 'child_process'

/**
 * Vite plugin that auto-starts the Python backend server when running `npm run dev`.
 * Kills the backend when the dev server shuts down.
 */
function backendAutoStart(): Plugin {
  let backendProcess: ChildProcess | null = null

  function findPython(): string | null {
    for (const cmd of ['python3', 'python', '/opt/homebrew/bin/python3', '/usr/local/bin/python3']) {
      try {
        execSync(`${cmd} --version`, { stdio: 'ignore' })
        return cmd
      } catch {
        // not found
      }
    }
    return null
  }

  function isBackendRunning(): boolean {
    try {
      execSync('lsof -i :8000 -sTCP:LISTEN', { stdio: 'ignore' })
      return true
    } catch {
      return false
    }
  }

  return {
    name: 'backend-auto-start',
    configureServer() {
      // Only in dev mode, skip in build
      if (isBackendRunning()) {
        console.log('\x1b[36m[backend]\x1b[0m Already running on port 8000')
        return
      }

      const python = findPython()
      if (!python) {
        console.warn('\x1b[33m[backend]\x1b[0m Python not found — start backend manually: cd backend && uvicorn app.main:app --port 8000')
        return
      }

      const backendDir = path.resolve(__dirname, '..', 'backend')
      console.log(`\x1b[36m[backend]\x1b[0m Starting backend with ${python} in ${backendDir}`)

      backendProcess = spawn(python, ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'], {
        cwd: backendDir,
        env: { ...process.env, PORT: '8000' },
        stdio: ['ignore', 'pipe', 'pipe'],
      })

      backendProcess.stdout?.on('data', (data) => {
        const line = data.toString().trim()
        if (line) console.log(`\x1b[36m[backend]\x1b[0m ${line}`)
      })

      backendProcess.stderr?.on('data', (data) => {
        const line = data.toString().trim()
        if (line) console.log(`\x1b[36m[backend]\x1b[0m ${line}`)
      })

      backendProcess.on('error', (err) => {
        console.error(`\x1b[31m[backend]\x1b[0m Failed to start: ${err.message}`)
        backendProcess = null
      })

      backendProcess.on('close', (code) => {
        if (code !== null && code !== 0) {
          console.warn(`\x1b[33m[backend]\x1b[0m Exited with code ${code}`)
        }
        backendProcess = null
      })

      // Kill backend when Vite dev server shuts down
      const cleanup = () => {
        if (backendProcess) {
          console.log('\x1b[36m[backend]\x1b[0m Shutting down...')
          backendProcess.kill('SIGTERM')
          backendProcess = null
        }
      }
      process.on('exit', cleanup)
      process.on('SIGINT', cleanup)
      process.on('SIGTERM', cleanup)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), backendAutoStart()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  base: './',
  build: {
    outDir: 'dist',
  },
})
