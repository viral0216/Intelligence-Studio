const { notarize } = require('electron-notarize')

module.exports = async function (context) {
  if (process.platform !== 'darwin') {
    return
  }

  const { electronPlatformName, appOutDir } = context

  if (electronPlatformName !== 'darwin') {
    return
  }

  // Skip notarization if credentials not provided
  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD) {
    console.warn('⚠️  Skipping notarization — set APPLE_ID and APPLE_ID_PASSWORD to enable')
    return
  }

  const appName = context.packager.appInfo.productFilename
  const appPath = `${appOutDir}/${appName}.app`

  console.log(`Notarizing ${appPath}...`)

  try {
    await notarize({
      appPath: appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    })

    console.log('✓ Notarization successful')
  } catch (err) {
    console.error('✗ Notarization failed:', err.message)
    throw err
  }
}
