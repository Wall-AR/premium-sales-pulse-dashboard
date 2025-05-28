
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { KPI } from "@/lib/supabaseQueries";
import { Users, UserPlus, DollarSign, Info } from "lucide-react"; // Added icons

interface CustomerAnalysisProps {
  data: KPI | null | undefined;
}

const CustomerAnalysisSkeleton: React.FC = () => {
  return (
    <Card className="bg-white shadow-lg animate-pulse">
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <div className="h-6 bg-green-500 rounded w-1/2"></div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="h-48 bg-gray-200 rounded-full w-48 mx-auto lg:mx-0"></div>
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 mt-1"></div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const CustomerAnalysis = ({ data }: CustomerAnalysisProps) => {
  if (data === undefined) {
    return <CustomerAnalysisSkeleton />;
  }

  if (!data) {
    return (
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
          <CardTitle className="flex items-center"><Users className="mr-2" /> Análise de Clientes</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-gray-500">
          <Info className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          Nenhum dado de análise de clientes disponível.
        </CardContent>
      </Card>
    );
  }

  const totalClients = data.total_clients ?? 0;
  const newClients = data.new_clients ?? 0;
  const globalAvgTicket = data.global_avg_ticket ?? 0;

  const returningClients = totalClients - newClients;
  const newClientPercentage = totalClients > 0 ? (newClients / totalClients) * 100 : 0;
  
  const pieData = [
    { name: 'Novos Clientes', value: newClients, color: '#10b981' }, // emerald-500
    { name: 'Clientes Recorrentes', value: returningClients < 0 ? 0 : returningClients, color: '#059669' } // emerald-600
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-700">{`${payload[0].name}: ${payload[0].value.toLocaleString('pt-BR')}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <CardTitle className="flex items-center"><Users className="mr-2" /> Análise de Clientes</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Pie Chart */}
          <div className="h-52 sm:h-60"> {/* Adjusted height */}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50} // Adjusted radius
                  outerRadius={90} // Adjusted radius
                  dataKey="value"
                  paddingAngle={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value, entry) => <span className="text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Statistics */}
          <div className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-emerald-800 flex items-center mb-1">
                <Users className="w-5 h-5 mr-2 text-emerald-700" /> Total de Clientes
              </h3>
              <p className="text-3xl font-bold text-emerald-600">{totalClients.toLocaleString('pt-BR')}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-green-800 flex items-center mb-1">
                <UserPlus className="w-5 h-5 mr-2 text-green-700" /> Novos Clientes
              </h3>
              <p className="text-3xl font-bold text-green-600">{newClients.toLocaleString('pt-BR')}</p>
              {totalClients > 0 && (
                <p className="text-sm text-green-600">{newClientPercentage.toFixed(1)}% do total</p>
              )}
            </div>
            
            <div className="bg-teal-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-teal-800 flex items-center mb-1">
                <DollarSign className="w-5 h-5 mr-2 text-teal-700" /> Ticket Médio Global
              </h3>
              <p className="text-3xl font-bold text-teal-600">R$ {globalAvgTicket.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        {/* Legend is now part of Recharts Pie component */}
      </CardContent>
    </Card>
  );
};
