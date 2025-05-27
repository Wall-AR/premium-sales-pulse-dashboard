
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DailySale {
  date: string;
  sales: number;
  goal: number;
}

interface SalesChartProps {
  data: DailySale[];
}

export const SalesChart = ({ data }: SalesChartProps) => {
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <CardTitle>📈 Sales Evolution</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
              <XAxis 
                dataKey="date" 
                stroke="#047857"
                fontSize={12}
              />
              <YAxis 
                stroke="#047857"
                fontSize={12}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`R$ ${value.toLocaleString()}`, '']}
                labelStyle={{ color: '#047857' }}
                contentStyle={{ 
                  backgroundColor: '#f0fdf4', 
                  border: '1px solid #10b981',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#047857', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="goal" 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center mt-4 space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <span className="text-sm text-emerald-700">Actual Sales</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-red-500"></div>
            <span className="text-sm text-red-700">Daily Goal</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
