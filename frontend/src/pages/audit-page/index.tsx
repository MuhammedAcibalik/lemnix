/**
 * Audit Page
 * Enterprise audit log management page
 * 
 * @module pages/audit-page
 * @version 1.0.0
 */

import React from 'react';
import { Container, Box } from '@mui/material';
import { useDesignSystem } from '@/shared/hooks';
import { AuditHistoryWidget } from '@/widgets/audit-history';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

/**
 * Audit Page Component
 * 
 * Architecture:
 * - Page layer: Composition only
 * - Business logic: In widget layer
 * - Data fetching: In entity layer
 * 
 * Permissions:
 * - Requires: VIEW_SECURITY_LOGS permission
 * - Backend enforces RBAC
 */
const AuditPage: React.FC = () => {
  const ds = useDesignSystem();

  return (
    <ErrorBoundary>
      <Container maxWidth="xl">
        <Box
          sx={{
            py: ds.spacing['6'],
            px: ds.spacing['4'],
          }}
        >
          {/* Widget handles all UI and logic */}
          <AuditHistoryWidget
            showStatistics={true}
            defaultLimit={50}
            enableExport={true}
          />
        </Box>
      </Container>
    </ErrorBoundary>
  );
};

export default AuditPage;

