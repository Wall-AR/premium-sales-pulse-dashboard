import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { DailySale } from "@/lib/supabaseQueries";
import { Info, TrendingUp } from "lucide-react";
// Assuming ChartTooltipContent etc. are not used if not provided by the simple ui/chart.tsx
// If they were part of a more complex wrapper, we'd import them.
// For now, using default Recharts Tooltip rendering and customizing via props.

interface SalesChartProps {
  data: {
    currentMonthSales: DailySale[];
    previousMonthSales: DailySale[];
  } | null | undefined;
}

const DUAL_LINE_CHART_COLORS = {
  current: "hsl(var(--chart-1))", // Typically primary color (e.g., blue or green)
  previous: "hsl(var(--chart-2))", // Typically a secondary or neutral color (e.g., gray)
};

const SalesChartSkeleton: React.FC = () => {
  return (
    <Card className="bg-white shadow-md rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-800 text-lg font-bold">
          <TrendingUp className="mr-2 text-primary-green" /> Evolução de Vendas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 animate-pulse">
        <div className="h-80 bg-gray-200 rounded"></div>
        <div className="flex items-center justify-center mt-4 space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-gray-300" style={{height: '2px'}}></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const SalesChart = ({ data }: SalesChartProps) => {
  const transformedChartData = React.useMemo(() => {
    if (!data || (!data.currentMonthSales.length && !data.previousMonthSales.length)) {
      return [];
    }

    const allDays = new Set<string>();
    const currentSalesMap = new Map<string, number>();
    const previousSalesMap = new Map<string, number>();

    data.currentMonthSales.forEach(s => {
      const day = s.date.substring(8, 10); // DD from YYYY-MM-DD
      allDays.add(day);
      currentSalesMap.set(day, (currentSalesMap.get(day) || 0) + s.sales);
    });

    data.previousMonthSales.forEach(s => {
      const day = s.date.substring(8, 10); // DD from YYYY-MM-DD
      allDays.add(day);
      previousSalesMap.set(day, (previousSalesMap.get(day) || 0) + s.sales);
    });

    const sortedDays = Array.from(allDays).sort((a,b) => a.localeCompare(b, undefined, {numeric: true}));

    return sortedDays.map(day => ({
      day: day, // e.g., "01", "02", ..., "31"
      currentSales: currentSalesMap.get(day) ?? null,
      previousSales: previousSalesMap.get(day) ?? null,
    }));
  }, [data]);

  if (data === undefined) { // Still loading from parent
    return <SalesChartSkeleton />;
  }

  if (!transformedChartData || transformedChartData.length === 0) {
    return (
      <Card className="bg-white shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800 text-lg font-bold">
            <TrendingUp className="mr-2 text-primary-green" /> Evolução de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-gray-500">
          <Info className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          Nenhum dado de vendas diárias disponível para exibir o gráfico.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-md rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-800 text-lg font-bold">
            <TrendingUp className="mr-2 text-primary-green" /> Evolução de Vendas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4"> {/* Adjusted padding */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={transformedChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}> {/* Adjusted left margin for YAxis */}
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /> {/* Neutral grid color */}
              <XAxis 
                dataKey="day"
                stroke="#4b5563" // Neutral axis color
                fontSize={12}
                // tickFormatter removed as "day" is already formatted "DD"
              />
              <YAxis 
                stroke="#4b5563" // Neutral axis color
                fontSize={12}
                tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const formattedValue = value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                  if (name === 'currentSales') return [formattedValue, 'Mês Atual'];
                  if (name === 'previousSales') return [formattedValue, 'Mês Anterior'];
                  return [formattedValue, name];
                }}
                labelFormatter={(label: string) => `Dia ${label}`}
                labelStyle={{ color: '#374151', fontWeight: 'bold' }} // Neutral label
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}
                itemStyle={{ color: '#1f2937' }}
              />
              <Line 
                type="monotone" 
                dataKey="currentSales"
                name="Mês Atual"
                stroke={DUAL_LINE_CHART_COLORS.current}
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth:1, fill: DUAL_LINE_CHART_COLORS.current }}
                activeDot={{ r: 6, strokeWidth: 2, fill: DUAL_LINE_CHART_COLORS.current }}
                connectNulls // Connect line over null values
              />
              <Line 
                type="monotone" 
                dataKey="previousSales"
                name="Mês Anterior"
                stroke={DUAL_LINE_CHART_COLORS.previous}
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 3, strokeWidth:1, fill: DUAL_LINE_CHART_COLORS.previous }}
                activeDot={{ r: 6, strokeWidth: 2, fill: DUAL_LINE_CHART_COLORS.previous }}
                connectNulls // Connect line over null values
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center mt-4 space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: DUAL_LINE_CHART_COLORS.current }}></div>
            <span className="text-sm text-gray-700">Mês Atual</span>
          </div>
          <div className="flex items-center space-x-2">
            {/* For dashed line legend, could use an SVG or a div with dashed border */}
            <div className="w-4 h-1 border-b-2 border-dashed" style={{ borderColor: DUAL_LINE_CHART_COLORS.previous }}></div>
            <span className="text-sm text-gray-700">Mês Anterior</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
