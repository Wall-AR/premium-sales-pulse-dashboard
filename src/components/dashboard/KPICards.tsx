
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
  const newClientPercentage = (data.newClients / data.totalClients) * 100;

  const kpis = [
    {
      title: "Total Sales",
      value: `R$ ${data.totalSold.toLocaleString()}`,
      icon: DollarSign,
      color: "emerald",
      subtitle: `${goalPercentage.toFixed(1)}% of goal`,
      trend: goalPercentage >= 100 ? "up" : "neutral"
    },
    {
      title: "Total Clients",
      value: data.totalClients.toLocaleString(),
      icon: Users,
      color: "green",
      subtitle: `${data.newClients} new clients`,
      trend: "up"
    },
    {
      title: "Goal Achievement",
      value: `${goalPercentage.toFixed(1)}%`,
      icon: Target,
      color: goalPercentage >= 100 ? "emerald" : goalPercentage >= 80 ? "yellow" : "red",
      subtitle: `R$ ${data.totalGoal.toLocaleString()} target`,
      trend: goalPercentage >= 100 ? "up" : "neutral"
    },
    {
      title: "Avg. Ticket",
      value: `R$ ${data.globalAvgTicket.toLocaleString()}`,
      icon: TrendingUp,
      color: "teal",
      subtitle: "Per client",
      trend: "up"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} className="bg-white border-l-4 border-l-emerald-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                <p className="text-2xl font-bold text-emerald-800 mt-1">{kpi.value}</p>
                <p className="text-xs text-gray-500 mt-1">{kpi.subtitle}</p>
              </div>
              <div className={`p-3 rounded-full bg-${kpi.color}-100`}>
                <kpi.icon className={`w-6 h-6 text-${kpi.color}-600`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
