
import { KPICards } from "./dashboard/KPICards";
import { SalespersonRanking } from "./dashboard/SalespersonRanking";
import { GoalProgress } from "./dashboard/GoalProgress";
import { SalesChart } from "./dashboard/SalesChart";
import { CustomerAnalysis } from "./dashboard/CustomerAnalysis";
import { DashboardFilters } from "./dashboard/DashboardFilters";
import { Navigation } from "./Navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Target, TrendingUp, SlidersHorizontal } from "lucide-react"; // Added SlidersHorizontal
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getKPIs, getDailySales, getSalespeopleWithPerformance, getBillingEntriesForMonth } from "@/lib/supabaseQueries"; // Renamed getBillingStatementForMonth
import type { KPI, DailySale, SalespersonPerformance, BillingEntry } from "@/lib/supabaseQueries"; // Renamed BillingStatement
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // Added Sheet components

export const Dashboard = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'ranking' | 'charts' | 'analysis'>('overview');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{ month_year?: string }>({});

  const handleMonthYearChange = (newMonthYear?: string) => {
    setActiveFilters(prevFilters => ({ ...prevFilters, month_year: newMonthYear }));
    // Potentially reset other filters here if month_year changes, e.g., salesperson_id, customer_type
    // For now, just updating month_year
  };

  const {
    data: kpisData,
    isLoading: kpisLoading,
    error: kpisError
  } = useQuery<KPI | null, Error, KPI | null, ['kpis', { month_year?: string }]>(
    { queryKey: ['kpis', activeFilters], queryFn: () => getKPIs(activeFilters.month_year) }
  );

  const {
    data: billingEntriesData, // Renamed
    isLoading: isLoadingBillingEntries, // Renamed
    // error: errorBillingEntries
  } = useQuery<BillingEntry[], Error>({ // Expects BillingEntry[]
    queryKey: ['billingEntriesForMonth', activeFilters.month_year], // New queryKey
    queryFn: () => {
      if (!activeFilters.month_year) {
        console.log('[Dashboard.tsx] No month_year filter set for billing entries, returning empty array.');
        return [];
      }
      console.log('[Dashboard.tsx] Fetching billing entries for month:', activeFilters.month_year);
      return getBillingEntriesForMonth(activeFilters.month_year); // Fetches all entries for the month
    },
    enabled: !!activeFilters.month_year,
  });

  // Log Before useQuery for salespeoplePerformanceData
  console.log('[Dashboard.tsx] Initializing. activeFilters:', JSON.stringify(activeFilters, null, 2));
  console.log('[Dashboard.tsx] About to call useQuery for salespeoplePerformance. Month filter:', activeFilters.month_year);

  const {
    data: salespeoplePerformanceData, // Renamed for clarity
    isLoading: salespeopleLoading,
    error: salespeopleError
  } = useQuery<SalespersonPerformance[], Error, SalespersonPerformance[], ['salespeoplePerformance', { month_year?: string }]>(
    {
      queryKey: ['salespeoplePerformance', activeFilters], // Use activeFilters for consistency if performance is date-scoped
      queryFn: () => {
        console.log('[Dashboard.tsx] queryFn for getSalespeopleWithPerformance is EXECUTING. Month filter:', activeFilters.month_year);
        return getSalespeopleWithPerformance(activeFilters.month_year);
      }
    }
  );

  console.log('[Dashboard.tsx] salespeoplePerformanceData (after useQuery call):', salespeoplePerformanceData);
  if (salespeopleLoading) console.log('[Dashboard.tsx] salespeoplePerformanceData is LOADING...');
  if (salespeopleError) console.log('[Dashboard.tsx] salespeoplePerformanceData fetch ERROR:', salespeopleError);

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

  if (kpisLoading || salespeopleLoading || dailySalesLoading || isLoadingBillingEntries) { // Updated loading state name
    return (
      <div className="min-h-screen bg-neutral-bg flex flex-col">
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
            <KPICards kpiData={kpisData} billingEntries={billingEntriesData} activeMonthYear={activeFilters.month_year} /> {/* Updated prop name */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SalespersonRanking salespeople={salespeoplePerformanceData} />
              </div>
              <div className="lg:col-span-1">
                <GoalProgress salespeople={salespeoplePerformanceData} /> {/* kpiData prop removed */}
              </div>
            </div>
          </div>
        );
      case 'ranking':
        return <SalespersonRanking salespeople={salespeoplePerformanceData} />;
      case 'charts':
        return <SalesChart data={dailySalesData} />;
      case 'analysis':
        return <CustomerAnalysis data={kpisData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg"> {/* Updated background */}
      <Navigation />
      
      {/* Main content container with adjusted top padding */}
      <div className="container mx-auto px-6 pt-[96px] pb-8">
        {/* Updated to 12-column grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar for large screens (inline) */}
          <div className="hidden lg:block col-span-12 lg:col-span-3">
            <DashboardFilters
              onMonthYearChange={handleMonthYearChange}
              currentMonthYear={activeFilters.month_year}
            />
          </div>

          {/* Trigger button for mobile/tablet screens & Sheet */}
          <div className="lg:hidden col-span-12 mb-4 flex justify-start">
            <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0">
                <SheetHeader className="p-4 border-b"> {/* Custom header for sheet title */}
                  <SheetTitle>Aplicar Filtros</SheetTitle>
                </SheetHeader>
                <div className="p-4"> {/* Padding for the filters component */}
                  <DashboardFilters
                    onMonthYearChange={(monthYear) => {
                      handleMonthYearChange(monthYear);
                      setIsMobileFiltersOpen(false); // Close drawer on filter change
                    }}
                    currentMonthYear={activeFilters.month_year}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Card Principal Unificado */}
          {/* Main content: Full width on small/medium, 9 columns on large */}
          <div className="col-span-12 lg:col-span-9">
            <Card className="bg-white shadow-xl border-green-100"> {/* Ensure this card uses new theme if applicable, or is neutral */}
              <CardHeader className="bg-primary-green text-white"> {/* Updated to primary-green */}
                {/* Title: text-2xl font-bold (CardTitle by default is often text-2xl font-semibold) */}
                <CardTitle className="flex items-center justify-between font-bold">
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
                {/* Navegação por Abas - Sticky */}
                <div className="sticky top-[80px] z-40 bg-white border-b border-gray-200 p-4"> {/* Updated background */}
                  <div className="flex flex-wrap gap-2 justify-center"> {/* Centering tabs */}
                    {navigationButtons.map((button) => (
                      <Button
                        key={button.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveSection(button.id as any)}
                        className={`rounded-full px-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green/70 focus:ring-offset-white ${
                          activeSection === button.id
                            ? 'bg-primary-green text-white font-semibold shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm hover:shadow-md'
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
