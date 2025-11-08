/**
 * EmptyState Component
 * Displays friendly empty state with icon, message, and optional action
 */

import React from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import { useDesignSystem } from '@/shared/hooks';

interface EmptyStateProps {
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly description: string;
  readonly action?: {
    readonly label: string;
    readonly onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  const ds = useDesignSystem();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: ds.spacing['12'],
        px: ds.spacing['4'],
        textAlign: 'center',
      }}
    >
      <Stack spacing={ds.spacing['3']} alignItems="center" maxWidth="400px">
        {icon}
        <Typography
          variant="h5"
          sx={{
            fontWeight: ds.typography.fontWeight.semibold,
            color: ds.colors.text.primary,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: ds.colors.text.secondary,
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
        {action && (
          <Button
            variant="contained"
            onClick={action.onClick}
            sx={{
              mt: ds.spacing['2'],
              height: ds.componentSizes.button.medium.height,
              borderRadius: `${ds.borderRadius.button}px`,
              background: ds.gradients.primary,
              color: '#ffffff',
              '&:hover': {
                background: ds.gradients.primary,
                opacity: 0.9,
              },
            }}
          >
            {action.label}
          </Button>
        )}
      </Stack>
    </Box>
  );
};

