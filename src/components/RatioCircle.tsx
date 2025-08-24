import React from 'react';
import './RatioCircle.css';

interface RatioCircleProps {
  ratio: number;
  size?: number;
  strokeWidth?: number;
}

const RatioCircle: React.FC<RatioCircleProps> = ({ ratio, size = 36, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Clamp ratio between 0 and 1 for the red part
  const redRatio = Math.min(1, 1 / (ratio + 1));
  const greenRatio = 1 - redRatio;

  const redOffset = circumference * (1 - redRatio);
  const greenOffset = circumference * (1 - greenRatio);

  return (
    <svg className="ratio-circle" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        className="circle-background"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
      />
      <circle
        className="circle-progress circle-red"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={greenOffset} // Red part starts where green ends
      />
      <circle
        className="circle-progress circle-green"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={redOffset} // Green part
      />
      <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="circle-text">
        {ratio.toFixed(1)}
      </text>
    </svg>
  );
};

export default RatioCircle;
