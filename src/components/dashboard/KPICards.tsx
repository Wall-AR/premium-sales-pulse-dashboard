
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Target, DollarSign } from "lucide-react"; // Removed Loader2
import type { KPI } from "@/lib/supabaseQueries";

interface KPICardSkeletonProps {
  count?: number;
}

const KPICardSkeleton: React.FC<KPICardSkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="bg-white shadow-lg border-2 border-gray-100 animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="ml-3">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface KPICardsProps {
  data: KPI | null | undefined;
}

export const KPICards = ({ data }: KPICardsProps) => {
  if (!data) {
    return <KPICardSkeleton />;
  }

  // Ensure data is not null and properties exist, especially for calculations
  const totalSold = data.total_sold ?? 0;
  const totalGoal = data.total_goal ?? 1; // Avoid division by zero
  const totalClients = data.total_clients ?? 0;
  const newClients = data.new_clients ?? 0;
  const globalAvgTicket = data.global_avg_ticket ?? 0;
  
  const goalPercentage = (totalSold / (totalGoal === 0 ? 1 : totalGoal)) * 100; // Avoid division by zero

  const kpis = [
    {
      title: "Total Vendido",
      value: `R$ ${totalSold.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      // color: "emerald", // Removed unused property
      subtitle: totalGoal > 0 ? `↗ ${goalPercentage.toFixed(1)}% da meta` : "Meta não definida",
      bgColor: "bg-white",
      borderColor: "border-green-200"
    },
    {
      title: "Total de Clientes", 
      value: totalClients.toLocaleString('pt-BR'),
      icon: Users,
      // color: "emerald", // Removed unused property
      subtitle: `👥 ${newClients} novos clientes`,
      bgColor: "bg-white",
      borderColor: "border-green-200"
    },
    {
      title: "Ticket Médio",
      value: `R$ ${globalAvgTicket.toLocaleString('pt-BR')}`,
      icon: TrendingUp,
      // color: "emerald", // Removed unused property
      subtitle: "📊 Média por venda", // Changed subtitle for clarity
      bgColor: "bg-white",
      borderColor: "border-green-200"
    },
    {
      title: "Valor Faturado (Exemplo)", // Clarified this is an example
      value: `R$ ${(totalSold * 0.8).toLocaleString('pt-BR')}`, // Example calculation
      icon: Target,
      // color: "gray", // Removed unused property
      subtitle: `● R$ ${(totalSold * 0.2).toLocaleString('pt-BR')} (Exemplo Atraso)`, // Example calculation
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
