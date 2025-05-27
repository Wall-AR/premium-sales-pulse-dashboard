
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Target, DollarSign } from "lucide-react";

interface KPICardsProps {
  data: {
    totalSold: number;
    totalGoal: number;
    totalClients: number;
    newClients: number;
    globalAvgTicket: number;
  };
}

export const KPICards = ({ data }: KPICardsProps) => {
  const goalPercentage = (data.totalSold / data.totalGoal) * 100;

  const kpis = [
    {
      title: "Total Vendido",
      value: `R$ ${data.totalSold.toLocaleString()}`,
      icon: DollarSign,
      color: "emerald",
      subtitle: `↗ ${goalPercentage.toFixed(1)}% da meta`,
      bgColor: "bg-white"
    },
    {
      title: "Total Clientes", 
      value: data.totalClients.toLocaleString(),
      icon: Users,
      color: "emerald",
      subtitle: `👥 ${data.newClients} novos`,
      bgColor: "bg-white"
    },
    {
      title: "Ticket Médio",
      value: `R$ ${data.globalAvgTicket.toLocaleString()}`,
      icon: TrendingUp,
      color: "emerald", 
      subtitle: "📊 Por vendedor",
      bgColor: "bg-white"
    },
    {
      title: "Faturado",
      value: `R$ ${(data.totalSold * 0.8).toLocaleString()}`,
      icon: Target,
      color: "gray",
      subtitle: `● R$ ${(data.totalSold * 0.2).toLocaleString()} atrasado`,
      bgColor: "bg-white"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className={`${kpi.bgColor} shadow-sm border hover:shadow-md transition-shadow`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                <p className="text-xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                <p className="text-xs text-gray-500">{kpi.subtitle}</p>
              </div>
              <div className="ml-3">
                <kpi.icon className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
