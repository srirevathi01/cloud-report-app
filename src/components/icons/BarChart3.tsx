import React from 'react';
import { IconProps } from './types';

export const BarChart3: React.FC<IconProps> = ({
  className = '',
  size = 24,
  color = 'currentColor',
  strokeWidth = 2
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
);
