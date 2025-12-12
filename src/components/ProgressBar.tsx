interface ProgressBarProps {
  label: string;
  current: number;
  limit: number;
  unit: string;
}

export function ProgressBar({ label, current, limit, unit }: ProgressBarProps) {
  const percentage = Math.min((current / limit) * 100, 100);

  const getColor = () => {
    if (percentage > 100) return 'bg-red-500';
    if (percentage >= 75) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getTextColor = () => {
    if (percentage > 100) return 'text-red-600';
    if (percentage >= 75) return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-semibold ${getTextColor()}`}>
          {current.toFixed(1)} / {limit} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 text-right">
        {percentage.toFixed(1)}% of daily limit
      </div>
    </div>
  );
}
