/**
 * @fileoverview Algorithms Tab Component for Optimization Info Dialog
 * @module AlgorithmsTab
 * @version 1.0.0
 */

import React from 'react';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { messages } from '../constants';
import { AlgorithmsTabProps } from '../types';

/**
 * Algorithms Tab Component
 */
export const AlgorithmsTab: React.FC<AlgorithmsTabProps> = ({
  algorithms,
  expandedAlgorithm,
  onAlgorithmExpand
}) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        {messages.algorithms.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {messages.algorithms.description}
      </Typography>

      {algorithms.map((algo) => (
        <Accordion 
          key={algo.id}
          expanded={expandedAlgorithm === algo.id}
          onChange={(e, isExpanded) => onAlgorithmExpand(isExpanded ? algo.id : false)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              {algo.icon}
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {algo.turkishName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {algo.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={algo.complexity} size="small" color="primary" variant="outlined" />
                <Chip label={algo.efficiency} size="small" color="success" variant="outlined" />
                <Chip label={algo.speed} size="small" color="info" variant="outlined" />
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" paragraph>
                  {algo.description}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="success.main" gutterBottom>
                  Avantajlar
                </Typography>
                <List dense>
                  {algo.pros.map((pro, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon><CheckIcon fontSize="small" color="success" /></ListItemIcon>
                      <ListItemText primary={pro} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="warning.main" gutterBottom>
                  Dezavantajlar
                </Typography>
                <List dense>
                  {algo.cons.map((con, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon><CloseIcon fontSize="small" color="warning" /></ListItemIcon>
                      <ListItemText primary={con} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info" variant="outlined">
                  <strong>En uygun kullanım:</strong> {algo.bestFor}
                </Alert>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};
