/**
 * @fileoverview Waste Analysis Tab Component for Profile Optimization Results
 * @module WasteAnalysisTab
 * @version 1.0.0
 */

import React from "react";
import {
  Grid,
  Alert,
  AlertTitle,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
} from "@mui/material";
import { WasteAnalysisTabProps } from "../types";
import { messages } from "../constants";

/**
 * Waste Analysis Tab Component
 */
export const WasteAnalysisTab: React.FC<WasteAnalysisTabProps> = ({
  result,
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert
          severity={
            result.optimizationResult.wastePercentage < 10
              ? "success"
              : "warning"
          }
        >
          <AlertTitle>
            {messages.wasteAnalysis.wasteRate}: %
            {result.optimizationResult.wastePercentage?.toFixed(1)}
          </AlertTitle>
          {result.optimizationResult.wastePercentage < 10
            ? messages.wasteAnalysis.excellentMessage
            : messages.wasteAnalysis.improvementMessage}
        </Alert>
      </Grid>
      <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Profil Tipi</TableCell>
                <TableCell align="center">Atık (mm)</TableCell>
                <TableCell align="center">Verimlilik</TableCell>
                <TableCell align="center">Durum</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.profileGroups.map((group) => (
                <TableRow key={group.profileType}>
                  <TableCell>{group.profileType}</TableCell>
                  <TableCell align="center">{group.waste}</TableCell>
                  <TableCell align="center">
                    {group.efficiency.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    {group.waste < 200 && group.efficiency > 85 ? (
                      <Chip
                        label={messages.wasteAnalysis.status.excellent}
                        color="success"
                        size="small"
                      />
                    ) : group.waste < 500 && group.efficiency > 70 ? (
                      <Chip
                        label={messages.wasteAnalysis.status.good}
                        color="warning"
                        size="small"
                      />
                    ) : (
                      <Chip
                        label={messages.wasteAnalysis.status.improvable}
                        color="error"
                        size="small"
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};
