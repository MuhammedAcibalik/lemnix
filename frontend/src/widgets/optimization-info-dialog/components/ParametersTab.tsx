/**
 * @fileoverview Parameters Tab Component for Optimization Info Dialog
 * @module ParametersTab
 * @version 1.0.0
 */

import React from "react";
import {
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
  Alert,
  AlertTitle,
} from "@mui/material";
import { messages } from "../constants";
import { ParametersTabProps } from "../types";

/**
 * Parameters Tab Component
 */
export const ParametersTab: React.FC<ParametersTabProps> = ({ features }) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        {messages.parameters.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {messages.parameters.description}
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Parametre</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>Varsayılan</TableCell>
              <TableCell>Etkisi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {features.map((feature, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {feature.title}
                  </Typography>
                </TableCell>
                <TableCell>{feature.description}</TableCell>
                <TableCell>
                  <Chip label={feature.default} size="small" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {feature.impact}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Alert severity="warning" sx={{ mt: 2 }}>
        <AlertTitle>{messages.parameters.warning.title}</AlertTitle>
        {messages.parameters.warning.message}
      </Alert>
    </>
  );
};
