/**
 * @fileoverview FSD Responsive System Example
 * @module shared/ui/ResponsiveExample
 * @description Example demonstrating responsive layout components
 */

import React from 'react';
import { Container } from '../Container';
import { Grid } from '../Grid';
import { Stack } from '../Stack';
import { useBreakpointFSD, useMediaQueryFSD } from '../../hooks';

/**
 * Example component showing responsive layout usage
 * This can be used as a reference for implementing responsive designs
 */
export const ResponsiveExample: React.FC = () => {
  const { current, isMobile, isTablet, isDesktop } = useBreakpointFSD();
  const isLargeScreen = useMediaQueryFSD('(min-width: 1024px)');

  return (
    <Container maxWidth="xl" padding="lg">
      <Stack spacing="lg" direction="column">
        {/* Device Info */}
        <div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
          <h3>Current Breakpoint: {current}</h3>
          <p>Mobile: {isMobile ? 'Yes' : 'No'}</p>
          <p>Tablet: {isTablet ? 'Yes' : 'No'}</p>
          <p>Desktop: {isDesktop ? 'Yes' : 'No'}</p>
          <p>Large Screen: {isLargeScreen ? 'Yes' : 'No'}</p>
        </div>

        {/* Responsive Grid Example */}
        <div>
          <h2>Responsive Grid</h2>
          <Grid cols={1} colsMd={2} colsLg={3} colsXl={4} gap="md">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                style={{
                  padding: '2rem',
                  background: '#e0e0e0',
                  borderRadius: '4px',
                  textAlign: 'center',
                }}
              >
                Item {item}
              </div>
            ))}
          </Grid>
        </div>

        {/* Stack Example */}
        <div>
          <h2>Stack Layout</h2>
          <Stack direction="row" spacing="md" align="center" wrap>
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                style={{
                  padding: '1rem 2rem',
                  background: '#d0d0d0',
                  borderRadius: '4px',
                }}
              >
                Button {item}
              </div>
            ))}
          </Stack>
        </div>
      </Stack>
    </Container>
  );
};
