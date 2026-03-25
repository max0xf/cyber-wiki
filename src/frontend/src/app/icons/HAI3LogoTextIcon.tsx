import React from 'react';

/**
 * Cyber Wiki Logo Text
 * App-level branding text used by Menu layout component
 */
export const HAI3LogoTextIcon: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <span
      className={className}
      style={{
        fontSize: '1.125rem',
        fontWeight: 700,
        letterSpacing: '0.025em',
        whiteSpace: 'nowrap',
      }}
    >
      Cyber Wiki
    </span>
  );
};
