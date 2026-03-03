# macOS Code Signing & Notarization Guide

This guide explains how to properly sign and notarize the Intelligence Studio desktop app for macOS distribution.

## Overview

- **Unsigned builds** (default): Safe for local development, runs on your machine only
- **Signed & notarized builds** (distribution): Required to distribute via App Store or direct downloads

## Development Build (Unsigned)

For local development and testing, builds are **unsigned by default**:

```bash
./scripts/build-all.sh --desktop-mac
```

This produces an app that runs locally without code signing requirements.

## Distribution Build (Signed & Notarized)

To create a signed and notarized app for distribution, you need:

### 1. Apple Developer Credentials

You must be enrolled in the **Apple Developer Program** ($99/year) and have:

- **Apple ID**: Your Apple ID email
- **App-Specific Password**: Generated from [appleid.apple.com](https://appleid.apple.com)
  - Go to Security → App passwords → Generate password for "macOS Automation"
- **Team ID**: Found in Apple Developer Dashboard under Membership

### 2. Local Code Signing Certificate

Install your development certificate:

1. Go to [developer.apple.com/account](https://developer.apple.com/account)
2. Certificates, IDs & Profiles → Certificates
3. Create a "macOS Developer" or "3rd Party Mac Developer Application" certificate
4. Download and double-click to install in Keychain

Verify it's installed:
```bash
security find-identity -v -p codesigning
```

### 3. Build with Code Signing

Set environment variables and build:

```bash
export APPLE_ID="your-email@apple.com"
export APPLE_ID_PASSWORD="xxxx-xxxx-xxxx-xxxx"  # App-specific password, NOT your Apple ID password
export APPLE_TEAM_ID="XXXXXXXXXX"

./scripts/build-all.sh --desktop-mac
```

The build process will:
1. Compile and bundle the app
2. Sign it with your certificate
3. Submit it to Apple for notarization
4. Wait for notarization approval
5. Staple the notarization ticket to the app

### 4. Verify the Signed App

Check that the app is properly signed:

```bash
codesign -v dist/desktop/mac/Intelligence\ Studio.app
```

Check the notarization:

```bash
spctl -a -v dist/desktop/mac/Intelligence\ Studio.app
```

Expected output:
```
dist/desktop/mac/Intelligence Studio.app: accepted
```

## Distribution Methods

### Option A: Direct Download

Share the signed `.app` or `.zip` file directly. Users can run it without warnings.

### Option B: App Store

1. Register your app in App Store Connect
2. Update `appId` in `desktop/package.json` to your unique bundle ID
3. Build with App Store target configured in `electron-builder`

## Troubleshooting

### Authentication Failed

```
Error: notarize: Received error: 1147 (No auth token)
```

**Solution**: Verify credentials are correct and the app-specific password is generated (not your Apple ID password).

### Certificate Not Found

```
Error: Cannot find valid "3rd Party Mac Developer Application" identity
```

**Solution**: Install the certificate in Keychain as described above. Make sure it's under Keychain → login → Certificates.

### Notarization Timeout

The notarization process typically takes 5-15 minutes. If it times out, check the status later:

```bash
xcrun notaryutil log [submission-id] --keychain-profile="production"
```

### Invalid Entitlements

If notarization fails due to entitlements:

1. Check `desktop/build/entitlements.mac.plist`
2. Update if needed to match your app's actual capabilities
3. Rebuild

## Development Setup

For the first time setup, run:

```bash
cd desktop
npm install
```

This installs `electron-notarize` and other build dependencies.

## CI/CD Integration

For automated builds in GitHub Actions or similar:

1. **Store credentials as secrets** (never in code):
   - `APPLE_ID`
   - `APPLE_ID_PASSWORD`
   - `APPLE_TEAM_ID`

2. **Update workflow** to set environment variables:
   ```yaml
   - name: Build & Sign App
     env:
       APPLE_ID: ${{ secrets.APPLE_ID }}
       APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
       APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
     run: ./scripts/build-all.sh --desktop-mac
   ```

## References

- [Apple Developer - Code Signing Guide](https://developer.apple.com/support/code-signing/)
- [electron-notarize Documentation](https://github.com/electron/electron-notarize)
- [electron-builder macOS Configuration](https://www.electron.build/configuration/mac)
- [Notarizing macOS Software Before Distribution](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
