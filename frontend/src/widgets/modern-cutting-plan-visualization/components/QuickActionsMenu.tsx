/**
 * @fileoverview Quick Actions Menu Component
 * @module QuickActionsMenu
 * @version 1.0.0
 */

import React from "react";
import { Fab, Menu, MenuItem } from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import { OptimizationResult } from "@/shared/types/legacy";
import { QuickActionsMenuProps } from "../types";

/**
 * Quick Actions Menu Component
 */
export const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({
  anchorEl,
  onClose,
  onExport,
  onCopy,
  optimizationResult,
}) => {
  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(optimizationResult));
      onCopy();
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="Hızlı İşlemler"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
      >
        <MoreVertIcon />
      </Fab>

      {/* Quick Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={() => {
            onExport("json");
            onClose();
          }}
        >
          <SaveIcon sx={{ mr: 1 }} /> Kaydet
        </MenuItem>
        <MenuItem
          onClick={() => {
            onExport("image");
            onClose();
          }}
        >
          <ShareIcon sx={{ mr: 1 }} /> Paylaş
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCopy();
            onClose();
          }}
        >
          <CopyIcon sx={{ mr: 1 }} /> Kopyala
        </MenuItem>
      </Menu>
    </>
  );
};
