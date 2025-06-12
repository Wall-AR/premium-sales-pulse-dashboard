
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
      value: `R$ ${totalSold.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      subtitle: totalGoal > 0 ? `${goalPercentage.toFixed(0)}% da meta` : "Meta não definida",
    },
    {
      title: "Clientes Atendidos",
      value: totalClients.toLocaleString('pt-BR'),
      icon: Users,
      subtitle: `${newClients.toLocaleString('pt-BR')} novos clientes`,
    },
    {
      title: "Ticket Médio",
      value: `R$ ${globalAvgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      subtitle: "Média por venda",
    },
    {
      title: "Novos Clientes",
      value: newClients.toLocaleString('pt-BR'),
      icon: Users, // Reusing Users icon, or could be a specific "new user" icon like UserPlus
      subtitle: "Conquistados no período",
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} className="bg-white shadow-sm rounded-xl transition-shadow duration-300 hover:shadow-md">
          <CardContent className="p-4 flex flex-col items-start gap-1">
            <kpi.icon className="w-5 h-5 text-green-600 mb-1" /> {/* Icon color from spec is green-600 */}
            <p className="text-sm text-gray-500">{kpi.title}</p> {/* Label style */}
            <p className="text-xl font-semibold text-green-700">{kpi.value}</p> {/* Metric style */}
            <p className="text-xs text-gray-500">{kpi.subtitle}</p> {/* Subtext style */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
