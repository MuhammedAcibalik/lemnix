/**
 * Validation Alert Component
 * Displays validation errors and warnings
 *
 * @module shared/lib/validation
 * @version 1.0.0
 */

import React from "react";
import {
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  Collapse,
} from "@mui/material";
import type { ValidationError } from "./types";

export interface ValidationAlertProps {
  readonly errors?: ReadonlyArray<ValidationError>;
  readonly warnings?: ReadonlyArray<ValidationError>;
  readonly show?: boolean;
}

export const ValidationAlert: React.FC<ValidationAlertProps> = ({
  errors = [],
  warnings = [],
  show = true,
}) => {
  if (!show || (errors.length === 0 && warnings.length === 0)) {
    return null;
  }

  return (
    <>
      {errors.length > 0 && (
        <Collapse in={true}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Doğrulama Hataları ({errors.length})</AlertTitle>
            <List dense disablePadding>
              {errors.map((error, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemText
                    primary={error.message}
                    secondary={error.field}
                    primaryTypographyProps={{ variant: "body2" }}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        </Collapse>
      )}

      {warnings.length > 0 && (
        <Collapse in={true}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Uyarılar ({warnings.length})</AlertTitle>
            <List dense disablePadding>
              {warnings.map((warning, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemText
                    primary={warning.message}
                    secondary={warning.field}
                    primaryTypographyProps={{ variant: "body2" }}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        </Collapse>
      )}
    </>
  );
};
