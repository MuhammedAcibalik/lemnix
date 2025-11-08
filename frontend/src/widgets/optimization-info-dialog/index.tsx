/**
 * @fileoverview Optimization Info Dialog - Main Component
 * @module OptimizationInfoDialog
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import {
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Import modular components
import { TabPanel } from './components/TabPanel';
import { OverviewTab } from './components/OverviewTab';
import { AlgorithmsTab } from './components/AlgorithmsTab';
import { ParametersTab } from './components/ParametersTab';
import { StepsTab } from './components/StepsTab';
import { MetricsTab } from './components/MetricsTab';
import { SimulationTab } from './components/SimulationTab';

// Import hooks
import { useDialogState } from './hooks/useDialogState';

// Import types
import {
  OptimizationInfoDialogProps
} from './types';

// Import constants
import { 
  algorithms, 
  features, 
  optimizationSteps, 
  metrics, 
  trainingModules,
  dialogConfig,
  messages 
} from './constants';

/**
 * Optimization Info Dialog Component
 * 
 * Enterprise-grade optimization info dialog with modular architecture
 */
export const OptimizationInfoDialog: React.FC<OptimizationInfoDialogProps> = ({
  open,
  onClose
}) => {
  // Custom hooks for state and functionality
  const {
    tabValue,
    expandedAlgorithm,
    trainingMode,
    isTrainingActive,
    operatorProfile,
    workshopState,
    activeTab,
    onTabChange,
    onAlgorithmExpand,
    onTrainingModeChange,
    onStartTraining,
    onStopTraining,
    onResetTraining,
    onStartModule,
    onWorkshopStateChange,
    onActiveTabChange
  } = useDialogState({
    open,
    onClose
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={dialogConfig.maxWidth}
      fullWidth={dialogConfig.fullWidth}
      sx={{ zIndex: dialogConfig.zIndex }}
      PaperProps={{
        sx: {
          borderRadius: dialogConfig.borderRadius,
          minHeight: dialogConfig.minHeight
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            {messages.dialog.title}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={onTabChange} aria-label="info tabs">
            <Tab label="Genel Bakış" />
            <Tab label="Algoritmalar" />
            <Tab label="Parametreler" />
            <Tab label="Kullanım Adımları" />
            <Tab label="Metrikler" />
            <Tab label="Simülasyon" icon={<InfoIcon />} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <OverviewTab
            algorithms={algorithms}
            features={features}
            metrics={metrics}
            optimizationSteps={optimizationSteps}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <AlgorithmsTab
            algorithms={algorithms}
            expandedAlgorithm={expandedAlgorithm}
            onAlgorithmExpand={onAlgorithmExpand}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <ParametersTab features={features} />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <StepsTab optimizationSteps={optimizationSteps} />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <MetricsTab metrics={metrics} />
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <SimulationTab
            trainingMode={trainingMode}
            onTrainingModeChange={onTrainingModeChange}
            isTrainingActive={isTrainingActive}
            onStartTraining={onStartTraining}
            onStopTraining={onStopTraining}
            onResetTraining={onResetTraining}
            operatorProfile={operatorProfile}
            trainingModules={trainingModules}
            currentModule={0}
            onStartModule={onStartModule}
            activeTab={activeTab}
            onActiveTabChange={onActiveTabChange}
          />
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} variant="contained">
          {messages.dialog.closeButton}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OptimizationInfoDialog;
