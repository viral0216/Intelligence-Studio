#!/usr/bin/env node
/**
 * Intelligence Studio — Demo GIF Generator
 *
 * Launches headless Chrome via Puppeteer, navigates through key features,
 * takes screenshots, and combines them into an animated GIF.
 *
 * Prerequisites:
 *   - Backend running on http://127.0.0.1:8000
 *   - Frontend (Vite) running on http://localhost:5173
 *   - ImageMagick installed (`brew install imagemagick`)
 *
 * Usage:
 *   node scripts/capture-demo.mjs
 */

import puppeteer from 'puppeteer'
import { execSync } from 'child_process'
import { mkdirSync, existsSync, readdirSync, unlinkSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..')
const FRAMES_DIR = path.join(PROJECT_ROOT, 'docs', 'demo-frames')
const OUTPUT_GIF = path.join(PROJECT_ROOT, 'docs', 'demo.gif')
const APP_URL = process.env.DEMO_URL || 'http://localhost:5173'

const VIEWPORT = { width: 1400, height: 900 }

// Ensure output directories exist
mkdirSync(FRAMES_DIR, { recursive: true })

// Clean old frames
for (const f of readdirSync(FRAMES_DIR)) {
  if (f.endsWith('.png')) unlinkSync(path.join(FRAMES_DIR, f))
}

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function screenshot(page, name, stepNum) {
  const filename = `frame_${String(stepNum).padStart(2, '0')}_${name}.png`
  const filepath = path.join(FRAMES_DIR, filename)
  await page.screenshot({ path: filepath, fullPage: false })
  console.log(`  [${stepNum}] Captured: ${filename}`)
  return filepath
}

async function main() {
  console.log('\n=== Intelligence Studio Demo Capture ===\n')

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: VIEWPORT,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()

  // Set dark theme in localStorage before loading
  await page.goto(APP_URL, { waitUntil: 'networkidle0', timeout: 15000 })
  await delay(1500)

  let step = 1

  // --- Frame 1: Main view (API Explorer + Request Composer) ---
  console.log('[1/6] Main API Explorer view...')
  await screenshot(page, 'main_explorer', step++)

  // --- Frame 2: Click a preset API to populate the request ---
  console.log('[2/6] Select an API endpoint...')
  // Expand a sidebar category and click an endpoint
  try {
    // Click on a sidebar category (e.g., first expandable item)
    const sidebarItems = await page.$$('.sidebar-category, .preset-category, [class*="category"]')
    if (sidebarItems.length > 0) {
      await sidebarItems[0].click()
      await delay(500)
    }
    // Try clicking a preset endpoint
    const endpoints = await page.$$('.preset-item, .endpoint-item, [class*="preset"]')
    if (endpoints.length > 0) {
      await endpoints[0].click()
      await delay(800)
    }
  } catch (e) {
    console.log('  (skipped preset selection)')
  }
  await screenshot(page, 'endpoint_selected', step++)

  // --- Frame 3: Settings modal ---
  console.log('[3/6] Settings modal...')
  try {
    // Click settings button
    const settingsBtn = await page.$('button[title="Settings"]')
    if (settingsBtn) {
      await settingsBtn.click()
      await delay(800)
    }
  } catch (e) {
    console.log('  (settings button not found)')
  }
  await screenshot(page, 'settings_modal', step++)

  // Close settings
  try {
    const closeBtn = await page.$('.modal-close, [class*="close"], button:has(svg.lucide-x)')
    if (closeBtn) {
      await closeBtn.click()
      await delay(500)
    } else {
      await page.keyboard.press('Escape')
      await delay(500)
    }
  } catch (e) {
    await page.keyboard.press('Escape')
    await delay(500)
  }

  // --- Frame 4: AI Assistant mode ---
  console.log('[4/6] AI Assistant view...')
  try {
    // Click AI Assistant button in header
    const aiButtons = await page.$$('button')
    for (const btn of aiButtons) {
      const text = await page.evaluate(el => el.textContent, btn)
      if (text && text.includes('AI Assistant')) {
        await btn.click()
        await delay(1000)
        break
      }
    }
  } catch (e) {
    console.log('  (AI Assistant button not found)')
  }
  await screenshot(page, 'ai_assistant', step++)

  // --- Frame 5: AI Assistant - different tab (Query or Visualize) ---
  console.log('[5/6] AI Query/Visualize tab...')
  try {
    const tabs = await page.$$('[class*="tab"], button')
    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent?.trim(), tab)
      if (text === 'Query' || text === 'Visualize') {
        await tab.click()
        await delay(800)
        break
      }
    }
  } catch (e) {
    console.log('  (tab not found)')
  }
  await screenshot(page, 'query_visualize', step++)

  // --- Frame 6: Toggle back to main + History panel ---
  console.log('[6/6] History panel...')
  try {
    // Toggle off AI Assistant first
    const buttons = await page.$$('button')
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn)
      if (text && text.includes('AI Assistant')) {
        await btn.click()
        await delay(500)
        break
      }
    }
    // Toggle History
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn)
      if (text && text.includes('History')) {
        await btn.click()
        await delay(800)
        break
      }
    }
  } catch (e) {
    console.log('  (History button not found)')
  }
  await screenshot(page, 'history_panel', step++)

  await browser.close()

  // --- Combine into GIF ---
  console.log('\nCombining frames into GIF...')
  const frames = readdirSync(FRAMES_DIR)
    .filter(f => f.endsWith('.png'))
    .sort()
    .map(f => path.join(FRAMES_DIR, f))

  if (frames.length === 0) {
    console.error('No frames captured!')
    process.exit(1)
  }

  // Use ImageMagick to create animated GIF
  // -delay 250 = 2.5 seconds per frame, -loop 0 = infinite loop
  const cmd = `convert -delay 250 -loop 0 -resize 1400x900 ${frames.join(' ')} "${OUTPUT_GIF}"`
  try {
    execSync(cmd, { stdio: 'inherit' })
    const size = (execSync(`ls -lh "${OUTPUT_GIF}"`).toString().split(/\s+/)[4])
    console.log(`\n=== Demo GIF created: docs/demo.gif (${size}) ===`)
    console.log(`    Frames: ${frames.length}`)
    console.log(`    Duration: ~${frames.length * 2.5}s per loop\n`)
  } catch (e) {
    console.error('ImageMagick convert failed:', e.message)
    console.log('Frames saved in docs/demo-frames/ — combine manually')
  }
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
