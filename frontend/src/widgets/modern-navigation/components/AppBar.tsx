/**
 * @fileoverview AppBar Component for Modern Navigation
 * @module AppBar
 * @version 1.0.0
 */

import React, { useState, useEffect } from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Badge,
  Tooltip,
  Fade,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  FlashOn as ZapIcon,
  Notifications as NotificationsIcon,
  AutoAwesome as SparkleIcon,
} from "@mui/icons-material";
import { Logo } from "@/shared/ui/Logo";
import { appConfig } from "@/shared/config/legacy/appConfig";
import { stylingConstants, messages, navigationItems } from "../constants/index";
import type { AppBarProps } from "../types/index";
import { useLocation } from "react-router-dom";

// Design System v2.0
import { useDesignSystem } from "@/shared/hooks";

// P0-7: WebGPU Status Badge
import { GPUStatusBadge } from "@/shared";
import { useWebGPU } from "@/shared";

/**
 * AppBar Component
 */
export const AppBar: React.FC<AppBarProps> = ({
  isMobile,
  currentPageItem,
  activePage,
  onToggleSidebar,
  onCommandPaletteOpen,
  onUserMenuOpen,
  userMenuAnchor,
}) => {
  const theme = useTheme();
  const ds = useDesignSystem();
  const location = useLocation();

  // Fallback mapping from path to human-readable page labels, in case
  // navigation state is out of sync for any reason.
  const pathLabelMap: Record<string, string> = {
    "/": "Ana Sayfa",
    "/dashboard": "Dashboard",
    "/cutting-list": "Kesim Listesi",
    "/enterprise-optimization": "Enterprise Optimizasyon",
    "/statistics": "İstatistikler",
    "/production-plan": "Üretim Planı",
    "/profile-management": "Profil Yönetimi",
    "/settings": "Ayarlar",
  };

  // P0-7: WebGPU status
  const { isSupported, isInitialized, isLoading } = useWebGPU();

  // Scroll direction detection for auto-hide header
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDelta, setScrollDelta] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      // Always show header when at the very top
      if (currentScrollY <= 10) {
        setIsVisible(true);
        setScrollDelta(0);
      }
      // Show header when scrolling up (but need significant upward movement)
      else if (delta < -15 && currentScrollY > 50) {
        setIsVisible(true);
        setScrollDelta(delta);
      }
      // Hide header when scrolling down (but need significant downward movement)
      else if (delta > 15 && currentScrollY > 150) {
        setIsVisible(false);
        setScrollDelta(delta);
      }
      // For small movements, maintain current state
      else {
        setScrollDelta(delta);
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [lastScrollY]);

  return (
    <MuiAppBar
      position="fixed"
      elevation={0}
      sx={{
        background: "transparent",
        backdropFilter: "none",
        borderBottom: "none",
        boxShadow: "none",
        zIndex: 9999, // Very high z-index to ensure it stays on top
        transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        // Perfect sticky header solution
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        height: "64px",
        // Auto-hide animation based on scroll direction
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        // Ensure it doesn't get affected by parent containers
        willChange: "transform",
      }}
    >
      <Toolbar
        sx={{
          px: { 
            xs: ds.spacing["2"], // Reduced padding on mobile
            sm: ds.spacing["3"], 
            md: ds.spacing["5"], 
            lg: ds.spacing["6"],
            xl: "clamp(1.5rem, 3vw, 2rem)",
          },
          minHeight: `64px !important`,
          maxHeight: `64px !important`,
          height: `64px !important`,
          overflowX: "hidden", // Prevent horizontal overflow
          overflowY: "hidden",
          width: "100%",
          maxWidth: "100vw",
        }}
      >
        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onToggleSidebar}
            sx={{
              mr: ds.spacing["2"],
              color: ds.colors.primary[800],
              transition: ds.transitions.fast,
              "&:hover": {
                backgroundColor: alpha(ds.colors.primary.main, 0.08),
                transform: "scale(1.05)",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo */}
        <Box
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            mr: { xs: ds.spacing["1"], sm: ds.spacing["2"], md: ds.spacing["3"] },
            flexShrink: 0,
          }}
        >
          <Tooltip title={messages.navigation.brandTooltip} arrow>
            <Box>
              <Logo />
            </Box>
          </Tooltip>
        </Box>

        {/* Mobile page title - simple, left-aligned */}
        {(() => {
          const resolvedPageItem =
            currentPageItem ||
            navigationItems.find((item) => item.id === activePage) ||
            navigationItems.find((item) => item.path === location.pathname);

          const pageLabel =
            resolvedPageItem?.label || pathLabelMap[location.pathname];

          if (!pageLabel) {
            return null;
          }

          return (
            <Typography
              sx={{
                display: { xs: "flex", md: "none" },
                alignItems: "center",
                fontSize: "clamp(0.875rem, 2vw + 0.5rem, 1rem)",
                fontWeight: ds.typography.fontWeight.semibold,
                color: ds.colors.text.primary,
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: { xs: "calc(100vw - 200px)", sm: "40%" }, // Dynamic maxWidth
                flexShrink: 1,
                minWidth: 0, // Allow shrinking
              }}
            >
              {pageLabel}
            </Typography>
          );
        })()}

        {/* Modern Breadcrumb-Style Page Title */}
        {(() => {
          const resolvedPageItem =
            currentPageItem ||
            navigationItems.find((item) => item.id === activePage) ||
            navigationItems.find((item) => item.path === location.pathname);

          const pageLabel =
            resolvedPageItem?.label || pathLabelMap[location.pathname];

          if (!pageLabel) {
            return null;
          }

          const PageIcon = resolvedPageItem?.icon;

          return (
          <Fade in={true} timeout={400}>
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 1,
                display: { xs: "none", md: "flex" }, // Hide on mobile
                alignItems: "center",
                gap: ds.spacing["2"],
              }}
            >
              {/* Breadcrumb Container */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: ds.spacing["1"], sm: ds.spacing["2"] },
                  px: { xs: ds.spacing["3"], sm: ds.spacing["4"], md: ds.spacing["5"] },
                  height: { xs: 36, sm: 40, md: 42 }, // Responsive height
                  background: alpha("#FFFFFF", 0.7),
                  backdropFilter: "blur(12px) saturate(130%)",
                  borderRadius: `${ds.borderRadius.lg}px`,
                  border: `1px solid ${alpha(ds.colors.neutral[300], 0.3)}`,
                  boxShadow: `
                    0 2px 8px ${alpha(ds.colors.neutral[900], 0.04)},
                    0 1px 2px ${alpha(ds.colors.neutral[900], 0.06)}
                  `,
                  transition: ds.transitions.fast,

                  "&:hover": {
                    borderColor: alpha(ds.colors.primary.main, 0.3),
                    boxShadow: `
                      0 4px 12px ${alpha(ds.colors.primary.main, 0.08)},
                      0 2px 4px ${alpha(ds.colors.neutral[900], 0.06)}
                    `,
                  },
                }}
              >
                {/* Resolve page item from props or navigation config */}
                {/**
                 * Fallback: if currentPageItem is undefined (e.g. activePage came
                 * from URL but navigation state is out of sync), resolve it from
                 * navigationItems using the activePage id.
                 */}
                      {/* Page Icon */}
                      {PageIcon && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: { xs: 28, sm: 30, md: 32 },
                            height: { xs: 28, sm: 30, md: 32 },
                            borderRadius: `${ds.borderRadius.md}px`,
                            background: alpha(ds.colors.primary.main, 0.12),
                            color: ds.colors.primary.main,
                            transition: ds.transitions.fast,
                          }}
                        >
                          <PageIcon sx={{ fontSize: { xs: 16, sm: 17, md: 18 } }} />
                        </Box>
                      )}

                      {/* Separator */}
                      <Box
                        sx={{
                          width: { xs: 3, sm: 4 },
                          height: { xs: 3, sm: 4 },
                          borderRadius: "50%",
                          background: alpha(ds.colors.neutral[400], 0.4),
                        }}
                      />

                      {/* Page Label - Elegant Typography */}
                      <Typography
                        sx={{
                          fontSize: "clamp(0.9375rem, 1.5vw + 0.5rem, 1.125rem)",
                          fontWeight: ds.typography.fontWeight.semibold,
                          color: ds.colors.primary[800] ?? ds.colors.primary.main,
                          letterSpacing: "-0.02em",
                          lineHeight: 1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {pageLabel}
                      </Typography>
              </Box>
            </Box>
          </Fade>
          );
        })()}

        {/* Spacer for right side */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Enhanced Action Buttons - Design System v2.0 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 4, sm: ds.spacing["1"], md: ds.spacing["2"], lg: ds.spacing["3"] }, // 4px = 0.5 spacing
            ml: { xs: ds.spacing["1"], sm: ds.spacing["2"], md: ds.spacing["3"], lg: ds.spacing["4"] },
            flexShrink: 0, // Prevent shrinking
            minWidth: 0, // Allow content to shrink if needed
          }}
        >
          {/* Enhanced GPU Status Badge - Hidden on mobile */}
          <Tooltip title="GPU Acceleration Status" arrow>
            <Box
              sx={{
                display: { xs: "none", sm: "flex" }, // Hide completely on mobile
                alignItems: "center",
                gap: ds.spacing["1"],
                px: { sm: ds.spacing["1"], md: ds.spacing["2"] },
                py: ds.spacing["1"],
                background:
                  isSupported && isInitialized
                    ? alpha(ds.colors.success.main, 0.1)
                    : alpha(ds.colors.neutral[400], 0.1),
                borderRadius: `${ds.borderRadius.md}px`,
                border: `1px solid ${
                  isSupported && isInitialized
                    ? alpha(ds.colors.success.main, 0.2)
                    : alpha(ds.colors.neutral[400], 0.2)
                }`,
                transition: ds.transitions.fast,
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: ds.shadows.soft.sm,
                },
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    isSupported && isInitialized
                      ? ds.colors.success.main
                      : ds.colors.neutral[400],
                  animation:
                    isSupported && isInitialized ? "pulse 2s infinite" : "none",
                  "@keyframes pulse": {
                    "0%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                    "100%": { opacity: 1 },
                  },
                }}
              />
              <Typography
                sx={{
                  fontSize: { sm: "0.625rem", md: "0.6875rem" },
                  fontWeight: ds.typography.fontWeight.medium,
                  color:
                    isSupported && isInitialized
                      ? ds.colors.success.main
                      : ds.colors.neutral[600],
                  display: { sm: "none", md: "block" }, // Hide text on tablet
                }}
              >
                {isLoading
                  ? "Kontrol ediliyor..."
                  : isSupported && isInitialized
                    ? "GPU Aktif"
                    : "GPU Pasif"}
              </Typography>
            </Box>
          </Tooltip>

          {/* Enhanced Command Palette Trigger */}
          <Tooltip title={messages.navigation.commandPaletteTooltip} arrow>
            <IconButton
              onClick={onCommandPaletteOpen}
              sx={{
                color: ds.colors.primary.main,
                backgroundColor: alpha(ds.colors.primary.main, 0.1),
                border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                borderRadius: `${ds.borderRadius.button}px`,
                width: { xs: 32, sm: 36, md: 40 },
                height: { xs: 32, sm: 36, md: 40 },
                padding: { xs: "6px", sm: "8px" },
                transition: ds.transitions.fast,
                "&:hover": {
                  backgroundColor: alpha(ds.colors.primary.main, 0.15),
                  borderColor: alpha(ds.colors.primary.main, 0.3),
                  transform: "translateY(-2px)",
                  boxShadow: `0 4px 12px ${alpha(ds.colors.primary.main, 0.2)}`,
                },
                "&:focus-visible": {
                  outline: `2px solid ${ds.colors.primary.main}`,
                  outlineOffset: "2px",
                },
              }}
            >
              <ZapIcon sx={{ fontSize: { xs: 16, sm: 18, md: ds.componentSizes.icon.sm } }} />
            </IconButton>
          </Tooltip>

          {/* Enhanced Notifications - Hidden on mobile */}
          <Tooltip title={messages.navigation.notificationsTooltip} arrow>
            <IconButton
              sx={{
                display: { xs: "none", sm: "flex" }, // Hide on mobile
                color: ds.colors.text.secondary,
                backgroundColor: alpha(ds.colors.neutral[500], 0.08),
                border: `1px solid ${alpha(ds.colors.neutral[500], 0.15)}`,
                borderRadius: `${ds.borderRadius.button}px`,
                width: { sm: 36, md: 40 },
                height: { sm: 36, md: 40 },
                transition: ds.transitions.fast,
                "&:hover": {
                  backgroundColor: alpha(ds.colors.primary.main, 0.1),
                  borderColor: alpha(ds.colors.primary.main, 0.2),
                  color: ds.colors.primary.main,
                  transform: "translateY(-2px)",
                  boxShadow: `0 4px 12px ${alpha(ds.colors.primary.main, 0.15)}`,
                },
                "&:focus-visible": {
                  outline: `2px solid ${ds.colors.primary.main}`,
                  outlineOffset: "2px",
                },
              }}
            >
              <Badge
                badgeContent={2}
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: ds.colors.error.main,
                    color: "white",
                    fontSize: { sm: "0.5625rem", md: "0.625rem" },
                    minWidth: { sm: 16, md: 18 },
                    height: { sm: 16, md: 18 },
                    fontWeight: ds.typography.fontWeight.semibold,
                    borderRadius: `${ds.borderRadius.sm}px`,
                    boxShadow: `0 2px 4px ${alpha(ds.colors.error.main, 0.3)}`,
                  },
                }}
              >
                <NotificationsIcon
                  sx={{ fontSize: { sm: 18, md: ds.componentSizes.icon.sm } }}
                />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Enhanced User Menu */}
          <Tooltip title={messages.navigation.userMenuTooltip} arrow>
            <IconButton
              onClick={onUserMenuOpen}
              sx={{
                borderRadius: `${ds.borderRadius.button}px`,
                transition: ds.transitions.fast,
                "&:hover": {
                  backgroundColor: alpha(ds.colors.primary.main, 0.1),
                  transform: "translateY(-2px)",
                  boxShadow: `0 4px 12px ${alpha(ds.colors.primary.main, 0.15)}`,
                },
                "&:focus-visible": {
                  outline: `2px solid ${ds.colors.primary.main}`,
                  outlineOffset: "2px",
                },
              }}
            >
              <Avatar
                sx={{
                  width: { xs: 30, sm: 34, md: 36 },
                  height: { xs: 30, sm: 34, md: 36 },
                  background: ds.gradients.primary,
                  fontSize: { xs: "0.7rem", sm: "0.8125rem", md: "0.875rem" },
                  fontWeight: ds.typography.fontWeight.semibold,
                  border: `2px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                  boxShadow: `0 2px 8px ${alpha(ds.colors.primary.main, 0.2)}`,
                }}
              >
                U
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};
