# PostgreSQL Backup Script
# Automated backup for lemnix_db database
# Usage: .\scripts\backup-postgres.ps1

$ErrorActionPreference = "Stop"

# Configuration
$POSTGRES_BIN = "C:\Program Files\PostgreSQL\18\bin"
$DB_USER = "lemnix_user"
$DB_NAME = "lemnix_db"
$BACKUP_DIR = "backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\lemnix_db_$TIMESTAMP.backup"

# Create backup directory if not exists
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
    Write-Host "✅ Created backup directory: $BACKUP_DIR"
}

# Set password from environment or prompt
if (-not $env:PGPASSWORD) {
    $env:PGPASSWORD = "LemnixSecure2024"
}

Write-Host "`n🔄 Starting PostgreSQL backup..."
Write-Host "   Database: $DB_NAME"
Write-Host "   User: $DB_USER"
Write-Host "   Output: $BACKUP_FILE`n"

try {
    # Run pg_dump with custom format (compressed)
    & "$POSTGRES_BIN\pg_dump.exe" `
        -U $DB_USER `
        -d $DB_NAME `
        -F c `
        -b `
        -v `
        -f $BACKUP_FILE `
        2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        $fileSize = (Get-Item $BACKUP_FILE).Length / 1MB
        Write-Host "✅ Backup completed successfully!"
        Write-Host "   File: $BACKUP_FILE"
        Write-Host "   Size: $([math]::Round($fileSize, 2)) MB`n"
        
        # Keep only last 7 backups
        Get-ChildItem -Path $BACKUP_DIR -Filter "lemnix_db_*.backup" |
            Sort-Object LastWriteTime -Descending |
            Select-Object -Skip 7 |
            Remove-Item -Force
        
        Write-Host "🗑️  Old backups cleaned (keeping last 7)`n"
    } else {
        throw "pg_dump failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Host "❌ Backup failed: $_`n" -ForegroundColor Red
    exit 1
}

# Restore instructions
Write-Host "📝 To restore this backup, run:"
Write-Host "   pg_restore -U $DB_USER -d $DB_NAME -c $BACKUP_FILE`n"

