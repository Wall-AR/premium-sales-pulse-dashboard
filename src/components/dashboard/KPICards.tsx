
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
      value: `R$ ${data.totalSold.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: "emerald",
      subtitle: `↗ ${goalPercentage.toFixed(1)}% da meta`,
      bgColor: "bg-white",
      borderColor: "border-green-200"
    },
    {
      title: "Total de Clientes", 
      value: data.totalClients.toLocaleString('pt-BR'),
      icon: Users,
      color: "emerald",
      subtitle: `👥 ${data.newClients} novos clientes`,
      bgColor: "bg-white",
      borderColor: "border-green-200"
    },
    {
      title: "Ticket Médio",
      value: `R$ ${data.globalAvgTicket.toLocaleString('pt-BR')}`,
      icon: TrendingUp,
      color: "emerald", 
      subtitle: "📊 Média por vendedor",
      bgColor: "bg-white",
      borderColor: "border-green-200"
    },
    {
      title: "Valor Faturado",
      value: `R$ ${(data.totalSold * 0.8).toLocaleString('pt-BR')}`,
      icon: Target,
      color: "gray",
      subtitle: `● R$ ${(data.totalSold * 0.2).toLocaleString('pt-BR')} em atraso`,
      bgColor: "bg-white",
      borderColor: "border-green-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} className={`${kpi.bgColor} shadow-lg border-2 ${kpi.borderColor} hover:shadow-xl transition-all duration-300 hover:scale-105`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700 mb-2">{kpi.title}</p>
                <p className="text-2xl font-bold text-green-800 mb-2">{kpi.value}</p>
                <p className="text-xs text-green-600">{kpi.subtitle}</p>
              </div>
              <div className="ml-3">
                <kpi.icon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
