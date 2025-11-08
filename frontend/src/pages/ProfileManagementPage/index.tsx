/**
 * Profile Management Page
 * @module pages/ProfileManagementPage
 */

import React from 'react';
import { ProfileManagementPanel } from '@/widgets/profile-management-panel';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

const ProfileManagementPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <ProfileManagementPanel />
    </ErrorBoundary>
  );
};

export default ProfileManagementPage;

