'use client';

interface TextComponentProps {
  content: string;
  size?: 'small' | 'medium' | 'large';
  weight?: 'normal' | 'bold';
  color?: 'default' | 'muted' | 'warning' | 'success' | 'danger';
  children?: React.ReactNode;
}

/**
 * TextComponent - Dynamic text rendering with configurable styling
 */
export default function TextComponent({
  content,
  size = 'medium',
  weight = 'normal',
  color = 'default',
  children,
}: TextComponentProps) {
  // Size classes
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl',
  };

  // Weight classes
  const weightClasses = {
    normal: 'font-normal',
    bold: 'font-bold',
  };

  // Color classes
  const colorClasses = {
    default: 'text-white',
    muted: 'text-zinc-400',
    warning: 'text-amber-400',
    success: 'text-emerald-400',
    danger: 'text-red-400',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${weightClasses[weight]} ${colorClasses[color]}`}
    >
      {content}
      {children}
    </div>
  );
}
