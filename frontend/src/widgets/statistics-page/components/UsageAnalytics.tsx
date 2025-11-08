/**
 * @fileoverview Usage Analytics Component
 * @module UsageAnalytics
 * @version 1.0.0
 */

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';

interface UsageAnalyticsProps {
  data: Record<string, unknown>;
}

export const UsageAnalytics: React.FC<UsageAnalyticsProps> = ({ data }) => {
  if (!data) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No usage analytics available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Usage Analytics
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Profile Usage Statistics
              </Typography>
              <List>
                {Array.isArray(data.profileUsageCounts) ? data.profileUsageCounts.slice(0, 5).map((profile: Record<string, unknown>, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${String(profile.profileName || 'N/A')} (${String(profile.measurement || '0')}mm)`}
                      secondary={`${String(profile.usageCount || 0)} uses`}
                    />
                    <Chip
                      label={`${typeof profile.popularityScore === 'number' ? (profile.popularityScore * 100).toFixed(1) : '0.0'}%`}
                      size="small"
                      color="primary"
                    />
                  </ListItem>
                )) : null}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                User Activity Stats
              </Typography>
              <List>
                {Array.isArray(data.userActivityStats) ? data.userActivityStats.slice(0, 5).map((activity: Record<string, unknown>, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={String(activity.activityType || 'N/A')}
                      secondary={`${String(activity.count || 0)} activities`}
                    />
                  </ListItem>
                )) : null}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
