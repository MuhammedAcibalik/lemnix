/**
 * @fileoverview Enhanced Wizard Progress Component
 * @module enterprise-optimization-wizard/components
 * @version 3.0.0 - UI/UX v3.0
 */

import React from "react";
import { Box, Typography, LinearProgress, Stack, alpha } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";

interface WizardStep {
  id: number;
  label: string;
  shortLabel: string;
}

interface EnhancedWizardProgressProps {
  steps: readonly WizardStep[];
  activeStep: number;
  completedSteps: number[];
  onStepClick?: (stepId: number) => void;
}

/**
 * Enhanced Wizard Progress Component
 * Shows linear progress bar with step indicators
 */
export const EnhancedWizardProgress: React.FC<EnhancedWizardProgressProps> = ({
  steps,
  activeStep,
  completedSteps,
  onStepClick,
}) => {
  const ds = useDesignSystem();

  // Calculate overall progress percentage
  const progressPercentage = ((activeStep + completedSteps.length) / (steps.length * 2)) * 100;

  return (
    <Box
      sx={{
        py: ds.spacing["4"],
        px: ds.spacing["6"],
        background: alpha(ds.colors.surface.base, 0.7),
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Progress Bar */}
      <Box sx={{ mb: ds.spacing["3"] }}>
        <LinearProgress
          variant="determinate"
          value={progressPercentage}
          sx={{
            height: 6,
            borderRadius: `${ds.borderRadius.full}px`,
            backgroundColor: alpha(ds.colors.primary.main, 0.1),
            "& .MuiLinearProgress-bar": {
              borderRadius: `${ds.borderRadius.full}px`,
              background: ds.gradients.primary.default,
              transition: "transform 0.4s ease-in-out",
            },
          }}
        />
      </Box>

      {/* Step Indicators */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={ds.spacing["2"]}
      >
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isActive = activeStep === step.id;
          const isClickable =
            isCompleted ||
            isActive ||
            (step.id === activeStep + 1 && completedSteps.includes(activeStep));

          return (
            <Box
              key={step.id}
              onClick={
                isClickable && onStepClick
                  ? () => onStepClick(step.id)
                  : undefined
              }
              sx={{
                flex: 1,
                cursor: isClickable ? "pointer" : "default",
                opacity: isClickable ? 1 : 0.5,
                transition: ds.transitions.base,
                "&:hover": isClickable
                  ? {
                      transform: "translateY(-2px)",
                    }
                  : {},
              }}
            >
              <Stack alignItems="center" spacing={ds.spacing["2"]}>
                {/* Circle Indicator */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isCompleted
                      ? ds.gradients.primary.default
                      : isActive
                        ? alpha(ds.colors.primary.main, 0.1)
                        : "transparent",
                    border: `2px solid ${
                      isCompleted || isActive
                        ? ds.colors.primary.main
                        : ds.colors.neutral[300]
                    }`,
                    transition: "all 0.3s ease",
                    boxShadow: isActive
                      ? `0 0 0 4px ${alpha(ds.colors.primary.main, 0.1)}`
                      : "none",
                  }}
                >
                  {isCompleted ? (
                    <CheckCircleIcon
                      sx={{
                        fontSize: 24,
                        color: ds.colors.text.inverse,
                      }}
                    />
                  ) : (
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: ds.typography.fontWeight.bold,
                        color: isActive
                          ? ds.colors.primary.main
                          : ds.colors.text.secondary,
                      }}
                    >
                      {index + 1}
                    </Typography>
                  )}
                </Box>

                {/* Step Label */}
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: isActive
                      ? ds.typography.fontWeight.semibold
                      : ds.typography.fontWeight.medium,
                    color: isActive
                      ? ds.colors.primary.main
                      : ds.colors.text.secondary,
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {step.shortLabel}
                </Typography>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};
