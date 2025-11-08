/**
 * @fileoverview Custom Optimization Icon Component
 * @module OptimizationIcon
 * @version 1.0.0
 */

import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const OptimizationIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 100 100">
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="optimizationGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      
      {/* Gear (Top Left) */}
      <g transform="translate(20, 15)">
        <circle cx="15" cy="15" r="12" fill="none" stroke="url(#optimizationGradient)" strokeWidth="2.5"/>
        <circle cx="15" cy="15" r="3" fill="url(#optimizationGradient)"/>
        
        {/* Gear Teeth */}
        <g stroke="url(#optimizationGradient)" strokeWidth="2.5" fill="none">
          {/* Top teeth */}
          <path d="M15 3 L17 8 L13 8 Z"/>
          <path d="M27 15 L22 17 L22 13 Z"/>
          <path d="M15 27 L13 22 L17 22 Z"/>
          <path d="M3 15 L8 13 L8 17 Z"/>
          
          {/* Diagonal teeth */}
          <path d="M21.5 8.5 L24.5 11.5 L21.5 14.5 L18.5 11.5 Z"/>
          <path d="M21.5 21.5 L18.5 24.5 L15.5 21.5 L18.5 18.5 Z"/>
          <path d="M8.5 21.5 L5.5 18.5 L8.5 15.5 L11.5 18.5 Z"/>
          <path d="M8.5 8.5 L11.5 5.5 L14.5 8.5 L11.5 11.5 Z"/>
        </g>
      </g>

      {/* Bar Chart with Upward Trend (Bottom Right to Top Middle) */}
      <g transform="translate(45, 55)">
        {/* Bar 1 */}
        <rect x="0" y="15" width="8" height="15" fill="url(#optimizationGradient)" rx="1"/>
        {/* Bar 2 */}
        <rect x="12" y="10" width="8" height="20" fill="url(#optimizationGradient)" rx="1"/>
        {/* Bar 3 */}
        <rect x="24" y="5" width="8" height="25" fill="url(#optimizationGradient)" rx="1"/>
        {/* Bar 4 */}
        <rect x="36" y="0" width="8" height="30" fill="url(#optimizationGradient)" rx="1"/>
        
        {/* Upward Trend Arrow */}
        <path 
          d="M2 32 L25 7" 
          stroke="url(#optimizationGradient)" 
          strokeWidth="3" 
          fill="none"
          markerEnd="url(#arrowhead)"
        />
        
        {/* Arrow Head */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="url(#optimizationGradient)"
            />
          </marker>
        </defs>
      </g>

      {/* Checkmark in Circle (Top Right) */}
      <g transform="translate(65, 20)">
        <circle cx="15" cy="15" r="12" fill="none" stroke="url(#optimizationGradient)" strokeWidth="2.5"/>
        <path 
          d="M8 15 L13 20 L22 11" 
          stroke="url(#optimizationGradient)" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </SvgIcon>
  );
};

export default OptimizationIcon;
