/**
 * @fileoverview User Menu Component for Modern Navigation
 * @module UserMenu
 * @version 1.0.0
 */

import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { stylingConstants } from '../constants';
import { messages } from '../constants';
import {
  UserMenuProps
} from '../types';

/**
 * User Menu Component
 */
export const UserMenu: React.FC<UserMenuProps> = ({
  anchorEl,
  onClose
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      sx={{
        zIndex: stylingConstants.zIndex.userMenu,
        '& .MuiPaper-root': {
          minWidth: 200,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(226, 232, 240, 0.2)',
          borderRadius: stylingConstants.borderRadius.small,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        }
      }}
    >
      <MenuItem onClick={onClose}>
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{messages.userMenu.profile}</ListItemText>
      </MenuItem>
      <MenuItem onClick={onClose}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{messages.userMenu.settings}</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={onClose}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{messages.userMenu.logout}</ListItemText>
      </MenuItem>
    </Menu>
  );
};
