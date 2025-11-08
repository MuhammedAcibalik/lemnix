/**
 * @fileoverview Profile Groups Tab Component for Profile Optimization Results
 * @module ProfileGroupsTab
 * @version 1.0.0
 */

import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Typography,
  Button,
  Badge,
  Collapse,
  Box,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { ProfileGroupsTabProps } from '../types';
import { messages, stylingConstants } from '../constants';
import { ProfileGroupRow } from './ProfileGroupRow';

/**
 * Profile Groups Tab Component
 */
export const ProfileGroupsTab: React.FC<ProfileGroupsTabProps> = ({
  result,
  expandedProfile,
  onProfileClick,
  onCuttingPlanDetails
}) => {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'primary.50' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Profil Tipi</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Kesim Sayısı</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Verimlilik</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Atık (mm)</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>İş Emirleri</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Detaylar</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {result.profileGroups.map((group) => (
            <ProfileGroupRow
              key={group.profileType}
              group={group}
              isExpanded={expandedProfile === group.profileType}
              onProfileClick={onProfileClick}
              onCuttingPlanDetails={onCuttingPlanDetails}
              optimizationResult={result.optimizationResult}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
