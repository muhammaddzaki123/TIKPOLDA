'use client';

import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="mb-6 pb-4 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      <div className="mt-2">
        {children}
      </div>
    </Card>
  );
}

// Custom Tooltip
interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {payload.map((entry, index: number) => (
          <p
            key={index}
            className="text-sm text-slate-600"
            style={{ color: entry.color }}
          >
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Trend Line Chart
interface TrendData {
  date: string;
  value: number;
  comparison?: number;
}

interface TrendChartProps {
  data: TrendData[];
  lineColor?: string;
  comparisonColor?: string;
}

export function TrendChart({ data, lineColor = '#3b82f6', comparisonColor = '#8b5cf6' }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={lineColor} stopOpacity={0.4} />
            <stop offset="95%" stopColor={lineColor} stopOpacity={0.05} />
          </linearGradient>
          {data[0]?.comparison !== undefined && (
            <linearGradient id="colorComparison" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={comparisonColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={comparisonColor} stopOpacity={0.05} />
            </linearGradient>
          )}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#64748b"
          style={{ fontSize: '11px' }}
          tickMargin={8}
        />
        <YAxis 
          stroke="#64748b" 
          style={{ fontSize: '11px' }}
          tickMargin={8}
        />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                  <p className="text-sm font-medium text-slate-900 mb-2">{label}</p>
                  {payload.map((entry, index) => (
                    <p
                      key={index}
                      className="text-sm text-slate-600"
                      style={{ color: entry.color }}
                    >
                      {entry.name}: <span className="font-semibold">{entry.value}</span>
                    </p>
                  ))}
                </div>
              );
            }
            return null;
          }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }}
          iconType="circle"
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorValue)"
          name="Aktual"
          dot={{ r: 4, fill: lineColor }}
          activeDot={{ r: 6 }}
        />
        {data[0]?.comparison !== undefined && (
          <Area
            type="monotone"
            dataKey="comparison"
            stroke={comparisonColor}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorComparison)"
            name="Perbandingan"
            dot={{ r: 4, fill: comparisonColor }}
            activeDot={{ r: 6 }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Bar Chart
interface BarData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface BarChartComponentProps {
  data: BarData[];
  barColor?: string;
  height?: number;
}

export function BarChartComponent({ data, barColor = '#3b82f6', height = 300 }: BarChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#64748b"
          style={{ fontSize: '11px' }}
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
        />
        <YAxis 
          stroke="#64748b" 
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => value.toString()}
        />
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                  <p className="text-sm font-medium text-slate-900">{payload[0].payload.name}</p>
                  <p className="text-sm text-slate-600">
                    Jumlah HT: <span className="font-semibold">{payload[0].value}</span>
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar 
          dataKey="value" 
          fill={barColor} 
          radius={[8, 8, 0, 0]}
          maxBarSize={60}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Pie Chart
interface PieData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface PieChartComponentProps {
  data: PieData[];
  height?: number;
}

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  // Posisi label di tengah antara inner dan outer radius
  const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if percentage is greater than 3%
  if (percent < 0.03) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="font-bold text-base drop-shadow-md"
      style={{ 
        fontSize: '14px',
        fontWeight: 700,
        textShadow: '0 1px 3px rgba(0,0,0,0.3)'
      }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function PieChartComponent({ data, height = 350 }: PieChartComponentProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={110}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0];
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                    <p className="text-sm font-medium text-slate-900">{data.name}</p>
                    <p className="text-sm text-slate-600">
                      Jumlah: <span className="font-semibold">{data.value}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {((Number(data.value) / total) * 100).toFixed(1)}% dari total
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legend yang lebih profesional */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate">
                {entry.name}
              </p>
              <p className="text-xs text-slate-500">
                {entry.value} unit ({((entry.value / total) * 100).toFixed(0)}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Multi-line Chart for Comparison
interface MultiLineData {
  date: string;
  [key: string]: string | number;
}

interface MultiLineChartProps {
  data: MultiLineData[];
  lines: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
}

export function MultiLineChart({ data, lines }: MultiLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#64748b"
          style={{ fontSize: '11px' }}
          tickMargin={8}
        />
        <YAxis 
          stroke="#64748b" 
          style={{ fontSize: '11px' }}
          tickMargin={8}
        />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                  <p className="text-sm font-medium text-slate-900 mb-2">{label}</p>
                  {payload.map((entry, index) => (
                    <p
                      key={index}
                      className="text-sm text-slate-600"
                      style={{ color: entry.color }}
                    >
                      {entry.name}: <span className="font-semibold">{entry.value}</span>
                    </p>
                  ))}
                </div>
              );
            }
            return null;
          }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }}
          iconType="circle"
        />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={3}
            name={line.name}
            dot={{ r: 4, fill: line.color, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: line.color, strokeWidth: 2, stroke: '#fff' }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
