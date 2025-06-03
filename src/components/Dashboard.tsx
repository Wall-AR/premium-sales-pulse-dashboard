
import { KPICards } from "./dashboard/KPICards";
import { SalespersonRanking } from "./dashboard/SalespersonRanking";
import { GoalProgress } from "./dashboard/GoalProgress";
import { SalesChart } from "./dashboard/SalesChart";
import { CustomerAnalysis } from "./dashboard/CustomerAnalysis";
import { DashboardFilters } from "./dashboard/DashboardFilters";
import { Navigation } from "./Navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getKPIs, getAllSellerProfiles, getDailySales, SellerProfile } from "@/lib/supabaseQueries"; // Updated import
import type { KPI, DailySale } from "@/lib/supabaseQueries"; // Removed Salesperson, SellerProfile already imported

export const Dashboard = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'ranking' | 'charts' | 'analysis'>('overview');

  // activeFilters will be managed by DashboardFilters in a later step.
  // For now, month_year is undefined, so supabaseQueries will fetch the latest data.
  const [activeFilters] = useState<{ month_year?: string }>({});

  const {
    data: kpisData,
    isLoading: kpisLoading,
    error: kpisError
  } = useQuery<KPI | null, Error, KPI | null, ['kpis', { month_year?: string }]>(
    { queryKey: ['kpis', activeFilters], queryFn: () => getKPIs(activeFilters.month_year) }
  );

  const {
    data: salespeopleData,
    isLoading: salespeopleLoading,
    error: salespeopleError
  } = useQuery<SellerProfile[], Error>({ // Updated type
    queryKey: ['allSellerProfilesForDashboard'], // New queryKey
    queryFn: getAllSellerProfiles // Updated queryFn
  });

  const {
    data: dailySalesData,
    isLoading: dailySalesLoading,
    error: dailySalesError
  } = useQuery<DailySale[], Error, DailySale[], ['dailySales', { month_year?: string }]>(
    { queryKey: ['dailySales', activeFilters], queryFn: () => getDailySales(activeFilters.month_year) }
  );

  const navigationButtons = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'ranking', label: 'Ranking', icon: Users },
    { id: 'charts', label: 'Gráficos', icon: TrendingUp },
    { id: 'analysis', label: 'Análise', icon: Target }
  ];

  if (kpisLoading || salespeopleLoading || dailySalesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div role="status">
              <svg aria-hidden="true" className="inline w-10 h-10 text-green-500 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#10B981"/> {/* Green-500 */}
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-700">Carregando dados do dashboard...</p>
            <p className="text-sm text-gray-500">Por favor, aguarde um momento.</p>
          </div>
        </div>
      </div>
    );
  }

  if (kpisError || salespeopleError || dailySalesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 bg-white shadow-xl rounded-lg">
            <Target className="w-16 h-16 text-red-500 mx-auto mb-4" /> {/* Using Target as a generic error icon */}
            <h2 className="text-2xl font-bold text-red-700 mb-2">Oops! Algo deu errado.</h2>
            <p className="text-gray-600 mb-6">Não foi possível carregar os dados do dashboard. Por favor, tente novamente mais tarde.</p>
            <Button
              onClick={() => {
                // Optional: Implement a refetch mechanism here if desired
                // For now, it just acts as a placeholder or could reload the page
                window.location.reload();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Tentar Novamente
            </Button>
             <p className="text-xs text-gray-400 mt-4">
              {kpisError?.message || salespeopleError?.message || dailySalesError?.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <KPICards data={kpisData} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SalespersonRanking salespeople={salespeopleData} />
              </div>
              <div className="lg:col-span-1">
                <GoalProgress salespeople={salespeopleData} />
              </div>
            </div>
          </div>
        );
      case 'ranking':
        return <SalespersonRanking salespeople={salespeopleData} />;
      case 'charts':
        return <SalesChart data={dailySalesData} />;
      case 'analysis':
        return <CustomerAnalysis data={kpisData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Navigation />
      
      {/* Header Principal Melhorado */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white pt-28 pb-6"> {/* Padding Adjusted */}
        <div className="container mx-auto px-6 max-w-screen-xl"> {/* Width Constrained */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/91053ff3-b80e-46d3-bc7c-59736d93d8dd.png" 
                alt="NutraManager Logo"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-3xl font-bold">NutraManager Dashboard</h1>
                <p className="text-green-100 mt-1">Sistema Avançado de Gestão de Vendas e Performance</p>
              </div>
            </div>
            <div className="text-right text-green-100">
              <p className="text-sm">Dashboard Profissional</p>
              {/* This date can be dynamic based on selected filter or current date */}
              <p className="text-xs">{activeFilters.month_year || new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric'})}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Barra Lateral de Filtros */}
          <div className="lg:col-span-1">
            <DashboardFilters /> {/* DashboardFilters will eventually set activeFilters */}
          </div>
          
          {/* Card Principal Unificado */}
          <div className="lg:col-span-4">
            <Card className="bg-white shadow-xl border-green-100">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="w-6 h-6 mr-3" />
                    Dashboard de Vendas
                  </div>
                  <div className="text-sm font-normal">
                    {new Date().toLocaleDateString('pt-BR')}
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                {/* Navegação por Abas */}
                <div className="bg-green-50 border-b border-green-200 p-4">
                  <div className="flex flex-wrap gap-2">
                    {navigationButtons.map((button) => (
                      <Button
                        key={button.id}
                        variant={activeSection === button.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveSection(button.id as any)}
                        className={`transition-all duration-200 ${
                          activeSection === button.id
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'border-green-300 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        <button.icon className="w-4 h-4 mr-2" />
                        {button.label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Conteúdo da Seção Ativa */}
                <div className="p-6">
                  {renderContent()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
