# ============================================================================
# Docker Secrets Creation Script (PowerShell)
# ============================================================================
# Creates Docker secrets for production deployment
# Usage: .\scripts\create-secrets.ps1

$ErrorActionPreference = "Stop"

Write-Host "🔐 Creating Docker secrets..." -ForegroundColor Cyan

# Check if running in Docker Swarm mode
$swarmInfo = docker info 2>&1 | Select-String "Swarm: active"
if (-not $swarmInfo) {
    Write-Host "⚠️  Docker Swarm is not active. Initializing swarm..." -ForegroundColor Yellow
    docker swarm init 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Swarm already initialized or error occurred" -ForegroundColor Yellow
    }
}

# Function to create secret
function Create-Secret {
    param(
        [string]$SecretName,
        [string]$SecretFile
    )
    
    $existingSecret = docker secret ls 2>&1 | Select-String $SecretName
    if ($existingSecret) {
        Write-Host "✅ Secret '$SecretName' already exists, skipping..." -ForegroundColor Green
    } else {
        if (Test-Path $SecretFile) {
            Write-Host "📝 Creating secret '$SecretName' from file '$SecretFile'..." -ForegroundColor Cyan
            docker secret create $SecretName $SecretFile
            if ($LASTEXITCODE -ne 0) {
                throw "Failed to create secret $SecretName"
            }
        } else {
            Write-Host "⚠️  File '$SecretFile' not found. Creating from secure input..." -ForegroundColor Yellow
            $secureValue = Read-Host "Please enter the value for $SecretName" -AsSecureString
            $plainValue = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
                [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
            )
            $plainValue | docker secret create $SecretName -
            if ($LASTEXITCODE -ne 0) {
                throw "Failed to create secret $SecretName"
            }
        }
    }
}

# Create secrets directory if it doesn't exist
$secretsDir = "secrets"
if (-not (Test-Path $secretsDir)) {
    New-Item -ItemType Directory -Path $secretsDir | Out-Null
}

# Generate POSTGRES_PASSWORD if not exists
$postgresPasswordFile = Join-Path $secretsDir "postgres_password.txt"
if (-not (Test-Path $postgresPasswordFile)) {
    Write-Host "🔑 Generating POSTGRES_PASSWORD..." -ForegroundColor Cyan
    $password = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $password | Out-File -FilePath $postgresPasswordFile -Encoding utf8 -NoNewline
    (Get-Item $postgresPasswordFile).Attributes = "Hidden"
}

# Generate JWT_SECRET if not exists
$jwtSecretFile = Join-Path $secretsDir "jwt_secret.txt"
if (-not (Test-Path $jwtSecretFile)) {
    Write-Host "🔑 Generating JWT_SECRET..." -ForegroundColor Cyan
    $secret = -join ((48..57) + (65..90) + (97..122) + (43,47,61) | Get-Random -Count 64 | ForEach-Object {[char]$_})
    $secret | Out-File -FilePath $jwtSecretFile -Encoding utf8 -NoNewline
    (Get-Item $jwtSecretFile).Attributes = "Hidden"
}

# Generate ENCRYPTION_MASTER_KEY if not exists
$encryptionKeyFile = Join-Path $secretsDir "encryption_master_key.txt"
if (-not (Test-Path $encryptionKeyFile)) {
    Write-Host "🔑 Generating ENCRYPTION_MASTER_KEY..." -ForegroundColor Cyan
    $key = -join ((48..57) + (65..90) + (97..122) + (43,47,61) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $key | Out-File -FilePath $encryptionKeyFile -Encoding utf8 -NoNewline
    (Get-Item $encryptionKeyFile).Attributes = "Hidden"
}

# Generate REDIS_PASSWORD if not exists
$redisPasswordFile = Join-Path $secretsDir "redis_password.txt"
if (-not (Test-Path $redisPasswordFile)) {
    Write-Host "🔑 Generating REDIS_PASSWORD..." -ForegroundColor Cyan
    $password = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $password | Out-File -FilePath $redisPasswordFile -Encoding utf8 -NoNewline
    (Get-Item $redisPasswordFile).Attributes = "Hidden"
}

# Generate GRAFANA_ADMIN_PASSWORD if not exists
$grafanaPasswordFile = Join-Path $secretsDir "grafana_admin_password.txt"
if (-not (Test-Path $grafanaPasswordFile)) {
    Write-Host "🔑 Generating GRAFANA_ADMIN_PASSWORD..." -ForegroundColor Cyan
    $password = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $password | Out-File -FilePath $grafanaPasswordFile -Encoding utf8 -NoNewline
    (Get-Item $grafanaPasswordFile).Attributes = "Hidden"
}

# Create Docker secrets
Create-Secret -SecretName "postgres_password" -SecretFile $postgresPasswordFile
Create-Secret -SecretName "jwt_secret" -SecretFile $jwtSecretFile
Create-Secret -SecretName "encryption_master_key" -SecretFile $encryptionKeyFile
Create-Secret -SecretName "redis_password" -SecretFile $redisPasswordFile
Create-Secret -SecretName "grafana_admin_password" -SecretFile $grafanaPasswordFile

Write-Host ""
Write-Host "✅ All secrets created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 List of secrets:" -ForegroundColor Cyan
docker secret ls | Select-String -Pattern "postgres_password|jwt_secret|encryption_master_key|redis_password|grafana_admin_password"

Write-Host ""
Write-Host "⚠️  IMPORTANT: Keep the secrets/ directory secure and never commit it to git!" -ForegroundColor Yellow
Write-Host "   Add 'secrets/' to .gitignore if not already present." -ForegroundColor Yellow

