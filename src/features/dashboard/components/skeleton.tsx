import React from 'react';

interface SkeletonProps {
  h?: number;
  w?: number | string;
  radius?: number;
}

export function Skeleton({ h = 16, w = '100%', radius = 6 }: SkeletonProps) {
  return (
    <div
      style={{
        height: h,
        width: w,
        borderRadius: radius,
        backgroundColor: 'var(--surface-2)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}
