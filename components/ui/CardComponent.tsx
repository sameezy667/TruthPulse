'use client';

interface CardComponentProps {
  variant?: 'success' | 'warning' | 'danger' | 'neutral';
  severity?: 'high' | 'med' | 'low';
  children?: React.ReactNode;
}

/**
 * CardComponent - Dynamic card container with variant styling
 */
export default function CardComponent({
  variant = 'neutral',
  severity,
  children,
}: CardComponentProps) {
  // Determine variant from severity if provided
  const effectiveVariant = severity
    ? severity === 'high'
      ? 'danger'
      : 'warning'
    : variant;

  // Variant classes
  const variantClasses = {
    success: 'bg-emerald-500/10 border-emerald-500/20',
    warning: 'bg-amber-500/10 border-amber-500/20',
    danger: 'bg-red-500/10 border-red-500/20',
    neutral: 'bg-zinc-800/50 border-zinc-700/50',
  };

  return (
    <div
      className={`p-4 rounded-lg border backdrop-blur-xl ${variantClasses[effectiveVariant]}`}
    >
      {children}
    </div>
  );
}
