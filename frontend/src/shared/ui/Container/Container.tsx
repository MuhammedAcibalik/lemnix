/**
 * @fileoverview Container Component
 * @module shared/ui/Container
 * @description Responsive container component with max-width constraints
 */

import React from 'react';

export interface ContainerProps {
  /** Content to render inside container */
  children: React.ReactNode;
  /** Maximum width variant */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Center the container */
  center?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** HTML element type */
  as?: keyof JSX.IntrinsicElements;
}

const maxWidthClasses = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
};

const paddingClasses = {
  none: '0',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
};

/**
 * Container component with responsive max-width
 * Follows mobile-first design principles
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'xl',
  padding = 'md',
  center = true,
  className = '',
  as: Component = 'div',
}) => {
  const styles: React.CSSProperties = {
    width: '100%',
    maxWidth: maxWidthClasses[maxWidth],
    paddingLeft: paddingClasses[padding],
    paddingRight: paddingClasses[padding],
    marginLeft: center ? 'auto' : undefined,
    marginRight: center ? 'auto' : undefined,
  };

  return (
    <Component style={styles} className={className}>
      {children}
    </Component>
  );
};

Container.displayName = 'Container';
