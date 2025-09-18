import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  useMediaQuery,
  Tooltip,
  Badge,
  Chip,
  Fade,
  Slide,
  Collapse,
  IconButton,
  Avatar,
  Divider
} from '@mui/material';
import {
  Home as HomeIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Calculate as OptimizationIcon,
  List as ListIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Palette as PaletteIcon,
  KeyboardArrowRight as ArrowRightIcon
} from '@mui/icons-material';
import { Logo } from './Logo';
import { spacing, colors, typography, gradients, borderRadius } from '../theme/designSystem';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  activePage: string;
  onPageChange: (page: string) => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

const DRAWER_WIDTH = 280; // Genişletildi
const DRAWER_WIDTH_COLLAPSED = 80; // Collapsed width

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  badge?: number;
  isNew?: boolean;
  isPro?: boolean;
  shortcut?: string;
  category?: 'main' | 'tools' | 'settings';
}

const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: 'Ana Sayfa',
    icon: HomeIcon,
    description: 'Genel bakış ve sistem durumu',
    category: 'main',
    shortcut: 'Ctrl+H'
  },
  {
    id: 'cutting-list',
    label: 'Kesim Listesi',
    icon: ListIcon,
    description: 'Akıllı kesim listesi yönetimi',
    badge: 3,
    category: 'main',
    shortcut: 'Ctrl+L'
  },
  {
    id: 'enterprise-optimization',
    label: 'Enterprise Optimizasyon',
    icon: OptimizationIcon,
    description: 'Gelişmiş matematiksel algoritmalar ile optimizasyon',
    isNew: true,
    category: 'tools',
    shortcut: 'Ctrl+E'
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: DashboardIcon,
    description: 'Genel istatistikler ve raporlar',
    category: 'tools',
    shortcut: 'Ctrl+D'
  },
  {
    id: 'settings',
    label: 'Ayarlar',
    icon: SettingsIcon,
    description: 'Sistem ayarları',
    category: 'settings',
    shortcut: 'Ctrl+,'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  activePage,
  onPageChange,
  onCollapseChange
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showTooltips, setShowTooltips] = useState(false);

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false);
    }
  }, [isMobile]);

  // Show tooltips when collapsed
  useEffect(() => {
    setShowTooltips(isCollapsed);
  }, [isCollapsed]);

  const handleItemClick = (pageId: string) => {
    onPageChange(pageId);
    if (isMobile) {
      onClose();
    }
  };

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `
          linear-gradient(135deg, 
            rgba(248, 250, 252, 0.95) 0%, 
            rgba(241, 245, 249, 0.90) 25%, 
            rgba(226, 232, 240, 0.85) 50%, 
            rgba(203, 213, 225, 0.90) 75%, 
            rgba(248, 250, 252, 0.95) 100%
          ),
          radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 60%),
          radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.02) 0%, transparent 60%),
          radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.025) 0%, transparent 60%)
        `,
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(226, 232, 240, 0.15)',
        color: '#1e293b',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(45deg, 
              transparent 30%, 
              rgba(255, 255, 255, 0.05) 50%, 
              transparent 70%
            )
          `,
          animation: 'shimmer 3s ease-in-out infinite',
        },
        '@keyframes shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }}
    >
      {/* Logo Alanı - Modern Glassmorphism */}
      <Box
        sx={{
          p: isCollapsed ? 2 : spacing.lg,
          background: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(15px)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: isCollapsed ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.xs,
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isCollapsed ? (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
                  animation: 'shimmer 2s ease-in-out infinite',
                },
                '@keyframes shimmer': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' }
                }
              }}
            >
              <Typography
                sx={{
                  color: '#ffffff',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  letterSpacing: '-1px',
                  position: 'relative',
                  zIndex: 1,
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
                }}
              >
                L
              </Typography>
            </Box>
          ) : (
            <Fade in={!isCollapsed} timeout={300}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography
                  sx={{
                    background: 'linear-gradient(135deg, #1e40af, #3b82f6, #6366f1)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: '2.4rem',
                    fontWeight: 800,
                    letterSpacing: '-1px',
                    lineHeight: 1,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    textTransform: 'uppercase',
                    position: 'relative',
                    textShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -4,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                      borderRadius: '1px',
                      opacity: 0.6,
                    }
                  }}
                >
                  LEMNİX
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(59, 130, 246, 0.6))',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    mt: 1,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -8,
                      left: 0,
                      right: 0,
                      height: '1px',
                      background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
                    }
                  }}
                >
                  Profil Kesim Sistemi
                </Typography>
              </Box>
            </Fade>
          )}
        </Box>
        
        {!isMobile && (
          <Tooltip title={isCollapsed ? "Genişlet" : "Daralt"} placement="right">
            <IconButton
              onClick={toggleCollapse}
              sx={{
                color: 'rgba(30, 41, 59, 0.6)',
                '&:hover': {
                  color: '#1e293b',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {isCollapsed ? <ArrowRightIcon /> : <ExpandLessIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Menü Öğeleri - Akıllı Tasarım */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        position: 'relative',
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(226, 232, 240, 0.3)',
          borderRadius: '2px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(59, 130, 246, 0.4)',
          borderRadius: '2px',
          '&:hover': {
            background: 'rgba(59, 130, 246, 0.6)',
          }
        }
      }}>
        <List sx={{ pt: 1, px: 1 }}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = activePage === item.id;
            const isHovered = hoveredItem === item.id;
            
            return (
              <Tooltip
                key={item.id}
                title={isCollapsed ? (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {item.description}
                    </Typography>
                    {item.shortcut && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.6 }}>
                        {item.shortcut}
                      </Typography>
                    )}
                  </Box>
                ) : ''}
                placement="right"
                arrow
                disableHoverListener={!isCollapsed}
              >
                <ListItem 
                  disablePadding 
                  sx={{ 
                    mb: 0.5,
                    position: 'relative',
                  }}
                >
                  <ListItemButton
                    onClick={() => handleItemClick(item.id)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    sx={{
                      mx: 0.5,
                      borderRadius: 2,
                      minHeight: isCollapsed ? 48 : 56,
                      background: isActive 
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.1))' 
                        : 'transparent',
                      border: isActive 
                        ? '1px solid rgba(59, 130, 246, 0.3)' 
                        : '1px solid transparent',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: isActive ? '4px' : '0px',
                        height: '100%',
                        background: 'linear-gradient(180deg, #00e676, #00bcd4)',
                        transition: 'width 0.3s ease',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: isHovered 
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), transparent)' 
                          : 'transparent',
                        transition: 'all 0.3s ease',
                      },
                      '&:hover': {
                        background: isActive 
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.15))' 
                          : 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(99, 102, 241, 0.08))',
                        transform: isCollapsed ? 'scale(1.05)' : 'translateX(8px)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                        '&::before': {
                          width: '4px',
                        }
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: isCollapsed ? 40 : 48,
                        color: isActive ? '#1e293b' : 'rgba(30, 41, 59, 0.7)',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <Badge
                        badgeContent={item.badge}
                        color="error"
                        invisible={!item.badge}
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.6rem',
                            minWidth: '16px',
                            height: '16px',
                          }
                        }}
                      >
                        <IconComponent sx={{ fontSize: isCollapsed ? 22 : 24 }} />
                      </Badge>
                    </ListItemIcon>
                    
                    {!isCollapsed && (
                      <Fade in={!isCollapsed} timeout={300}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: isActive ? 600 : 500,
                                  color: isActive ? '#1e293b' : 'rgba(30, 41, 59, 0.8)',
                                  fontSize: '0.9rem',
                                }}
                              >
                                {item.label}
                              </Typography>
                              {item.isNew && (
                                <Chip
                                  label="YENİ"
                                  size="small"
                                  sx={{
                                    height: '16px',
                                    fontSize: '0.6rem',
                                    backgroundColor: '#00e676',
                                    color: '#000',
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                              {item.isPro && (
                                <Chip
                                  label="PRO"
                                  size="small"
                                  sx={{
                                    height: '16px',
                                    fontSize: '0.6rem',
                                    backgroundColor: '#ff9800',
                                    color: '#fff',
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'rgba(30, 41, 59, 0.6)',
                                fontSize: '0.75rem',
                                lineHeight: 1.2,
                                display: 'block',
                                mt: 0.5,
                              }}
                            >
                              {item.description}
                            </Typography>
                          }
                        />
                      </Fade>
                    )}
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            );
          })}
        </List>
      </Box>

      {/* Alt Bilgi - Modern Footer */}
      <Box
        sx={{
          p: isCollapsed ? 1 : 2,
          borderTop: '1px solid rgba(226, 232, 240, 0.2)',
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent)',
          }
        }}
      >
        {!isCollapsed ? (
          <Fade in={!isCollapsed} timeout={300}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                >
                  L
                </Avatar>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(30, 41, 59, 0.8)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  Lemnix v1.0.0
                </Typography>
              </Box>
              <Typography
                variant="caption"
                  sx={{
                    color: 'rgba(30, 41, 59, 0.5)',
                    fontSize: '0.65rem',
                    display: 'block',
                  }}
              >
                © 2025 Tüm hakları saklıdır
              </Typography>
            </Box>
          </Fade>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="Lemnix v1.0.0" placement="right">
              <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                    transition: 'transform 0.2s ease',
                  }}
              >
                L
              </Avatar>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      sx={{
        width: isCollapsed && !isMobile ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
        flexShrink: 0,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: isCollapsed && !isMobile ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
          boxSizing: 'border-box',
          border: 'none',
          boxShadow: isMobile 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '4px 0 32px rgba(0, 0, 0, 0.15)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          position: 'fixed', // Fixed positioning
          top: 0,
          left: 0,
          height: '100vh', // Full viewport height
          zIndex: 1200, // High z-index to stay on top
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '1px',
            height: '100%',
            background: 'linear-gradient(180deg, transparent, rgba(226, 232, 240, 0.3), transparent)',
            zIndex: 1,
          }
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};
