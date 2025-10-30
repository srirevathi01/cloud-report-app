import React from 'react';
import { IconProps } from './types';

export const Settings: React.FC<IconProps> = ({
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
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m5.66-13l-3 5.2m-5.2 3l-3 5.2M23 12h-6m-6 0H1m18.66 5.66l-5.2-3m-3-5.2l-5.2-3M23 12a11 11 0 1 1-22 0 11 11 0 0 1 22 0z" />
  </svg>
);
