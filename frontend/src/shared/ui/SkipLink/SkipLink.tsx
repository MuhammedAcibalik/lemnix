/**
 * @fileoverview SkipLink Component - Accessibility skip navigation link
 * @module shared/ui/SkipLink
 * @version 3.0.0
 */

import React from "react";
import { styled } from "@mui/material/styles";

/**
 * Styled skip link that's only visible when focused
 * Allows keyboard users to skip navigation and jump to main content
 */
const StyledSkipLink = styled("a")(({ theme }) => ({
  position: "absolute",
  top: "-40px",
  left: 0,
  zIndex: 100000,
  padding: "8px 16px",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "14px",
  borderRadius: "0 0 4px 0",
  boxShadow: theme.shadows[3],
  transition: "top 0.2s ease-in-out",
  
  "&:focus": {
    top: 0,
    outline: `3px solid ${theme.palette.secondary.main}`,
    outlineOffset: "2px",
  },
  
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

export interface SkipLinkProps {
  /**
   * Target element ID to skip to
   * @default "main-content"
   */
  targetId?: string;
  
  /**
   * Link text
   * @default "Ana içeriğe atla"
   */
  children?: React.ReactNode;
  
  /**
   * Additional class name
   */
  className?: string;
}

/**
 * SkipLink Component
 * 
 * Provides a hidden link that becomes visible when focused via keyboard.
 * Allows users to skip repetitive navigation and jump directly to main content.
 * Essential for accessibility and WCAG 2.1 compliance.
 * 
 * @example
 * ```tsx
 * // In App component
 * function App() {
 *   return (
 *     <>
 *       <SkipLink />
 *       <Navigation />
 *       <main id="main-content">
 *         <Content />
 *       </main>
 *     </>
 *   );
 * }
 * 
 * // With custom target
 * <SkipLink targetId="custom-content">
 *   İçeriğe geç
 * </SkipLink>
 * ```
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = "main-content",
  children = "Ana içeriğe atla",
  className,
}) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    
    const target = document.getElementById(targetId);
    if (target) {
      // Move focus to target element
      target.focus();
      
      // Smooth scroll to target
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      
      // Ensure target is focusable
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
        
        // Remove tabindex after focus for normal tab order
        target.addEventListener(
          "blur",
          () => {
            target.removeAttribute("tabindex");
          },
          { once: true }
        );
      }
    }
  };
  
  return (
    <StyledSkipLink
      href={`#${targetId}`}
      onClick={handleClick}
      className={className}
    >
      {children}
    </StyledSkipLink>
  );
};

export default SkipLink;
