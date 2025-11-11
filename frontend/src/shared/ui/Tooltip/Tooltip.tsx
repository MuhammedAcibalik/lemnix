/**
 * @fileoverview Tooltip Component v3.0
 * @module shared/ui/Tooltip
 * @version 3.0.0
 */

import React, { forwardRef, useMemo } from "react";
import {
  Tooltip as MuiTooltip,
  TooltipProps as MuiTooltipProps,
  Fade,
  Zoom,
} from "@mui/material";
import { useDesignSystem } from "@/shared/hooks";

type TooltipPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

export interface TooltipProps extends Omit<MuiTooltipProps, "title"> {
  readonly title: React.ReactNode;
  readonly placement?: TooltipPlacement;
  readonly arrow?: boolean;
  readonly delay?: number;
  readonly children: React.ReactElement;
  readonly disabled?: boolean;
}

/**
 * Tooltip Component
 *
 * Modern tooltip with enhanced visual design and accessibility
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      title,
      placement = "top",
      arrow = true,
      delay = 200,
      children,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const ds = useDesignSystem();

    const tooltipStyles = useMemo(
      () => ({
        backgroundColor: ds.colors.slate[900],
        color: ds.colors.text.inverse,
        borderRadius: `${ds.borderRadius.md}px`,
        padding: `${ds.spacing["2"]}px ${ds.spacing["3"]}px`,
        fontSize: ds.fontSize.sm,
        fontWeight: ds.fontWeight.medium,
        maxWidth: 320,
        boxShadow: ds.shadows.soft.lg,
        backdropFilter: "blur(8px)",
      }),
      [ds],
    );

    const arrowStyles = useMemo(
      () => ({
        color: ds.colors.slate[900],
      }),
      [ds],
    );

    if (disabled || !title) {
      return children;
    }

    return (
      <MuiTooltip
        ref={ref}
        title={title}
        placement={placement}
        arrow={arrow}
        enterDelay={delay}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 200 }}
        componentsProps={{
          tooltip: {
            sx: tooltipStyles,
          },
          arrow: {
            sx: arrowStyles,
          },
        }}
        {...props}
      >
        {children}
      </MuiTooltip>
    );
  },
);

Tooltip.displayName = "Tooltip";

/**
 * InfoTooltip - Pre-configured for info messages
 */
export const InfoTooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (props, ref) => (
    <Tooltip ref={ref} placement="top" arrow delay={300} {...props} />
  ),
);

InfoTooltip.displayName = "InfoTooltip";

/**
 * HelpTooltip - Pre-configured for help text
 */
export const HelpTooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (props, ref) => (
    <Tooltip ref={ref} placement="right" arrow delay={100} {...props} />
  ),
);

HelpTooltip.displayName = "HelpTooltip";

export default Tooltip;
