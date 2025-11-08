/**
 * Audit Timeline View Component
 * Professional timeline visualization for audit logs
 * 
 * @module widgets/audit-history/ui
 * @version 1.0.0
 */

import React, { useMemo } from 'react';
import {
  Box,
  Stack,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Schedule as TimeIcon,
  Person as PersonIcon,
  Code as DetailsIcon,
} from '@mui/icons-material';
import { useDesignSystem } from '@/shared/hooks';
import {
  AUDIT_ACTION_CATALOG,
  SEVERITY_CATALOG,
  type AuditLogEntry,
} from '@/entities/audit';
import type { AuditSortConfig } from '../types';
import { alpha } from '@mui/material/styles';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Audit Timeline View Props
 */
export interface AuditTimelineViewProps {
  readonly logs: ReadonlyArray<AuditLogEntry>;
  readonly sort: AuditSortConfig;
  readonly onSortChange: (field: AuditSortConfig['field']) => void;
}

/**
 * Single Audit Log Item Component
 */
const AuditLogItem: React.FC<{ log: AuditLogEntry }> = ({ log }) => {
  const ds = useDesignSystem();
  const [expanded, setExpanded] = React.useState(false);

  const actionMeta = AUDIT_ACTION_CATALOG[log.action];
  const severityMeta = SEVERITY_CATALOG[log.severity];

  // Format timestamp - relative time
  const relativeTime = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(log.timestamp), {
        addSuffix: true,
        locale: tr,
      });
    } catch {
      return 'Bilinmeyen zaman';
    }
  }, [log.timestamp]);

  // Format absolute time
  const absoluteTime = useMemo(() => {
    try {
      return new Date(log.timestamp).toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return 'Geçersiz tarih';
    }
  }, [log.timestamp]);

  // Outcome color
  const outcomeColor = log.outcome === 'success' 
    ? ds.colors.success.main 
    : ds.colors.error.main;

  return (
    <Box
      sx={{
        position: 'relative',
        pl: ds.spacing['6'], // Space for timeline line
        pb: ds.spacing['4'],
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 18,
          top: 32,
          bottom: 0,
          width: 2,
          background: ds.colors.neutral[200],
        },
        '&:last-child::before': {
          display: 'none', // Remove line for last item
        },
      }}
    >
      {/* Timeline Dot */}
      <Box
        sx={{
          position: 'absolute',
          left: 10,
          top: 12,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: severityMeta.color,
          border: `3px solid ${ds.colors.background.paper}`,
          boxShadow: ds.shadows.soft.sm,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.625rem',
        }}
      >
        {severityMeta.icon}
      </Box>

      {/* Log Content Card */}
      <Box
        sx={{
          p: ds.spacing['3'],
          borderRadius: `${ds.borderRadius.md}px`,
          border: `1px solid ${ds.colors.neutral[200]}`,
          backgroundColor: ds.colors.background.paper,
          transition: ds.transitions.base,
          cursor: 'pointer',
          '&:hover': {
            borderColor: ds.colors.primary.main,
            boxShadow: ds.shadows.soft.md,
            transform: 'translateX(2px)',
          },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: ds.spacing['2'] }}>
          <Box sx={{ flex: 1 }}>
            {/* Action Title */}
            <Typography
              sx={{
                fontSize: '0.9375rem',
                fontWeight: ds.typography.fontWeight.semibold,
                color: ds.colors.text.primary,
                mb: ds.spacing['1'],
              }}
            >
              {actionMeta.icon} {actionMeta.label}
            </Typography>

            {/* Metadata Row */}
            <Stack direction="row" spacing={ds.spacing['2']} alignItems="center" flexWrap="wrap" useFlexGap>
              {/* Time */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['1'] }}>
                <TimeIcon sx={{ fontSize: 12, color: ds.colors.text.secondary }} />
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: ds.colors.text.secondary,
                  }}
                  title={absoluteTime}
                >
                  {relativeTime}
                </Typography>
              </Box>

              {/* User */}
              {log.userId && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['1'] }}>
                  <PersonIcon sx={{ fontSize: 12, color: ds.colors.text.secondary }} />
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: ds.colors.text.secondary,
                      fontFamily: 'monospace',
                    }}
                  >
                    {log.userId}
                  </Typography>
                </Box>
              )}

              {/* Duration */}
              {log.duration !== undefined && (
                <Chip
                  label={`${log.duration}ms`}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    background: alpha(ds.colors.neutral[500], 0.1),
                    color: ds.colors.neutral[700],
                  }}
                />
              )}
            </Stack>
          </Box>

          {/* Outcome Badge */}
          <Chip
            label={log.outcome === 'success' ? 'Başarılı' : 'Başarısız'}
            size="small"
            icon={
              log.outcome === 'success' ? (
                <Box component="span" sx={{ fontSize: '0.75rem' }}>✓</Box>
              ) : (
                <Box component="span" sx={{ fontSize: '0.75rem' }}>✗</Box>
              )
            }
            sx={{
              height: 24,
              fontWeight: 600,
              fontSize: '0.6875rem',
              background: alpha(outcomeColor, 0.1),
              color: outcomeColor,
              border: `1px solid ${alpha(outcomeColor, 0.3)}`,
            }}
          />

          {/* Expand Icon */}
          <IconButton
            size="small"
            sx={{
              color: ds.colors.text.secondary,
              transition: ds.transitions.fast,
            }}
          >
            {expanded ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
          </IconButton>
        </Box>

        {/* Expandable Details */}
        <Collapse in={expanded}>
          <Divider sx={{ my: ds.spacing['2'] }} />
          
          <Stack spacing={ds.spacing['2']}>
            {/* Error Message (if failure) */}
            {log.outcome === 'failure' && log.errorMessage && (
              <Box
                sx={{
                  p: ds.spacing['2'],
                  borderRadius: `${ds.borderRadius.sm}px`,
                  backgroundColor: alpha(ds.colors.error.main, 0.05),
                  border: `1px solid ${alpha(ds.colors.error.main, 0.2)}`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: ds.colors.error.main,
                    fontWeight: ds.typography.fontWeight.medium,
                    mb: ds.spacing['1'],
                  }}
                >
                  ❌ Hata Mesajı:
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: ds.colors.text.secondary,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {log.errorMessage}
                </Typography>
              </Box>
            )}

            {/* Details */}
            {Object.keys(log.details).length > 0 && (
              <Box
                sx={{
                  p: ds.spacing['2'],
                  borderRadius: `${ds.borderRadius.sm}px`,
                  backgroundColor: alpha(ds.colors.neutral[900], 0.02),
                  border: `1px solid ${ds.colors.neutral[200]}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['1'], mb: ds.spacing['1'] }}>
                  <DetailsIcon sx={{ fontSize: 12, color: ds.colors.text.secondary }} />
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: ds.typography.fontWeight.medium,
                      color: ds.colors.text.secondary,
                    }}
                  >
                    Detaylar:
                  </Typography>
                </Box>
                <Box
                  component="pre"
                  sx={{
                    fontSize: '0.6875rem',
                    fontFamily: 'monospace',
                    color: ds.colors.text.secondary,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {JSON.stringify(log.details, null, 2)}
                </Box>
              </Box>
            )}

            {/* Metadata Row */}
            <Stack direction="row" spacing={ds.spacing['3']} flexWrap="wrap" useFlexGap>
              {log.ipAddress && (
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    color: ds.colors.text.secondary,
                  }}
                >
                  IP: <strong>{log.ipAddress}</strong>
                </Typography>
              )}
              {log.userAgent && (
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    color: ds.colors.text.secondary,
                    maxWidth: 400,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={log.userAgent}
                >
                  User Agent: {log.userAgent}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Collapse>
      </Box>
    </Box>
  );
};

/**
 * Audit Timeline View Component
 * 
 * Single Responsibility: Render timeline of audit logs
 * 
 * Features:
 * - Chronological timeline with visual line
 * - Expandable details per log entry
 * - Color-coded severity indicators
 * - Relative and absolute timestamps
 * - Error message highlighting
 * - JSON detail viewer
 */
export const AuditTimelineView: React.FC<AuditTimelineViewProps> = ({
  logs,
  sort,
  onSortChange,
}) => {
  const ds = useDesignSystem();

  // Group logs by date (optional feature)
  const groupedLogs = useMemo(() => {
    const groups = new Map<string, AuditLogEntry[]>();

    logs.forEach(log => {
      try {
        const date = new Date(log.timestamp).toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        if (!groups.has(date)) {
          groups.set(date, []);
        }

        groups.get(date)?.push(log);
      } catch {
        // Invalid date - skip grouping
        const fallbackDate = 'Bilinmeyen Tarih';
        if (!groups.has(fallbackDate)) {
          groups.set(fallbackDate, []);
        }
        groups.get(fallbackDate)?.push(log);
      }
    });

    return groups;
  }, [logs]);

  return (
    <Stack spacing={ds.spacing['4']}>
      {/* Timeline Container */}
      {Array.from(groupedLogs.entries()).map(([date, dateLogs]) => (
        <Box key={date}>
          {/* Date Header */}
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: ds.typography.fontWeight.semibold,
              color: ds.colors.text.secondary,
              mb: ds.spacing['3'],
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {date}
          </Typography>

          {/* Logs for this date */}
          <Stack spacing={ds.spacing['2']}>
            {dateLogs.map(log => (
              <AuditLogItem key={log.id} log={log} />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};

