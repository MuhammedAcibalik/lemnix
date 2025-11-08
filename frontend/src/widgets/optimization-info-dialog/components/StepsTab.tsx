/**
 * @fileoverview Steps Tab Component for Optimization Info Dialog
 * @module StepsTab
 * @version 1.0.0
 */

import React from 'react';
import {
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  alpha,
  useTheme
} from '@mui/material';
import { messages } from '../constants';
import { StepsTabProps } from '../types';

/**
 * Steps Tab Component
 */
export const StepsTab: React.FC<StepsTabProps> = ({ optimizationSteps }) => {
  const theme = useTheme();

  return (
    <>
      <Typography variant="h6" gutterBottom>
        {messages.steps.title}
      </Typography>
      
      <Stepper orientation="vertical" activeStep={-1}>
        {optimizationSteps.map((step, index) => (
          <Step key={index} expanded>
            <StepLabel>
              <Typography variant="subtitle1" fontWeight="bold">
                {step.label}
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                {step.description}
              </Typography>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 2, mt: 3, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          {messages.steps.tips.title}
        </Typography>
        <List dense>
          {messages.steps.tips.items.map((tip, index) => (
            <ListItem key={index}>
              <ListItemText primary={tip} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </>
  );
};
