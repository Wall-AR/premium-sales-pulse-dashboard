import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSalespeopleWithPerformance, SalespersonPerformance, getDailySales, DailySale } from '@/lib/supabaseQueries'; // Added getDailySales, DailySale
import { Navigation } from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Building, Users, BarChartBig, Loader2, Target, Award, Star, LineChart as LineChartIcon } from 'lucide-react'; // Added LineChartIcon
import { SalesChart } from '@/components/dashboard/SalesChart'; // Added SalesChart import

// Internal GoalBlock Component
interface GoalBlockProps {
  title: string;
  achievedAmount: number;
  goalAmount: number;
  icon?: React.ElementType;
}
const GoalBlock: React.FC<GoalBlockProps> = ({ title, achievedAmount, goalAmount, icon: Icon }) => {
  const percentage = goalAmount > 0 ? Math.min((achievedAmount / goalAmount) * 100, 100) : 0;
  let statusText = "Meta não definida";
  let statusColor = "text-gray-500";

  if (goalAmount > 0) {
    if (percentage >= 100) {
      statusText = "Alcançada!";
      statusColor = "text-primary-green";
    } else if (achievedAmount > 0) {
      statusText = "Em Progresso";
      statusColor = "text-yellow-600"; // Using yellow for in progress
    } else {
      statusText = "Não Iniciada";
      statusColor = "text-red-600"; // Using red for not started but goal defined
    }
  }

  // Ensure achievedAmount does not visually exceed goalAmount in progress bar
  const displayPercentage = Math.min(percentage, 100);

  return (
    <Card className="bg-white shadow-sm rounded-xl">
      <CardHeader className="pb-2 pt-4 px-4"> {/* Adjusted padding */}
        <CardDescription className="flex items-center text-sm text-gray-500">
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {title}
        </CardDescription>
        <CardTitle className="text-2xl font-bold text-primary-green">
          {goalAmount > 0 ? `${percentage.toFixed(0)}%` : 'N/A'}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4"> {/* Adjusted padding */}
        <p className="text-xs text-gray-500">
          {achievedAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })} /
          {goalAmount > 0 ? goalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }) : "N/A"}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className="bg-primary-green h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${displayPercentage}%` }}
          ></div>
        </div>
        <p className={`text-xs mt-1 font-semibold ${statusColor}`}>{statusText}</p>
      </CardContent>
    </Card>
  );
};


const CompanyReportPage = () => {
  const defaultMonth = () => new Date().toISOString().substring(0, 7);
  const [activeMonthYear, setActiveMonthYear] = React.useState<string>(defaultMonth());

  const { data: performanceData, isLoading: isLoadingPerformance } = useQuery<SalespersonPerformance[], Error>({
    queryKey: ['salespeoplePerformanceCompanyReport', activeMonthYear],
    queryFn: () => getSalespeopleWithPerformance(activeMonthYear),
  });

  // This counts all sellers returned for the given month's performance data.
  // If "active" means based on their 'status' field from SellerProfile,
  // this would need client-side filtering on performanceData or a dedicated query.
  // For now, it's the count of sellers for whom performance data was fetched for the activeMonthYear.
  const totalActiveSellers = performanceData?.filter(p => p.status === 'active').length ?? 0;

  const companyMonthlyMetrics = React.useMemo(() => {
    if (!performanceData || performanceData.length === 0) {
      return {
        totalSales: 0,
        companyGoal: 0,
        goalAchievedPercentage: 0,
        averageTicket: 0,
        totalClients: 0,
        companyChallengeGoalTotal: 0, // Added
        companyMegaGoalTotal: 0,      // Added
        sellersMeetingChallenge: 0,   // Added
        sellersMeetingMegaGoal: 0,    // Added
      };
    }

    const totalSales = performanceData.reduce((sum, p) => sum + p.total_sales_amount, 0);
    const companyGoal = performanceData.reduce((sum, p) => sum + (p.current_goal_value ?? 0), 0);
    const companyChallengeGoalTotal = performanceData.reduce((sum, p) => sum + (p.current_challenge_value ?? 0), 0);
    const companyMegaGoalTotal = performanceData.reduce((sum, p) => sum + (p.current_mega_goal_value ?? 0), 0);

    let sellersMeetingChallenge = 0;
    let sellersMeetingMegaGoal = 0;
    performanceData.forEach(person => {
      if ((person.current_challenge_value ?? 0) > 0 && person.total_sales_amount >= (person.current_challenge_value ?? 0)) {
        sellersMeetingChallenge++;
      }
      if ((person.current_mega_goal_value ?? 0) > 0 && person.total_sales_amount >= (person.current_mega_goal_value ?? 0)) {
        sellersMeetingMegaGoal++;
      }
    });

    const totalClients = performanceData.reduce((sum, p) => sum + p.number_of_sales, 0);
    const goalAchievedPercentage = companyGoal > 0 ? (totalSales / companyGoal) * 100 : 0;
    const averageTicket = totalClients > 0 ? totalSales / totalClients : 0;

    return {
      totalSales,
      companyGoal,
      goalAchievedPercentage,
      averageTicket,
      totalClients,
      companyChallengeGoalTotal,
      companyMegaGoalTotal,
      sellersMeetingChallenge,
      sellersMeetingMegaGoal,
    };
  }, [performanceData]);

  const {
    data: companyDailySalesData,
    isLoading: isLoadingDailySales,
    // error: errorDailySales // Optional: add error handling for this specific query
  } = useQuery<{ currentMonthSales: DailySale[], previousMonthSales: DailySale[] }, Error>({
    queryKey: ['companyDailySales', activeMonthYear], // Unique query key for this page
    queryFn: () => {
      if (!activeMonthYear) return { currentMonthSales: [], previousMonthSales: [] };
      return getDailySales(activeMonthYear);
    },
    enabled: !!activeMonthYear, // Fetch only if a month is selected/defaulted
  });


  if (isLoadingPerformance || isLoadingDailySales) { // Added isLoadingDailySales
    return (
      <div className="min-h-screen bg-neutral-bg flex flex-col">
        <Navigation />
        <div className="flex-grow flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary-green animate-spin" />
          <p className="ml-4 text-primary-green text-xl">Carregando relatório da empresa...</p>
        </div>
      </div>
    );
  }
  // Basic error handling can be added here if needed for performanceData or dailySales fetch

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Navigation />
      <div className="container mx-auto px-6 pt-[96px] pb-20">
        <div className="flex justify-between items-center mb-6"> {/* Reduced mb for filter bar space */}
          <div className="flex items-center space-x-3">
            <Building className="w-10 h-10 text-primary-green" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Relatório Geral da Empresa</h1>
              <p className="text-gray-500">Visão consolidada da performance e metas.</p>
            </div>
          </div>
          {/* Placeholder for global actions like Export */}
        </div>

        {/* Month Filter UI */}
        <div className="mb-8 p-4 bg-white shadow rounded-lg flex items-center gap-4">
          <Label htmlFor="companyReportMonthFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Filtrar por Mês/Ano:
          </Label>
          <Input
            type="month"
            id="companyReportMonthFilter"
            value={activeMonthYear} // No || '' needed as it's always string
            onChange={(e) => setActiveMonthYear(e.target.value || defaultMonth())} // Fallback to defaultMonth if cleared
            className="border-gray-300 focus:border-primary-green rounded-md shadow-sm w-auto max-w-[200px]"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveMonthYear(defaultMonth())}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Mês Atual
          </Button>
        </div>

        {/* Section 1: General Company Info */}
        <Card className="mb-6 bg-white shadow-md rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-green" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div>
              <Label className="text-sm text-gray-500">Nome da Empresa</Label>
              <p className="text-lg font-semibold text-gray-700">NutraManager (Exemplo)</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Total de Vendedores Ativos</Label>
              <p className="text-lg font-semibold text-gray-700">{totalActiveSellers}</p>
            </div>
            {/* TODO: Add Logo, Company Type, Observation notes here if needed */}
          </CardContent>
        </Card>

        {/* Placeholder for Section 2: Monthly Sales Overview */}
        <Card className="mb-6 bg-white shadow-md rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
              <BarChartBig className="w-5 h-5 mr-2 text-primary-green" />
              Visão Geral das Vendas Mensais
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-sm text-gray-500">Total de Vendas (Mês)</Label>
                <p className="text-xl font-semibold text-primary-green">
                  {companyMonthlyMetrics.totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Meta da Empresa (Mês)</Label>
                <p className={`text-xl font-semibold ${companyMonthlyMetrics.companyGoal > 0 ? 'text-primary-green' : 'text-gray-400'}`}>
                  {companyMonthlyMetrics.companyGoal > 0
                    ? companyMonthlyMetrics.companyGoal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
                    : "Não definida"}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">% Meta Alcançada</Label>
                <p className="text-xl font-semibold text-primary-green">
                  {companyMonthlyMetrics.companyGoal > 0 ? companyMonthlyMetrics.goalAchievedPercentage.toFixed(1) + '%' : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Ticket Médio (Empresa)</Label>
                <p className="text-xl font-semibold text-primary-green">
                  {companyMonthlyMetrics.averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Total Vendas Realizadas (Mês)</Label>
                <p className="text-xl font-semibold text-primary-green">
                  {companyMonthlyMetrics.totalClients}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Dados referentes a: {new Date(activeMonthYear + '-02').toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'})}
            </p>
          </CardContent>
        </Card>

                {/* Section 3: Goal Progress Blocks */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center text-2xl font-bold text-gray-800 mb-4">
                    <Target className="w-6 h-6 mr-2 text-primary-green" />
                    Progresso das Metas da Empresa
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GoalBlock
                      title="Meta Principal Empresa"
                      achievedAmount={companyMonthlyMetrics.totalSales}
                      goalAmount={companyMonthlyMetrics.companyGoal}
                      icon={Target}
                    />
                    <GoalBlock
                      title="Desafio Empresa"
                      achievedAmount={companyMonthlyMetrics.totalSales}
                      goalAmount={companyMonthlyMetrics.companyChallengeGoalTotal}
                      icon={Award}
                    />
                    <GoalBlock
                      title="Mega Meta Empresa"
                      achievedAmount={companyMonthlyMetrics.totalSales}
                      goalAmount={companyMonthlyMetrics.companyMegaGoalTotal}
                      icon={Star}
                    />
                  </div>
                </div>

                {/* TODO: Placeholder for Sellers Meeting Challenge/Mega count display if not in GoalBlock itself */}
                {/* Example:
                <div className="mt-4">
                    <p>Vendedores que bateram Desafio: {companyMonthlyMetrics.sellersMeetingChallenge}</p>
                    <p>Vendedores que bateram Mega: {companyMonthlyMetrics.sellersMeetingMegaGoal}</p>
                </div>
                */}

                {/* Section 4: Monthly Comparison Chart */}
                <Card className="mt-8 bg-white shadow-md rounded-xl"> {/* Added mt-8 for spacing */}
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-800 flex items-center"> {/* Consistent title style */}
                      <LineChartIcon className="w-5 h-5 mr-2 text-primary-green" />
                      Tendência de Vendas da Empresa (Diário)
                    </CardTitle>
                    <CardDescription>Comparativo do mês atual com o mês anterior, baseado no filtro de período selecionado.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {isLoadingDailySales && <p className="text-sm text-gray-500">Carregando gráfico de vendas...</p>}
                    {/* TODO: Add specific error display for errorDailySales if implemented */}
                    {!isLoadingDailySales && companyDailySalesData && (companyDailySalesData.currentMonthSales.length > 0 || companyDailySalesData.previousMonthSales.length > 0) && (
                      <SalesChart data={companyDailySalesData} />
                    )}
                    {!isLoadingDailySales && (!companyDailySalesData || (companyDailySalesData.currentMonthSales.length === 0 && companyDailySalesData.previousMonthSales.length === 0)) && (
                      <p className="text-gray-500">Nenhum dado de vendas diárias para exibir o gráfico para o período selecionado.</p>
                    )}
                  </CardContent>
                </Card>

      </div>
    </div>
  );
};
export default CompanyReportPage;
