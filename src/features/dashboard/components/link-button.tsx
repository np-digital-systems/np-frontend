import React from 'react';

interface LinkButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function LinkButton({ children, onClick }: LinkButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-xs font-medium"
      style={{
        color: 'var(--accent)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}
