/**
 * @fileoverview Stack Component
 * @module shared/ui/Stack
 * @description Flexible stack layout component for vertical/horizontal stacking
 */

<<<<<<< HEAD
import React from "react";
=======
import React from 'react';
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce

export interface StackProps {
  /** Content to render inside stack */
  children: React.ReactNode;
  /** Stack direction */
<<<<<<< HEAD
  direction?: "row" | "column";
  /** Spacing between items */
  spacing?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  /** Alignment of items along main axis */
  align?: "start" | "center" | "end" | "stretch";
  /** Alignment of items along cross axis */
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
=======
  direction?: 'row' | 'column';
  /** Spacing between items */
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Alignment of items along main axis */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Alignment of items along cross axis */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
  /** Allow wrapping */
  wrap?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** HTML element type */
  as?: keyof JSX.IntrinsicElements;
}

const spacingClasses = {
<<<<<<< HEAD
  none: "0",
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
};

const alignClasses = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
};

const justifyClasses = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
=======
  none: '0',
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
};

const alignClasses = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

const justifyClasses = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
};

/**
 * Stack component for flexible layouts
 * Provides consistent spacing and alignment
 */
export const Stack: React.FC<StackProps> = ({
  children,
<<<<<<< HEAD
  direction = "column",
  spacing = "md",
  align = "stretch",
  justify = "start",
  wrap = false,
  className = "",
  as: Component = "div",
}) => {
  const styles: React.CSSProperties = {
    display: "flex",
=======
  direction = 'column',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className = '',
  as: Component = 'div',
}) => {
  const styles: React.CSSProperties = {
    display: 'flex',
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
    flexDirection: direction,
    alignItems: alignClasses[align],
    justifyContent: justifyClasses[justify],
    gap: spacingClasses[spacing],
<<<<<<< HEAD
    flexWrap: wrap ? "wrap" : "nowrap",
=======
    flexWrap: wrap ? 'wrap' : 'nowrap',
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
  };

  return (
    <Component style={styles} className={className}>
      {children}
    </Component>
  );
};

<<<<<<< HEAD
Stack.displayName = "Stack";
=======
Stack.displayName = 'Stack';
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
