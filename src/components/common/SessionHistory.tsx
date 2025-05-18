import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface SessionRecord {
  duration: number; // seconds
  timestamp: number;
}

interface SessionHistoryProps {
  levelId: string | number;
}

const formatSeconds = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const SessionHistory: React.FC<SessionHistoryProps> = ({ levelId }) => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    const key = `level-${levelId}-history`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setSessions(JSON.parse(stored));
    }
  }, [levelId]);

  if (!sessions.length) {
    return null;
  }

  const best = Math.min(...sessions.map((s) => s.duration));
  const average =
    sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length;
  const latest = sessions[sessions.length - 1].duration;

  return (
    <div className="w-full mt-6 p-4 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 shadow-lg flex flex-col items-center">
      <h3 className="font-bold text-lg text-emerald-400 mb-2 tracking-tight">
        Session History
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={sessions.map((s, i) => ({ ...s, idx: i + 1 }))}>
          <defs>
            <linearGradient id="colorLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="idx"
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'Session', fill: '#a1a1aa', fontSize: 12, position: 'insideBottom', dy: 10 }}
          />
          <YAxis
            dataKey="duration"
            tickFormatter={formatSeconds}
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={40}
            label={{ value: 'Time', fill: '#a1a1aa', fontSize: 12, angle: -90, position: 'insideLeft', dx: -10 }}
          />
          <Tooltip
            formatter={(value: any) => formatSeconds(Number(value))}
            labelFormatter={(idx: any) => `Session ${idx}`}
            contentStyle={{ background: '#18181b', border: 'none', borderRadius: 8, color: '#fff' }}
            itemStyle={{ color: '#a855f7' }}
          />
          <ReferenceLine y={best} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Best', fill: '#10b981', fontSize: 12, position: 'top' }} />
          <Line
            type="monotone"
            dataKey="duration"
            stroke="url(#colorLine)"
            strokeWidth={3}
            dot={{ r: 5, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-6 mt-4 text-sm text-zinc-300 w-full justify-center">
        <div className="flex flex-col items-center">
          <span className="font-semibold text-emerald-400">Best</span>
          <span className="font-mono">{formatSeconds(best)}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-semibold text-purple-400">Latest</span>
          <span className="font-mono">{formatSeconds(latest)}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-semibold text-blue-400">Average</span>
          <span className="font-mono">{formatSeconds(average)}</span>
        </div>
      </div>
    </div>
  );
};

export default SessionHistory;
