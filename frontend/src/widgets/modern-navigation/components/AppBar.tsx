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
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  FlashOn as ZapIcon,
  Notifications as NotificationsIcon,
  AutoAwesome as SparkleIcon,
} from "@mui/icons-material";
import { Logo } from "@/shared/ui/Logo";
import { appConfig } from "@/shared/config/constants";
import {
  stylingConstants,
  messages,
  navigationItems,
} from "../constants/index";
import type { AppBarProps } from "../types/index";
import { useLocation } from "react-router-dom";

// Design System v2.0 + Responsive Hooks
import { useDesignSystem, useResponsive } from "@/shared/hooks";
import { breakpoints } from "@/shared/config/breakpoints";
import { fluidHeight, pxToRem } from "@/shared/lib/zoom-aware";

/**
 * AppBar Component
 */
export const AppBar: React.FC<AppBarProps> = ({
  isMobile: isMobileProp,
  currentPageItem,
  activePage,
  onToggleSidebar,
  onCommandPaletteOpen,
  onUserMenuOpen,
  userMenuAnchor,
}) => {
  const ds = useDesignSystem();
  const location = useLocation();

  // Use project's responsive hook system
  const { isMobile: isMobileHook, isTablet, isDesktop } = useResponsive();

  // Use hook value if prop not provided, otherwise use prop (for backward compatibility)
  const isMobile = isMobileProp ?? isMobileHook;

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
        background: alpha(ds.colors.surface.base, 0.8),
        backdropFilter: "blur(12px) saturate(180%)",
        borderBottom: `1px solid ${alpha(ds.colors.border.muted, 0.5)}`,
        boxShadow: "none",
        zIndex: 9999, // Very high z-index to ensure it stays on top
        transition:
          "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 0.3s ease",
        // Perfect sticky header solution
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        // ✅ Responsive height
        height: {
          xs: "64px", // Mobile
          sm: "68px", // Tablet
          md: "72px", // Desktop
        },
        // Auto-hide animation based on scroll direction
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        // Ensure it doesn't get affected by parent containers
        willChange: "transform",
        "@supports (backdrop-filter: blur(12px))": {
          background: alpha(ds.colors.surface.base, 0.75),
        },
      }}
    >
      <Toolbar
        sx={{
          // ✅ Fluid height that scales with zoom
          minHeight: {
            xs: fluidHeight(pxToRem(60), pxToRem(68), pxToRem(64)), // Mobile: 60-68px, preferred 64px
            sm: fluidHeight(pxToRem(64), pxToRem(72), pxToRem(68)), // Tablet: 64-72px, preferred 68px
            md: fluidHeight(pxToRem(68), pxToRem(76), pxToRem(72)), // Desktop: 68-76px, preferred 72px
          },
          maxHeight: {
            xs: fluidHeight(pxToRem(60), pxToRem(68), pxToRem(64)),
            sm: fluidHeight(pxToRem(64), pxToRem(72), pxToRem(68)),
            md: fluidHeight(pxToRem(68), pxToRem(76), pxToRem(72)),
          },
          height: {
            xs: fluidHeight(pxToRem(60), pxToRem(68), pxToRem(64)),
            sm: fluidHeight(pxToRem(64), pxToRem(72), pxToRem(68)),
            md: fluidHeight(pxToRem(68), pxToRem(76), pxToRem(72)),
          },
          padding: 0, // Remove all padding from Toolbar
          overflowX: "hidden", // Prevent horizontal overflow
          overflowY: "hidden",
          width: "100%",
        }}
      >
        {/* Native div wrapper: Responsive container with proper breakpoints */}
        <Box
          component="div"
          sx={{
            // ✅ Responsive container max-width pattern
            // Mobile: 100% (no max-width)
            // Tablet: 768px
            // Desktop: 1024px
            // Wide: 1280px
            maxWidth: {
              xs: "100%", // Mobile: full width
              sm: `${breakpoints.tablet}px`, // Tablet: 768px
              md: `${breakpoints.desktop}px`, // Desktop: 1024px
              lg: `${breakpoints.wide}px`, // Wide: 1280px
            },
            mx: "auto",
            width: "100%",
            // ✅ Responsive padding pattern: px-4 sm:px-6 lg:px-8
            px: {
              xs: ds.spacing["4"], // px-4 (16px) mobile
              sm: ds.spacing["6"], // sm:px-6 (24px) tablet
              md: ds.spacing["7"], // md:px-7 (28px) desktop
              lg: ds.spacing["8"], // lg:px-8 (32px) wide
            },
            // Flex layout: items-center justify-between
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            // ✅ Fluid height that scales with zoom
            height: {
              xs: fluidHeight(pxToRem(60), pxToRem(68), pxToRem(64)), // Mobile
              sm: fluidHeight(pxToRem(64), pxToRem(72), pxToRem(68)), // Tablet
              md: fluidHeight(pxToRem(68), pxToRem(76), pxToRem(72)), // Desktop
            },
            // ✅ Overflow control to prevent horizontal scroll
            overflow: "hidden",
            minWidth: 0, // Allow flex items to shrink below content size
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
              mr: {
                xs: ds.spacing["1"],
                sm: ds.spacing["2"],
                md: ds.spacing["3"],
              },
              flexShrink: 0,
            }}
          >
            <Tooltip title={messages.navigation.brandTooltip} arrow>
              <Box>
                <Logo />
              </Box>
            </Tooltip>
          </Box>

          {/* Center Section - Page Title (Mobile/Tablet/Medium Desktop) */}
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
              <>
                {/* Mobile/Tablet/Medium Desktop: Simple left-aligned title */}
                <Typography
                  sx={{
                    // ✅ Mobile page title - tablet ve medium desktop'ta göster (breadcrumb yokken)
                    display: { xs: "flex", sm: "flex", md: "flex", lg: "none" }, // Show on mobile/tablet/medium desktop, hide on wide+
                    alignItems: "center",
                    fontSize: "clamp(0.875rem, 2vw + 0.5rem, 1rem)",
                    fontWeight: ds.typography.fontWeight.semibold,
                    color: ds.colors.text.primary,
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                    // ✅ Text truncation için
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    // ✅ Responsive maxWidth - daha küçük değerler
                    maxWidth: {
                      xs: "calc(100vw - 280px)", // Mobile: daha küçük (logo + menu + buttons için yer)
                      sm: "calc(50vw - 200px)", // Tablet: viewport'un yarısı
                      md: "calc(50vw - 200px)", // Medium desktop: viewport'un yarısı (breadcrumb yokken)
                      lg: "none", // Wide: gizli (breadcrumb gösteriliyor)
                    },
                    flexShrink: 1,
                    minWidth: 0, // Allow shrinking
                  }}
                >
                  {pageLabel}
                </Typography>

                {/* Wide Desktop: Centered Breadcrumb-Style Page Title */}
                <Box
                  sx={{
                    // ✅ Desktop breadcrumb - sadece geniş ekranlarda göster
                    display: { xs: "none", sm: "none", md: "none", lg: "flex" }, // Hide on mobile/tablet/medium desktop, show on wide+
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1, // ✅ Flexbox ile ortada yer kapla
                    flexShrink: 1, // ✅ Küçülebilir
                    minWidth: 0, // ✅ Minimum genişlik yok
                    overflow: "hidden",
                    // ✅ Responsive max-width - küçük desktop'larda taşmasın
                    maxWidth: {
                      lg: "400px", // Wide (1280px+): max 400px
                      xl: "500px", // XL (1536px+): max 500px
                    },
                  }}
                >
                  <Fade in={true} timeout={400}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: { xs: ds.spacing["1"], sm: ds.spacing["2"] },
                        // ✅ Responsive padding - küçük desktop'larda azalt
                        px: {
                          xs: ds.spacing["3"],
                          sm: ds.spacing["4"],
                          md: ds.spacing["4"], // Medium desktop: 16px (azaltıldı)
                          lg: ds.spacing["5"], // Wide: 20px
                        },
                        // ✅ Responsive height
                        height: { xs: 36, sm: 40, md: 40, lg: 42 }, // Medium desktop: 40px, Wide: 42px
                        background: alpha("#FFFFFF", 0.7),
                        backdropFilter: "blur(12px) saturate(130%)",
                        borderRadius: `${ds.borderRadius.lg}px`,
                        border: `1px solid ${alpha(ds.colors.neutral[300], 0.3)}`,
                        boxShadow: `
                        0 2px 8px ${alpha(ds.colors.neutral[900], 0.04)},
                        0 1px 2px ${alpha(ds.colors.neutral[900], 0.06)}
                      `,
                        transition: ds.transitions.fast,
                        // ✅ Text truncation için
                        overflow: "hidden",
                        maxWidth: "100%", // Container içinde taşmasın

                        "&:hover": {
                          borderColor: alpha(ds.colors.primary.main, 0.3),
                          boxShadow: `
                          0 4px 12px ${alpha(ds.colors.primary.main, 0.08)},
                          0 2px 4px ${alpha(ds.colors.neutral[900], 0.06)}
                        `,
                        },
                      }}
                    >
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
                            flexShrink: 0, // Icon küçülmesin
                          }}
                        >
                          <PageIcon
                            sx={{ fontSize: { xs: 16, sm: 17, md: 18 } }}
                          />
                        </Box>
                      )}

                      {/* Separator */}
                      <Box
                        sx={{
                          width: { xs: 3, sm: 4 },
                          height: { xs: 3, sm: 4 },
                          borderRadius: "50%",
                          background: alpha(ds.colors.neutral[400], 0.4),
                          flexShrink: 0, // Separator küçülmesin
                        }}
                      />

                      {/* Page Label - Elegant Typography */}
                      <Typography
                        sx={{
                          fontSize:
                            "clamp(0.9375rem, 1.5vw + 0.5rem, 1.125rem)",
                          fontWeight: ds.typography.fontWeight.semibold,
                          color:
                            ds.colors.primary[800] ?? ds.colors.primary.main,
                          letterSpacing: "-0.02em",
                          lineHeight: 1,
                          whiteSpace: "nowrap",
                          // ✅ Text truncation - uzun sayfa adları için
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          flexShrink: 1, // Text küçülebilir
                          minWidth: 0, // Minimum genişlik yok
                        }}
                      >
                        {pageLabel}
                      </Typography>
                    </Box>
                  </Fade>
                </Box>
              </>
            );
          })()}

          {/* Spacer for right side - esnek ama küçülebilir */}
          <Box
            sx={{
              flexGrow: 1,
              flexShrink: 1, // ✅ Küçülebilir
              minWidth: 0, // ✅ Minimum genişlik yok
              // ✅ Wide desktop'ta spacer gizle (breadcrumb zaten flex: 1 ile yer kaplıyor)
              display: { xs: "block", sm: "block", md: "block", lg: "none" },
            }}
          />

          {/* Enhanced Action Buttons - Design System v2.0 */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              // ✅ Küçük ekranlarda gap azaltıldı
              gap: {
                xs: 2, // Mobile: 8px (daha küçük)
                sm: ds.spacing["1"], // Tablet: 4px
                md: ds.spacing["2"], // Desktop: 8px
                lg: ds.spacing["3"], // Wide: 12px
              },
              // ✅ Küçük ekranlarda margin azaltıldı
              ml: {
                xs: ds.spacing["1"], // Mobile: 4px
                sm: ds.spacing["1"], // Tablet: 4px
                md: ds.spacing["3"], // Desktop: 12px
                lg: ds.spacing["4"], // Wide: 16px
              },
              flexShrink: 0, // ✅ Action buttons korunmalı (kritik elementler)
              minWidth: 0, // Allow content to shrink if needed
              // ✅ Overflow kontrolü
              overflow: "hidden",
            }}
          >
            {/* Enhanced Command Palette Trigger */}
            <Tooltip title={messages.navigation.commandPaletteTooltip} arrow>
              <IconButton
                onClick={onCommandPaletteOpen}
                sx={{
                  color: ds.colors.primary.main,
                  backgroundColor: alpha(ds.colors.primary.main, 0.1),
                  border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                  borderRadius: `${ds.borderRadius.button}px`,
                  // ✅ Icon button boyutları - minimum boyut kontrolü
                  width: { xs: 32, sm: 36, md: 40 },
                  height: { xs: 32, sm: 36, md: 40 },
                  minWidth: { xs: 32, sm: 36, md: 40 }, // ✅ Minimum boyut
                  minHeight: { xs: 32, sm: 36, md: 40 }, // ✅ Minimum boyut
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
                <ZapIcon
                  sx={{
                    fontSize: { xs: 16, sm: 18, md: ds.componentSizes.icon.sm },
                  }}
                />
              </IconButton>
            </Tooltip>

            {/* Enhanced Notifications - Hidden on mobile */}
            <Tooltip title={messages.navigation.notificationsTooltip} arrow>
              <IconButton
                sx={{
                  // ✅ Notifications daha geç göster - geniş ekranlarda göster
                  display: { xs: "none", sm: "none", md: "none", lg: "flex" }, // Hide on mobile/tablet/medium desktop, show on wide+
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
          {/* End action buttons Box */}
        </Box>
        {/* End native div wrapper */}
      </Toolbar>
    </MuiAppBar>
  );
};
