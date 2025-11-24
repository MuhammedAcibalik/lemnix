/**
 * @fileoverview Simulation Tab Component for Optimization Info Dialog
 * @module SimulationTab
 * @version 1.0.0
 */

import React from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import { Animation as AnimationIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material";
import { messages, tabConfig } from "../constants";
import { SimulationTabProps } from "../types";
import { TrainingOverview } from "./TrainingOverview";
import { SafetyTab } from "./SafetyTab";
import { MachineTab } from "./MachineTab";
import { CuttingTab } from "./CuttingTab";
import { AssessmentTab } from "./AssessmentTab";

/**
 * Simulation Tab Component
 */
export const SimulationTab: React.FC<SimulationTabProps> = ({
  trainingMode,
  onTrainingModeChange,
  isTrainingActive,
  onStartTraining,
  onStopTraining,
  onResetTraining,
  operatorProfile,
  trainingModules,
  currentModule,
  onStartModule,
  activeTab,
  onActiveTabChange,
}) => {
  const theme = useTheme();

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "bold",
          }}
        >
          <AnimationIcon sx={{ mr: 2, verticalAlign: "middle" }} />
          {messages.simulation.title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {messages.simulation.description}
        </Typography>
      </Box>

      {/* Tab Navigation */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => onActiveTabChange(newValue)}
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": {
              minHeight: 48,
              fontSize: "0.9rem",
              fontWeight: 600,
              textTransform: "none",
              borderBottom: "2px solid transparent",
              "&.Mui-selected": {
                borderBottom: `2px solid ${theme.palette.primary.main}`,
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          {tabConfig.trainingTabs?.map(
            (tab: { value: string; label: string }) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ),
          ) ?? []}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ height: "600px", overflow: "hidden" }}>
        {activeTab === "overview" && (
          <TrainingOverview
            trainingMode={trainingMode}
            onTrainingModeChange={onTrainingModeChange}
            isTrainingActive={isTrainingActive}
            onStartTraining={onStartTraining}
            onStopTraining={onStopTraining}
            onResetTraining={onResetTraining}
            operatorProfile={operatorProfile}
            trainingModules={trainingModules}
            currentModule={currentModule}
            onStartModule={onStartModule}
          />
        )}

        {activeTab === "safety" && (
          <SafetyTab
            workshopState={
              operatorProfile.workshopState ?? {
                machineOn: false,
                safetyGearOn: false,
                materialLoaded: false,
                cuttingInProgress: false,
                currentMaterial: null,
                machineSettings: {
                  bladeSpeed: 0,
                  cuttingDepth: 0,
                  feedRate: 0,
                  coolantFlow: 0,
                },
              }
            }
            onWorkshopStateChange={() => {}}
          />
        )}

        {activeTab === "machine" && (
          <MachineTab
            workshopState={
              operatorProfile.workshopState ?? {
                machineOn: false,
                safetyGearOn: false,
                materialLoaded: false,
                cuttingInProgress: false,
                currentMaterial: null,
                machineSettings: {
                  bladeSpeed: 0,
                  cuttingDepth: 0,
                  feedRate: 0,
                  coolantFlow: 0,
                },
              }
            }
            onWorkshopStateChange={() => {}}
          />
        )}

        {activeTab === "cutting" && (
          <CuttingTab
            workshopState={
              operatorProfile.workshopState ?? {
                machineOn: false,
                safetyGearOn: false,
                materialLoaded: false,
                cuttingInProgress: false,
                currentMaterial: null,
                machineSettings: {
                  bladeSpeed: 0,
                  cuttingDepth: 0,
                  feedRate: 0,
                  coolantFlow: 0,
                },
              }
            }
            onWorkshopStateChange={() => {}}
          />
        )}

        {activeTab === "assessment" && (
          <AssessmentTab
            operatorScore={0}
            safetyViolations={0}
            trainingProgress={0}
            operatorProfile={operatorProfile}
          />
        )}
      </Box>
    </>
  );
};
