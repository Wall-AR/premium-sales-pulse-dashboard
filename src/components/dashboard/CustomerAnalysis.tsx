
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface CustomerAnalysisProps {
  data: {
    totalClients: number;
    newClients: number;
    globalAvgTicket: number;
  };
}

export const CustomerAnalysis = ({ data }: CustomerAnalysisProps) => {
  const returningClients = data.totalClients - data.newClients;
  const newClientPercentage = (data.newClients / data.totalClients) * 100;
  
  const pieData = [
    { name: 'New Clients', value: data.newClients, color: '#10b981' },
    { name: 'Returning Clients', value: returningClients, color: '#059669' }
  ];

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <CardTitle>👥 Customer Analysis</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, '']}
                  contentStyle={{ 
                    backgroundColor: '#f0fdf4', 
                    border: '1px solid #10b981',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Statistics */}
          <div className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-lg">
              <h3 className="font-semibold text-emerald-800">Total Clients</h3>
              <p className="text-2xl font-bold text-emerald-600">{data.totalClients}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">New Clients</h3>
              <p className="text-2xl font-bold text-green-600">{data.newClients}</p>
              <p className="text-sm text-green-600">{newClientPercentage.toFixed(1)}% of total</p>
            </div>
            
            <div className="bg-teal-50 p-4 rounded-lg">
              <h3 className="font-semibold text-teal-800">Avg. Ticket</h3>
              <p className="text-2xl font-bold text-teal-600">R$ {data.globalAvgTicket.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center mt-6 space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <span className="text-sm text-emerald-700">New Clients</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-emerald-600 rounded"></div>
            <span className="text-sm text-emerald-700">Returning Clients</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
