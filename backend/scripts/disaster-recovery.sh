#!/bin/bash
# ============================================================================
# Disaster Recovery Script for LEMNIX Database
# ============================================================================
# This script automates disaster recovery procedures for the LEMNIX database.
#
# Usage:
#   ./disaster-recovery.sh <command> [options]
#
# Commands:
#   identify-latest-backup    - Find latest backup file
#   restore-full              - Restore from full backup
#   restore-pitr              - Point-in-time recovery
#   verify-restore            - Verify restored database
#   test-restore              - Test restore to temporary database
# ============================================================================

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================
BACKUP_DIR="${BACKUP_DIR:-./backups}"

# Detect WAL archive directory (Docker-aware)
if [[ -n "${WAL_ARCHIVE_DIR:-}" ]]; then
    WAL_ARCHIVE_DIR="${WAL_ARCHIVE_DIR}"
elif [[ -d "/var/lib/postgresql/wal_archive" ]]; then
    WAL_ARCHIVE_DIR="/var/lib/postgresql/wal_archive"
else
    WAL_ARCHIVE_DIR="./backups/wal_archive"
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-lemnix_db}"
DB_USER="${DB_USER:-lemnix_user}"
DB_PASSWORD="${DB_PASSWORD:-}"

# Detect PGDATA (Docker-aware)
if [[ -n "${PGDATA:-}" ]]; then
    PGDATA="${PGDATA}"
elif [[ -d "/var/lib/postgresql/data" ]]; then
    PGDATA="/var/lib/postgresql/data"
else
    PGDATA="./data/postgresql"
fi

LOG_DIR="${LOG_DIR:-./logs/lemnix}"
LOG_FILE="${LOG_FILE:-${LOG_DIR}/disaster-recovery.log}"

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# ============================================================================
# Logging Functions
# ============================================================================
log() {
    local level="$1"
    shift
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*" | tee -a "$LOG_FILE"
}

log_info() {
    log "INFO" "$@"
}

log_warn() {
    log "WARN" "$@"
}

log_error() {
    log "ERROR" "$@"
}

# ============================================================================
# Helper Functions
# ============================================================================
check_prerequisites() {
    log_info "Checking prerequisites"
    
    local missing=0
    
    if ! command -v psql &> /dev/null; then
        log_error "psql not found. Please install PostgreSQL client."
        missing=1
    fi
    
    if ! command -v pg_dump &> /dev/null; then
        log_error "pg_dump not found. Please install PostgreSQL client."
        missing=1
    fi
    
    if [[ -z "$DB_PASSWORD" ]]; then
        log_warn "DB_PASSWORD not set. Will prompt for password."
    fi
    
    if [[ $missing -eq 1 ]]; then
        log_error "Prerequisites check failed"
        exit 1
    fi
    
    log_info "Prerequisites check passed"
}

set_pgpassword() {
    if [[ -n "$DB_PASSWORD" ]]; then
        export PGPASSWORD="$DB_PASSWORD"
    fi
}

# ============================================================================
# Identify Latest Backup
# ============================================================================
identify_latest_backup() {
    log_info "Identifying latest backup"
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log_error "Backup directory does not exist: $BACKUP_DIR"
        return 1
    fi
    
    local latest_backup
    latest_backup=$(find "$BACKUP_DIR" -name "backup_full_*.sql*" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
    
    if [[ -z "$latest_backup" ]]; then
        log_error "No backup files found in $BACKUP_DIR"
        return 1
    fi
    
    local file_size
    if [[ "$OSTYPE" == "darwin"* ]]; then
        file_size=$(stat -f %z "$latest_backup")
    else
        file_size=$(stat -c %s "$latest_backup")
    fi
    
    local file_date
    if [[ "$OSTYPE" == "darwin"* ]]; then
        file_date=$(stat -f %Sm "$latest_backup")
    else
        file_date=$(stat -c %y "$latest_backup")
    fi
    
    echo "Latest Backup:"
    echo "  File: $latest_backup"
    echo "  Size: $(numfmt --to=iec-i --suffix=B $file_size 2>/dev/null || echo "${file_size} bytes")"
    echo "  Date: $file_date"
    
    log_info "Latest backup identified: $(basename "$latest_backup")"
    echo "$latest_backup"
}

# ============================================================================
# Restore Full Backup
# ============================================================================
restore_full() {
    local backup_file="${1:-}"
    local verify="${2:-false}"
    
    if [[ -z "$backup_file" ]]; then
        log_error "Backup file not specified"
        echo "Usage: restore-full <backup-file> [verify]"
        return 1
    fi
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi
    
    log_info "Starting full database restore"
    log_info "Backup file: $backup_file"
    
    set_pgpassword
    
    # Decompress if needed
    local restore_file="$backup_file"
    if [[ "$backup_file" == *.gz ]]; then
        restore_file="${backup_file%.gz}"
        log_info "Decompressing backup"
        gunzip -k "$backup_file" || {
            log_error "Failed to decompress backup"
            return 1
        }
    elif [[ "$backup_file" == *.bz2 ]]; then
        restore_file="${backup_file%.bz2}"
        log_info "Decompressing backup"
        bzip2 -dk "$backup_file" || {
            log_error "Failed to decompress backup"
            return 1
        }
    elif [[ "$backup_file" == *.xz ]]; then
        restore_file="${backup_file%.xz}"
        log_info "Decompressing backup"
        xz -dk "$backup_file" || {
            log_error "Failed to decompress backup"
            return 1
        }
    fi
    
    # Drop existing database (if exists)
    log_info "Dropping existing database (if exists)"
    dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" 2>/dev/null || true
    
    # Create new database
    log_info "Creating new database"
    createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" || {
        log_error "Failed to create database"
        return 1
    }
    
    # Restore backup
    log_info "Restoring backup (this may take a while)"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$restore_file" || {
        log_error "Failed to restore backup"
        return 1
    }
    
    # Clean up decompressed file
    if [[ "$restore_file" != "$backup_file" ]]; then
        rm -f "$restore_file"
    fi
    
    log_info "Full restore completed"
    
    # Verify if requested
    if [[ "$verify" == "true" || "$verify" == "verify" ]]; then
        verify_restore
    fi
}

# ============================================================================
# Point-in-Time Recovery (PITR)
# ============================================================================
restore_pitr() {
    local backup_file="${1:-}"
    local target_time="${2:-}"
    
    if [[ -z "$backup_file" ]]; then
        log_error "Backup file not specified"
        echo "Usage: restore-pitr <backup-file> <target-time>"
        echo "  target-time format: 'YYYY-MM-DD HH:MM:SS'"
        return 1
    fi
    
    if [[ -z "$target_time" ]]; then
        log_error "Target time not specified"
        return 1
    fi
    
    log_info "Starting point-in-time recovery"
    log_info "Backup file: $backup_file"
    log_info "Target time: $target_time"
    
    # First restore full backup
    restore_full "$backup_file" false
    
    # Configure PITR
    log_info "Configuring point-in-time recovery"
    
    # Create recovery.signal file
    touch "$PGDATA/recovery.signal" || {
        log_error "Failed to create recovery.signal file"
        return 1
    }
    
    # Configure recovery settings
    {
        echo "recovery_target_time = '$target_time'"
        echo "restore_command = 'cp $WAL_ARCHIVE_DIR/%f %p'"
    } >> "$PGDATA/postgresql.conf" || {
        log_error "Failed to configure recovery settings"
        return 1
    }
    
    log_info "PITR configured. Restart PostgreSQL to begin recovery."
    log_info "Recovery will stop at: $target_time"
}

# ============================================================================
# Verify Restore
# ============================================================================
verify_restore() {
    log_info "Verifying restored database"
    
    set_pgpassword
    
    # Check database connection
    if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &>/dev/null; then
        log_error "Cannot connect to database"
        return 1
    fi
    
    # Check critical tables
    local tables=("users" "cutting_lists" "cutting_list_items" "optimizations")
    local missing_tables=0
    
    for table in "${tables[@]}"; do
        if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\d $table" &>/dev/null; then
            log_error "Critical table missing: $table"
            ((missing_tables++))
        else
            local count
            count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM $table;" | tr -d ' ')
            log_info "Table $table: $count rows"
        fi
    done
    
    if [[ $missing_tables -gt 0 ]]; then
        log_error "Verification failed: $missing_tables tables missing"
        return 1
    fi
    
    # Check foreign key constraints
    local fk_count
    fk_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY';" | tr -d ' ')
    
    if [[ $fk_count -eq 0 ]]; then
        log_warn "No foreign key constraints found"
    else
        log_info "Foreign key constraints: $fk_count"
    fi
    
    log_info "Database verification completed successfully"
    return 0
}

# ============================================================================
# Test Restore
# ============================================================================
test_restore() {
    local backup_file="${1:-}"
    
    if [[ -z "$backup_file" ]]; then
        backup_file=$(identify_latest_backup)
    fi
    
    local test_db_name="${DB_NAME}_test_restore_$(date +%s)"
    
    log_info "Testing restore to temporary database: $test_db_name"
    
    set_pgpassword
    
    # Restore to test database
    local original_db_name="$DB_NAME"
    DB_NAME="$test_db_name"
    
    restore_full "$backup_file" true
    
    # Clean up test database
    log_info "Cleaning up test database"
    dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$test_db_name" || true
    
    DB_NAME="$original_db_name"
    
    log_info "Test restore completed"
}

# ============================================================================
# Main Script
# ============================================================================
main() {
    local command="${1:-}"
    
    if [[ -z "$command" ]]; then
        echo "Usage: $0 <command> [options]"
        echo ""
        echo "Commands:"
        echo "  identify-latest-backup              - Find latest backup file"
        echo "  restore-full <backup-file> [verify]  - Restore from full backup"
        echo "  restore-pitr <backup-file> <time>    - Point-in-time recovery"
        echo "  verify-restore                        - Verify restored database"
        echo "  test-restore [backup-file]            - Test restore to temporary database"
        exit 1
    fi
    
    check_prerequisites
    
    case "$command" in
        identify-latest-backup)
            identify_latest_backup
            ;;
        restore-full)
            restore_full "${2:-}" "${3:-false}"
            ;;
        restore-pitr)
            restore_pitr "${2:-}" "${3:-}"
            ;;
        verify-restore)
            verify_restore
            ;;
        test-restore)
            test_restore "${2:-}"
            ;;
        *)
            log_error "Unknown command: $command"
            exit 1
            ;;
    esac
}

main "$@"

