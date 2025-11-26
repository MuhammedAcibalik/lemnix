#!/bin/bash
# ============================================================================
# WAL Archive Management Script
# ============================================================================
# This script manages Write-Ahead Log (WAL) archives for PostgreSQL:
# - Cleans old WAL archives based on retention policy
# - Verifies archive integrity
# - Monitors archive status
# - Optionally copies archives to secondary backup location
#
# Usage:
#   ./backup-wal.sh [clean|verify|status|copy-secondary]
#
# Environment Variables:
#   WAL_ARCHIVE_PATH: Path to WAL archive directory (default: Docker-aware)
#   WAL_RETENTION_DAYS: Number of days to retain WAL archives (default: 30)
#   SECONDARY_WAL_ARCHIVE_PATH: Secondary backup location (optional)
#   LOG_DIR: Log directory (default: ./logs/lemnix)
# ============================================================================

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================
# Detect if running in Docker or use environment variable
if [[ -n "${WAL_ARCHIVE_PATH:-}" ]]; then
    WAL_ARCHIVE_PATH="${WAL_ARCHIVE_PATH}"
elif [[ -d "/var/lib/postgresql/wal_archive" ]]; then
    WAL_ARCHIVE_PATH="/var/lib/postgresql/wal_archive"
else
    WAL_ARCHIVE_PATH="./backups/wal_archive"
fi

WAL_RETENTION_DAYS="${WAL_RETENTION_DAYS:-30}"
SECONDARY_WAL_ARCHIVE_PATH="${SECONDARY_WAL_ARCHIVE_PATH:-}"
LOG_DIR="${LOG_DIR:-./logs/lemnix}"
LOG_FILE="${LOG_FILE:-${LOG_DIR}/wal-backup.log}"

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
# Clean Old WAL Archives
# ============================================================================
clean_old_archives() {
    log_info "Starting WAL archive cleanup (retention: ${WAL_RETENTION_DAYS} days)"
    
    if [[ ! -d "$WAL_ARCHIVE_PATH" ]]; then
        log_error "WAL archive directory does not exist: $WAL_ARCHIVE_PATH"
        return 1
    fi
    
    # Calculate cutoff date
    local cutoff_timestamp
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS date command
        cutoff_timestamp=$(date -v-${WAL_RETENTION_DAYS}d +%s)
    else
        # Linux date command
        cutoff_timestamp=$(date -d "${WAL_RETENTION_DAYS} days ago" +%s)
    fi
    
    local deleted_count=0
    local freed_space=0
    
    # Find and delete old WAL files
    while IFS= read -r -d '' file; do
        local file_timestamp
        if [[ "$OSTYPE" == "darwin"* ]]; then
            file_timestamp=$(stat -f %m "$file")
        else
            file_timestamp=$(stat -c %Y "$file")
        fi
        
        if [[ $file_timestamp -lt $cutoff_timestamp ]]; then
            local file_size
            if [[ "$OSTYPE" == "darwin"* ]]; then
                file_size=$(stat -f %z "$file")
            else
                file_size=$(stat -c %s "$file")
            fi
            
            if rm -f "$file"; then
                ((deleted_count++))
                ((freed_space += file_size))
                log_info "Deleted old WAL archive: $(basename "$file")"
            else
                log_error "Failed to delete: $file"
            fi
        fi
    done < <(find "$WAL_ARCHIVE_PATH" -type f -name "*.wal" -o -name "*.backup" -print0 2>/dev/null || true)
    
    log_info "Cleanup completed: $deleted_count files deleted, $(numfmt --to=iec-i --suffix=B $freed_space 2>/dev/null || echo "${freed_space} bytes") freed"
    return 0
}

# ============================================================================
# Verify WAL Archive Integrity
# ============================================================================
verify_archives() {
    log_info "Verifying WAL archive integrity"
    
    if [[ ! -d "$WAL_ARCHIVE_PATH" ]]; then
        log_error "WAL archive directory does not exist: $WAL_ARCHIVE_PATH"
        return 1
    fi
    
    local total_files=0
    local corrupted_files=0
    
    # Check each WAL file
    while IFS= read -r -d '' file; do
        ((total_files++))
        
        # Basic integrity check: file should not be empty and should be readable
        if [[ ! -s "$file" ]]; then
            log_warn "Empty or corrupted WAL file: $(basename "$file")"
            ((corrupted_files++))
        fi
    done < <(find "$WAL_ARCHIVE_PATH" -type f \( -name "*.wal" -o -name "*.backup" \) -print0 2>/dev/null || true)
    
    if [[ $corrupted_files -eq 0 ]]; then
        log_info "Archive verification passed: $total_files files checked, all valid"
        return 0
    else
        log_error "Archive verification failed: $corrupted_files corrupted files found"
        return 1
    fi
}

# ============================================================================
# Show WAL Archive Status
# ============================================================================
show_status() {
    log_info "WAL Archive Status"
    echo "=========================================="
    echo "Archive Path: $WAL_ARCHIVE_PATH"
    echo "Retention: $WAL_RETENTION_DAYS days"
    echo ""
    
    if [[ ! -d "$WAL_ARCHIVE_PATH" ]]; then
        echo "Status: ERROR - Directory does not exist"
        return 1
    fi
    
    local total_files
    total_files=$(find "$WAL_ARCHIVE_PATH" -type f \( -name "*.wal" -o -name "*.backup" \) 2>/dev/null | wc -l | tr -d ' ')
    
    local total_size
    if [[ "$OSTYPE" == "darwin"* ]]; then
        total_size=$(du -sh "$WAL_ARCHIVE_PATH" 2>/dev/null | cut -f1 || echo "0")
    else
        total_size=$(du -sh "$WAL_ARCHIVE_PATH" 2>/dev/null | cut -f1 || echo "0")
    fi
    
    echo "Total Files: $total_files"
    echo "Total Size: $total_size"
    echo ""
    
    # Show oldest and newest files
    local oldest_file
    oldest_file=$(find "$WAL_ARCHIVE_PATH" -type f \( -name "*.wal" -o -name "*.backup" \) -printf '%T@ %p\n' 2>/dev/null | sort -n | head -1 | cut -d' ' -f2- || echo "N/A")
    local newest_file
    newest_file=$(find "$WAL_ARCHIVE_PATH" -type f \( -name "*.wal" -o -name "*.backup" \) -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2- || echo "N/A")
    
    echo "Oldest Archive: $(basename "$oldest_file" 2>/dev/null || echo "N/A")"
    echo "Newest Archive: $(basename "$newest_file" 2>/dev/null || echo "N/A")"
    echo "=========================================="
    
    return 0
}

# ============================================================================
# Copy WAL Archives to Secondary Location
# ============================================================================
copy_to_secondary() {
    if [[ -z "$SECONDARY_WAL_ARCHIVE_PATH" ]]; then
        log_error "Secondary WAL archive path not configured (SECONDARY_WAL_ARCHIVE_PATH)"
        return 1
    fi
    
    log_info "Copying WAL archives to secondary location: ${SECONDARY_WAL_ARCHIVE_PATH}"
    
    if [[ ! -d "$WAL_ARCHIVE_PATH" ]]; then
        log_error "WAL archive directory does not exist: $WAL_ARCHIVE_PATH"
        return 1
    fi
    
    # Create secondary directory if it doesn't exist
    mkdir -p "$SECONDARY_WAL_ARCHIVE_PATH"
    
    # Copy all WAL files to secondary location
    local copied_count=0
    local failed_count=0
    
    while IFS= read -r -d '' file; do
        local dest_file="${SECONDARY_WAL_ARCHIVE_PATH}/$(basename "$file")"
        
        # Skip if file already exists in destination
        if [[ -f "$dest_file" ]]; then
            continue
        fi
        
        if cp "$file" "$dest_file"; then
            ((copied_count++))
            log_info "Copied: $(basename "$file")"
        else
            ((failed_count++))
            log_error "Failed to copy: $(basename "$file")"
        fi
    done < <(find "$WAL_ARCHIVE_PATH" -type f \( -name "*.wal" -o -name "*.backup" \) -print0 2>/dev/null || true)
    
    if [[ $failed_count -eq 0 ]]; then
        log_info "Secondary copy completed: $copied_count files copied successfully"
        return 0
    else
        log_error "Secondary copy completed with errors: $copied_count succeeded, $failed_count failed"
        return 1
    fi
}

# ============================================================================
# Main Script
# ============================================================================
main() {
    local command="${1:-status}"
    
    case "$command" in
        clean)
            clean_old_archives
            ;;
        verify)
            verify_archives
            ;;
        status)
            show_status
            ;;
        copy-secondary)
            copy_to_secondary
            ;;
        *)
            echo "Usage: $0 [clean|verify|status|copy-secondary]"
            echo ""
            echo "Commands:"
            echo "  clean            - Remove old WAL archives based on retention policy"
            echo "  verify           - Verify integrity of WAL archives"
            echo "  status           - Show current WAL archive status"
            echo "  copy-secondary   - Copy WAL archives to secondary backup location"
            exit 1
            ;;
    esac
}

main "$@"

