/**
 * @fileoverview Modal Component v3.0
 * @module shared/ui/Modal
 * @version 3.0.0
 */

import React, { forwardRef, useEffect, useMemo } from "react";
import {
  Modal as MuiModal,
  ModalProps as MuiModalProps,
  Box,
  IconButton,
  Typography,
  Backdrop,
  Fade,
  Divider,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import { safeMaxWidth, fluidWidth, pxToRem } from "@/shared/lib/zoom-aware";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps extends Omit<MuiModalProps, "children" | "title"> {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly size?: ModalSize;
  readonly title?: React.ReactNode;
  readonly children: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly showCloseButton?: boolean;
  readonly closeOnBackdrop?: boolean;
  readonly closeOnEscape?: boolean;
  readonly headerDivider?: boolean;
  readonly footerDivider?: boolean;
}

/**
 * Modal Component
 *
 * Modern modal with enhanced visual design and accessibility
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      size = "md",
      title,
      children,
      footer,
      showCloseButton = true,
      closeOnBackdrop = true,
      closeOnEscape = true,
      headerDivider = true,
      footerDivider = true,
      sx = {},
      style,
      ...props
    },
    ref,
  ) => {
    const ds = useDesignSystem();

    // ✅ Zoom-aware size mapping with fluid widths
    const sizeMap = {
      sm: {
        width: fluidWidth(pxToRem(320), pxToRem(480), pxToRem(400)), // 320-480px, preferred 400px
        maxWidth: safeMaxWidth("90vw"),
      },
      md: {
        width: fluidWidth(pxToRem(480), pxToRem(720), pxToRem(600)), // 480-720px, preferred 600px
        maxWidth: safeMaxWidth("90vw"),
      },
      lg: {
        width: fluidWidth(pxToRem(640), pxToRem(960), pxToRem(800)), // 640-960px, preferred 800px
        maxWidth: safeMaxWidth("90vw"),
      },
      xl: {
        width: fluidWidth(pxToRem(960), pxToRem(1440), pxToRem(1200)), // 960-1440px, preferred 1200px
        maxWidth: safeMaxWidth("95vw"),
      },
      full: { width: "100vw", maxWidth: "100vw", height: "100vh" },
    };

    const sizeConfig = sizeMap[size];

    // Lock body scroll when modal is open
    useEffect(() => {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [open]);

    // Handle backdrop click
    const handleBackdropClick = () => {
      if (closeOnBackdrop) {
        onClose();
      }
    };

    // Handle escape key
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        onClose();
      }
    };

    const modalStyles = useMemo(
      () => ({
        position: "absolute" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        ...sizeConfig,
        backgroundColor: ds.colors.surface.base,
        borderRadius: `${ds.borderRadius.modal}px`,
        boxShadow: ds.shadows.modal,
        outline: "none",
        overflow: size === "full" ? "auto" : "hidden",
        display: "flex",
        flexDirection: "column" as const,
        maxHeight: size === "full" ? "100vh" : "90vh",
        ...sx,
      }),
      [ds, size, sizeConfig, sx],
    );

    const headerStyles = useMemo(
      () => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${ds.spacing["6"]}px`,
        paddingBottom: headerDivider
          ? `${ds.spacing["4"]}px`
          : `${ds.spacing["6"]}px`,
      }),
      [ds, headerDivider],
    );

    const contentStyles = useMemo(
      () => ({
        padding: `${ds.spacing["6"]}px`,
        overflowY: "auto" as const,
        flex: 1,
      }),
      [ds],
    );

    const footerStyles = useMemo(
      () => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: `${ds.spacing["3"]}px`,
        padding: `${ds.spacing["6"]}px`,
        paddingTop: footerDivider
          ? `${ds.spacing["4"]}px`
          : `${ds.spacing["6"]}px`,
      }),
      [ds, footerDivider],
    );

    return (
      <MuiModal
        ref={ref}
        open={open}
        onClose={handleBackdropClick}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: {
              backdropFilter: "blur(8px)",
              backgroundColor: ds.colors.surface.overlay,
            },
          },
        }}
        {...(style ? { style } : {})}
        {...props}
      >
        <Fade in={open}>
          <Box sx={modalStyles} onKeyDown={handleKeyDown} tabIndex={-1}>
            {/* Header */}
            {(title || showCloseButton) && (
              <>
                <Box sx={headerStyles}>
                  {title && (
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: ds.fontWeight.semibold,
                        color: ds.colors.text.primary,
                        flex: 1,
                      }}
                    >
                      {title}
                    </Typography>
                  )}
                  {showCloseButton && (
                    <IconButton
                      onClick={onClose}
                      size="small"
                      sx={{
                        color: ds.colors.text.secondary,
                        "&:hover": {
                          color: ds.colors.text.primary,
                          backgroundColor: ds.colors.surface.elevated1,
                        },
                      }}
                      aria-label="Close modal"
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                </Box>
                {headerDivider && (
                  <Divider sx={{ borderColor: ds.colors.border.muted }} />
                )}
              </>
            )}

            {/* Content */}
            <Box sx={contentStyles}>{children}</Box>

            {/* Footer */}
            {footer && (
              <>
                {footerDivider && (
                  <Divider sx={{ borderColor: ds.colors.border.muted }} />
                )}
                <Box sx={footerStyles}>{footer}</Box>
              </>
            )}
          </Box>
        </Fade>
      </MuiModal>
    );
  },
);

Modal.displayName = "Modal";

/**
 * ConfirmModal - Pre-configured for confirmations
 */
export const ConfirmModal = forwardRef<HTMLDivElement, ModalProps>(
  (props, ref) => (
    <Modal ref={ref} size="sm" headerDivider footerDivider {...props} />
  ),
);

ConfirmModal.displayName = "ConfirmModal";

/**
 * FormModal - Pre-configured for forms
 */
export const FormModal = forwardRef<HTMLDivElement, ModalProps>(
  (props, ref) => (
    <Modal
      ref={ref}
      size="md"
      closeOnBackdrop={false}
      headerDivider
      footerDivider
      {...props}
    />
  ),
);

FormModal.displayName = "FormModal";

export default Modal;
