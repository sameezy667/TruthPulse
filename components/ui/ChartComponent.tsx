'use client';

interface ChartDataPoint {
  label: string;
  value: number;
  severity?: 'high' | 'med' | 'low';
}

interface ChartComponentProps {
  data: ChartDataPoint[];
  title?: string;
  children?: React.ReactNode;
}

/**
 * ChartComponent - Simple bar chart visualization for risk data
 */
export default function ChartComponent({
  data,
  title,
  children,
}: ChartComponentProps) {
  // Find max value for scaling
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  // Severity colors
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500';
      case 'med':
        return 'bg-amber-500';
      case 'low':
        return 'bg-emerald-500';
      default:
        return 'bg-zinc-500';
    }
  };

  return (
    <div className="w-full p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
      {title && (
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
          {title}
        </h3>
      )}

      <div className="space-y-3">
        {data.map((point, index) => {
          const percentage = (point.value / maxValue) * 100;

          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 truncate max-w-[70%]">
                  {point.label}
                </span>
                <span className="text-zinc-500 font-mono">
                  {point.value}
                </span>
              </div>

              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getSeverityColor(
                    point.severity
                  )}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {children}
    </div>
  );
}
