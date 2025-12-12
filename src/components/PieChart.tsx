interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export default function PieChart({ data, size = 200 }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div
        className="rounded-full bg-gray-100 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <p className="text-gray-400 text-sm">No data</p>
      </div>
    );
  }

  let currentAngle = -90;
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...item, percentage, startAngle, angle };
  });

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', x, y,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'Z'
    ].join(' ');
  };

  const center = size / 2;
  const radius = size / 2 - 5;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform rotate-0">
        {segments.map((segment, index) => (
          <path
            key={index}
            d={describeArc(center, center, radius, segment.startAngle, segment.startAngle + segment.angle)}
            fill={segment.color}
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>

      <div className="mt-4 space-y-2 w-full">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-gray-700">{segment.label}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {segment.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
