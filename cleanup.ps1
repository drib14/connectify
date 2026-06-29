# Connectify MERN Migration Cleanup Script
# Run this from the project root: c:\Users\jhond\Documents\connectify

Write-Host "=== Cleaning up old TypeScript/Next.js files ===" -ForegroundColor Cyan

# --- Server: Delete old TS files ---
Write-Host "`n[Server] Removing old TypeScript files..."
$serverFiles = @(
    "server\src\server.ts",
    "server\src\middlewares\auth.ts",
    "server\src\models\user.ts",
    "server\src\routes\auth.ts",
    "server\src\utils\crypto.ts",
    "server\tsconfig.json"
)

foreach ($file in $serverFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  Deleted: $file" -ForegroundColor Green
    } else {
        Write-Host "  Skipped (not found): $file" -ForegroundColor Yellow
    }
}

# --- Client: Delete old Next.js files ---
Write-Host "`n[Client] Removing old Next.js files..."
$clientFiles = @(
    "client\middleware.ts",
    "client\proxy.ts",
    "client\next.config.ts",
    "client\next-env.d.ts",
    "client\tsconfig.json",
    "client\eslint.config.mjs",
    "client\postcss.config.mjs",
    "client\AGENTS.md",
    "client\CLAUDE.md",
    "client\README.md"
)

foreach ($file in $clientFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  Deleted: $file" -ForegroundColor Green
    } else {
        Write-Host "  Skipped (not found): $file" -ForegroundColor Yellow
    }
}

# --- Client: Delete old app/ directory ---
Write-Host "`n[Client] Removing old Next.js app/ directory..."
if (Test-Path "client\app") {
    Remove-Item "client\app" -Recurse -Force
    Write-Host "  Deleted: client\app\" -ForegroundColor Green
}

# --- Client: Delete old .next/ build cache ---
Write-Host "`n[Client] Removing .next/ build cache..."
if (Test-Path "client\.next") {
    Remove-Item "client\.next" -Recurse -Force
    Write-Host "  Deleted: client\.next\" -ForegroundColor Green
}

# --- Delete old node_modules and reinstall ---
Write-Host "`n=== Reinstalling dependencies ===" -ForegroundColor Cyan

Write-Host "`n[Server] Cleaning and reinstalling..."
if (Test-Path "server\node_modules") {
    Remove-Item "server\node_modules" -Recurse -Force
    Write-Host "  Deleted: server\node_modules\" -ForegroundColor Green
}
if (Test-Path "server\package-lock.json") {
    Remove-Item "server\package-lock.json" -Force
    Write-Host "  Deleted: server\package-lock.json" -ForegroundColor Green
}
Set-Location "server"
npm install
Set-Location ".."

Write-Host "`n[Client] Cleaning and reinstalling..."
if (Test-Path "client\node_modules") {
    Remove-Item "client\node_modules" -Recurse -Force
    Write-Host "  Deleted: client\node_modules\" -ForegroundColor Green
}
if (Test-Path "client\package-lock.json") {
    Remove-Item "client\package-lock.json" -Force
    Write-Host "  Deleted: client\package-lock.json" -ForegroundColor Green
}
Set-Location "client"
npm install
Set-Location ".."

Write-Host "`n=== Migration cleanup complete! ===" -ForegroundColor Green
Write-Host "You can now start the dev servers:"
Write-Host "  Server: cd server && npm run dev"
Write-Host "  Client: cd client && npm run dev"
