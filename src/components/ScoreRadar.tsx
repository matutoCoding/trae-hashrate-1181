import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

export interface ScoreRadarProps {
  scores: {
    styleMatch: number;
    teacherRating: number;
    styleFit: number;
    experience: number;
    priceMatch: number;
  };
  size?: number;
}

export default function ScoreRadar({ scores, size = 280 }: ScoreRadarProps) {
  const data = [
    { dimension: '书体匹配', score: scores.styleMatch, fullMark: 100 },
    { dimension: '历史评分', score: scores.teacherRating, fullMark: 100 },
    { dimension: '风格契合', score: scores.styleFit, fullMark: 100 },
    { dimension: '教龄经验', score: scores.experience, fullMark: 100 },
    { dimension: '价格匹配', score: scores.priceMatch, fullMark: 100 },
  ];

  return (
    <div style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="#1a1a2e" strokeOpacity={0.08} />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{
              fill: '#1a1a2e',
              fontSize: 12,
              fontWeight: 500,
            }}
            tickLine={false}
          />
          <Radar
            name="综合评分"
            dataKey="score"
            stroke="#c0392b"
            fill="#c0392b"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
