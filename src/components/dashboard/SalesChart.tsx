
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { DailySale } from "@/lib/supabaseQueries";
import { Info, TrendingUp } from "lucide-react"; // Added icons

interface SalesChartProps {
  data: DailySale[] | null | undefined;
}

const SalesChartSkeleton: React.FC = () => {
  return (
    <Card className="bg-white shadow-lg animate-pulse">
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <div className="h-6 bg-green-500 rounded w-1/3"></div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-80 bg-gray-200 rounded"></div>
        <div className="flex items-center justify-center mt-4 space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-gray-300"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const formatDateTick = (tickItem: string) => {
  // Assuming tickItem is a string like "YYYY-MM-DD"
  const date = new Date(tickItem + "T00:00:00"); // Ensure parsing as local date
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};


export const SalesChart = ({ data }: SalesChartProps) => {
  if (data === undefined) {
    return <SalesChartSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
          <CardTitle className="flex items-center"><TrendingUp className="mr-2" /> Evolução de Vendas</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-gray-500">
          <Info className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          Nenhum dado de vendas diárias disponível para exibir o gráfico.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <CardTitle className="flex items-center"><TrendingUp className="mr-2" /> Evolução de Vendas</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-80"> {/* Ensure this has a defined height */}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" /> {/* Light blue grid */}
              <XAxis 
                dataKey="date" 
                stroke="#047857" // Dark green text
                fontSize={12}
                tickFormatter={formatDateTick} // Apply date formatter
              />
              <YAxis 
                stroke="#047857" // Dark green text
                fontSize={12}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const formattedValue = `R$ ${value.toLocaleString('pt-BR')}`;
                  if (name === 'sales') return [formattedValue, 'Vendas'];
                  if (name === 'goal') return [formattedValue, 'Meta'];
                  return [formattedValue, name];
                }}
                labelFormatter={(label: string) => new Date(label + "T00:00:00").toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                labelStyle={{ color: '#047857', fontWeight: 'bold' }} // Dark green label
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
                  border: '1px solid #10b981', // Emerald border
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)' // Soft shadow
                }}
                itemStyle={{ color: '#065f46' }} // Darker green for item text
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                name="Vendas" // Name for tooltip
                stroke="#10b981" // Emerald-500
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 1, r: 4, stroke: 'white' }}
                activeDot={{ r: 7, stroke: '#047857', strokeWidth: 2, fill: '#10b981' }}
              />
              <Line 
                type="monotone" 
                dataKey="goal" 
                name="Meta" // Name for tooltip
                stroke="#ef4444" // Red-500
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
            <span className="text-sm text-emerald-700">Vendas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-red-500" style={{height: '2px'}}></div> {/* Make line thinner */}
            <span className="text-sm text-red-700">Meta Diária</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
