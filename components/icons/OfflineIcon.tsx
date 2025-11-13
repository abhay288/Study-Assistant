
import React from 'react';

const OfflineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 20h.01" />
    <path d="M8.5 16.4A4.5 4.5 0 0 1 12 14a4.5 4.5 0 0 1 3.5 2.4" />
    <path d="M12 4v6" />
    <path d="m15 7-3 3-3-3" />
    <path d="M5 13a7.1 7.1 0 0 1 1.2-3.9" />
    <path d="M17.8 9.1a7.1 7.1 0 0 1 1.2 3.9" />
  </svg>
);

export default OfflineIcon;
