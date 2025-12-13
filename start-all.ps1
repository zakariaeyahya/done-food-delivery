# Script PowerShell pour lancer tous les services en parallèle
# Usage: .\start-all.ps1

Write-Host "🚀 Démarrage de tous les services..." -ForegroundColor Cyan
Write-Host ""

# Fonction pour lancer un service dans une nouvelle fenêtre PowerShell
function Start-Service {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [string]$Color
    )
    
    Write-Host "📦 Démarrage de $Name..." -ForegroundColor $Color
    
    # Créer une nouvelle fenêtre PowerShell pour chaque service
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Path'; Write-Host '[$Name]' -ForegroundColor $Color; $Command"
}

# Obtenir le chemin du répertoire du script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Lancer tous les services
Start-Service -Name "BACKEND" -Path "$ScriptDir\backend" -Command "npm run dev" -Color "Blue"
Start-Sleep -Milliseconds 500

Start-Service -Name "ADMIN" -Path "$ScriptDir\frontend\admin" -Command "npm run dev" -Color "Green"
Start-Sleep -Milliseconds 500

Start-Service -Name "CLIENT" -Path "$ScriptDir\frontend\client" -Command "npm run dev" -Color "Yellow"
Start-Sleep -Milliseconds 500

Start-Service -Name "RESTAURANT" -Path "$ScriptDir\frontend\restaurant" -Command "npm run dev" -Color "Magenta"
Start-Sleep -Milliseconds 500

Start-Service -Name "DELIVERER" -Path "$ScriptDir\frontend\deliverer" -Command "npm run dev" -Color "Cyan"
Start-Sleep -Milliseconds 500

Write-Host ""
Write-Host "✅ Tous les services ont été lancés dans des fenêtres séparées!" -ForegroundColor Green
Write-Host "💡 Pour arrêter tous les services, fermez les fenêtres PowerShell correspondantes." -ForegroundColor Yellow

