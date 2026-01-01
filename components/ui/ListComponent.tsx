'use client';

interface ListComponentProps {
  items: string[];
  variant?: 'default' | 'interactive';
  children?: React.ReactNode;
}

/**
 * ListComponent - Dynamic list rendering with optional interactivity
 */
export default function ListComponent({
  items,
  variant = 'default',
  children,
}: ListComponentProps) {
  if (variant === 'interactive') {
    return (
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <button
            key={index}
            className="w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 
                     border border-white/10 text-left text-white
                     transition-all duration-200 hover:scale-[1.02]"
          >
            {item}
          </button>
        ))}
        {children}
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex items-start gap-2 text-zinc-300"
        >
          <span className="text-emerald-500 mt-1">•</span>
          <span>{item}</span>
        </li>
      ))}
      {children}
    </ul>
  );
}
