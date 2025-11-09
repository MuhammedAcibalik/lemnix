/**
 * @fileoverview Profile Group Row Component for Profile Optimization Results
 * @module ProfileGroupRow
 * @version 1.0.0
 */

import React from "react";
import {
  TableRow,
  TableCell,
  Typography,
  Button,
  Badge,
  Collapse,
  Box,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { ProfileGroupRowProps } from "../types";
import { messages } from "../constants";
import { ProfileGroupDetails } from "./ProfileGroupDetails";

/**
 * Profile Group Row Component
 */
export const ProfileGroupRow: React.FC<ProfileGroupRowProps> = ({
  group,
  isExpanded,
  onProfileClick,
  onCuttingPlanDetails,
  optimizationResult,
}) => {
  return (
    <React.Fragment>
      <TableRow hover>
        <TableCell>
          <Typography variant="body1" fontWeight="medium">
            {group.profileType}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Typography variant="body2" fontWeight="medium">
            {group.cuts} {messages.profileGroups.cuts}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Typography
            variant="body2"
            fontWeight="bold"
            color={
              group.efficiency >= 85
                ? "success.main"
                : group.efficiency >= 70
                  ? "warning.main"
                  : "error.main"
            }
          >
            {group.efficiency.toFixed(1)}%
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Typography
            variant="body2"
            fontWeight="medium"
            color={group.waste > 500 ? "error.main" : "success.main"}
          >
            {group.waste} mm
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Badge badgeContent={group.workOrders.length} color="primary">
            <Typography variant="body2">
              {group.workOrders.length} {messages.profileGroups.orders}
            </Typography>
          </Badge>
        </TableCell>
        <TableCell align="center">
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => onProfileClick(group.profileType)}
            startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {isExpanded
              ? messages.profileGroups.hide
              : messages.profileGroups.show}
          </Button>
        </TableCell>
      </TableRow>

      {/* Expandable Profile Details */}
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={6} sx={{ p: 0, border: "none" }}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <ProfileGroupDetails
                group={group}
                optimizationResult={optimizationResult}
                onCuttingPlanDetails={onCuttingPlanDetails}
              />
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
};
