
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Target, DollarSign } from "lucide-react"; // Removed Loader2
import type { KPI, BillingStatement } from "@/lib/supabaseQueries"; // Added BillingStatement
import { AlertCircle, Banknote } from "lucide-react"; // Added new icons

interface KPICardSkeletonProps {
  count?: number;
}

const KPICardSkeleton: React.FC<KPICardSkeletonProps> = ({ count = 6 }) => { // Updated count to 6
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"> {/* Adjusted grid for 6 items */}
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="bg-white shadow-sm rounded-xl animate-pulse"> {/* Simpler skeleton card style */}
          <CardContent className="p-4 flex flex-col items-start gap-1">
            <div className="w-5 h-5 bg-gray-300 rounded-full mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface KPICardsProps {
  kpiData: KPI | null | undefined; // Renamed from data
  billingData?: BillingStatement | null;
  activeMonthYear?: string;
}

export const KPICards = ({ kpiData, billingData, activeMonthYear }: KPICardsProps) => {
  // Handle loading state for kpiData. billingData is optional and might not be present if no month is selected.
  if (!kpiData) {
    return <KPICardSkeleton count={6} />; // Show all 6 skeletons if kpiData is loading
  }

  const totalSold = kpiData.total_sold ?? 0;
  const totalGoal = kpiData.total_goal ?? 0; // Keep ?? 0 for calculations, subtitle handles "not defined"
  const totalClients = kpiData.total_clients ?? 0;
  const newClients = kpiData.new_clients ?? 0;
  const globalAvgTicket = kpiData.global_avg_ticket ?? 0;

  const goalPercentage = totalGoal > 0 ? (totalSold / totalGoal) * 100 : 0;


  const kpiCardsDefinition = [
    {
      title: "Total Vendido (KPI)",
      value: `R$ ${totalSold.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      subtitle: totalGoal > 0 ? `${goalPercentage.toFixed(0)}% da meta de KPI` : "Meta de KPI não definida",
    },
    {
      title: "Clientes Atendidos",
      value: totalClients.toLocaleString('pt-BR'),
      icon: Users,
      subtitle: `${newClients.toLocaleString('pt-BR')} novos clientes (KPI)`,
    },
    {
      title: "Ticket Médio (KPI)",
      value: `R$ ${globalAvgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      subtitle: "Média por venda (KPI)",
    },
    {
      title: "Novos Clientes (KPI)",
      value: newClients.toLocaleString('pt-BR'),
      icon: Users,
      subtitle: "Conquistados no período (KPI)",
    }
  ];

  const billingCardsDefinition = [
    {
      title: "Faturamento no Mês",
      value: `R$ ${(billingData?.faturamento_released ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: Banknote, // Using Banknote for faturamento
      subtitle: activeMonthYear
                  ? `Referente a ${new Date(activeMonthYear + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
                  : "Nenhum mês selecionado",
    },
    {
      title: "Faturamento ATR",
      value: `R$ ${(billingData?.faturamento_atr ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: AlertCircle,
      subtitle: "Pedidos liberados em atraso",
    }
  ];

  // Combine cards. Only show billing cards if a month is selected (which implies billingData might be available)
  const allCards = activeMonthYear ? [...kpiCardsDefinition, ...billingCardsDefinition] : kpiCardsDefinition;

  return (
    // Adjusted grid for potentially 6 items, but will adapt if fewer
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      {allCards.map((kpi, index) => (
        <Card key={index} className="bg-white shadow-sm rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105">
          <CardContent className="p-4 flex flex-col items-start gap-1">
            <kpi.icon className="w-5 h-5 text-primary-green mb-1" />
            <p className="text-sm text-gray-500">{kpi.title}</p> {/* Label style */}
            <p className="text-xl font-semibold text-primary-green">{kpi.value}</p> {/* Updated metric color */}
            <p className="text-xs text-gray-500">{kpi.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
