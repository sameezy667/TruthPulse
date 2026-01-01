'use client';

interface BadgeComponentProps {
  text: string;
  variant?: 'success' | 'warning' | 'danger' | 'neutral';
  children?: React.ReactNode;
}

/**
 * BadgeComponent - Dynamic badge rendering with variant styling
 */
export default function BadgeComponent({
  text,
  variant = 'neutral',
  children,
}: BadgeComponentProps) {
  // Variant classes
  const variantClasses = {
    success: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    warning: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    danger: 'bg-red-500/20 border-red-500/30 text-red-400',
    neutral: 'bg-zinc-500/20 border-zinc-500/30 text-zinc-400',
  };

  return (
    <div className="inline-flex flex-col gap-2">
      <div
        className={`px-4 py-2 rounded-full border backdrop-blur-xl inline-block ${variantClasses[variant]}`}
      >
        <span className="text-xs font-bold uppercase tracking-widest">
          {text}
        </span>
      </div>
      {children}
    </div>
  );
}
