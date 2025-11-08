/**
 * @fileoverview Profile Group Details Component for Profile Optimization Results
 * @module ProfileGroupDetails
 * @version 1.0.0
 */

import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Grid
} from '@mui/material';
import {
  Info as InfoIcon
} from '@mui/icons-material';
import { ProfileGroupDetailsProps } from '../types';
import { messages } from '../constants';

/**
 * Profile Group Details Component
 */
export const ProfileGroupDetails: React.FC<ProfileGroupDetailsProps> = ({
  group,
  optimizationResult,
  onCuttingPlanDetails
}) => {
  return (
    <Box sx={{ 
      p: 2, 
      bgcolor: 'grey.50',
      borderTop: '1px solid',
      borderColor: 'divider'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          {group.profileType} - {messages.profileGroups.detailedPlan}
        </Typography>
        <Tooltip title={messages.profileGroups.cuttingPlanDescription} arrow>
          <IconButton
            onClick={() => {
              // Get real cutting data from the profile group
              const realStock = {
                length: optimizationResult.cuts?.[0]?.stockLength || 7000,
                count: group.cuts || 0,
                used: optimizationResult.cuts
                  ?.filter(cut => 
                    cut.segments.some(segment => segment.profileType === group.profileType)
                  )
                  ?.reduce((sum: number, cut: any) => sum + ((cut.usedLength as number) || 0), 0) || 0,
                waste: optimizationResult.cuts
                  ?.filter(cut => 
                    cut.segments.some(segment => segment.profileType === group.profileType)
                  )
                  ?.reduce((sum: number, cut: any) => sum + ((cut.remainingLength as number) || 0), 0) || 0,
                workOrderId: group.workOrders.join(', '),
                algorithmName: 'Profil Optimizasyonu',
                cuts: optimizationResult.cuts?.filter(cut => 
                  cut.segments.some(segment => segment.profileType === group.profileType)
                ) || [],
                totalPieces: optimizationResult.cuts
                  ?.filter(cut => 
                    cut.segments.some(segment => segment.profileType === group.profileType)
                  )
                  ?.reduce((sum: number, cut: any) => sum + ((cut.segmentCount as number) || 0), 0) || 0,
                efficiency: group.efficiency ? group.efficiency.toFixed(1) : "0.0",
                profileType: group.profileType
              };
              onCuttingPlanDetails(realStock);
            }}
            sx={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(30,64,175,0.3)',
              border: '2px solid rgba(255,255,255,0.2)',
              animation: 'lemnixRotate 3s linear infinite',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6b21a8 100%)',
                transform: 'scale(1.1)',
                animation: 'lemnixRotate 1s linear infinite',
                boxShadow: '0 6px 20px rgba(124,58,237,0.4)',
              },
              transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Bu profil tipine ait kesimleri göster */}
      {optimizationResult.cuts
        .filter(cut => 
          cut.segments.some(segment => segment.profileType === group.profileType)
        )
        .map((cut, index) => (
          <Paper key={cut.id} sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              {messages.profileGroups.cutting} {index + 1}: {cut.planLabel}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  {messages.profileGroups.stockLength}: {cut.stockLength} mm
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {messages.profileGroups.used}: {cut.usedLength} mm
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  {messages.profileGroups.remaining}: {cut.remainingLength} mm
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {messages.profileGroups.pieceCount}: {cut.segmentCount}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        ))}
    </Box>
  );
};
