'use client';

interface TextSkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export default function TextSkeleton({ 
  width = '100%', 
  height = '1rem',
  className = '' 
}: TextSkeletonProps) {
  return (
    <span 
      className={`inline-block bg-zinc-800/50 rounded animate-pulse ${className}`}
      style={{ width, height }}
    />
  );
}
