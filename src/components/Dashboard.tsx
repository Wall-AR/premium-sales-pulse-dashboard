
import { KPICards } from "./dashboard/KPICards";
import { SalespersonRanking } from "./dashboard/SalespersonRanking";
import { GoalProgress } from "./dashboard/GoalProgress";
import { SalesChart } from "./dashboard/SalesChart";
import { CustomerAnalysis } from "./dashboard/CustomerAnalysis";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DashboardFilters } from "./dashboard/DashboardFilters";
import { Navigation } from "./Navigation";
import { salesData } from "@/data/salesData";

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Navigation />
      
      {/* Cabeçalho Principal do Dashboard */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/91053ff3-b80e-46d3-bc7c-59736d93d8dd.png" 
                alt="NutraScore Logo" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-3xl font-bold">NutraScore Dashboard</h1>
                <p className="text-green-100 mt-1">Sistema Avançado de Gestão de Vendas e Performance</p>
              </div>
            </div>
            <div className="text-right text-green-100">
              <p className="text-sm">Dashboard Profissional</p>
              <p className="text-xs">Visualização com Fotos dos Vendedores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Título do Dashboard */}
      <div className="bg-green-700 text-white">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-green-200">📊</span>
              <span className="font-medium">Dashboard de Vendas | Abril 2025</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-green-200 hover:text-white transition-colors">⟲</button>
              <button className="text-green-200 hover:text-white transition-colors">⚙️</button>
              <button className="text-green-200 hover:text-white transition-colors">⛶</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Barra Lateral de Filtros */}
          <div className="lg:col-span-1">
            <DashboardFilters />
          </div>
          
          {/* Conteúdo Principal */}
          <div className="lg:col-span-4 space-y-6">
            {/* Cards KPI */}
            <KPICards data={salesData} />
            
            {/* Grade de Conteúdo Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ranking de Vendedores */}
              <div className="lg:col-span-2">
                <SalespersonRanking salespeople={salesData.salespeople} />
              </div>
              
              {/* Progresso das Metas */}
              <div className="lg:col-span-1">
                <GoalProgress salespeople={salesData.salespeople} />
              </div>
            </div>
            
            {/* Gráfico de Vendas */}
            <div className="w-full">
              <SalesChart data={salesData.dailySales} />
            </div>
          </div>
        </div>

        {/* Seção Inferior */}
        <div className="mt-8">
          <CustomerAnalysis data={salesData} />
        </div>

        {/* Seção de Recursos */}
        <div className="mt-8 bg-white rounded-lg shadow-lg border border-green-100 p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">📸</span>
            <h3 className="text-lg font-semibold text-green-800">Recursos de Fotos dos Vendedores</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-green-600">🔍</span>
              </div>
              <div>
                <h4 className="font-medium text-green-800">Identificação Visual</h4>
                <p className="text-sm text-green-600">Reconheça vendedores instantaneamente através de suas fotos</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <span className="text-yellow-600">👑</span>
              </div>
              <div>
                <h4 className="font-medium text-green-800">Medalhas de Conquista</h4>
                <p className="text-sm text-green-600">Ícones de coroa e medalhas acompanham as fotos dos líderes</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-green-600">🔄</span>
              </div>
              <div>
                <h4 className="font-medium text-green-800">Atualização Dinâmica</h4>
                <p className="text-sm text-green-600">Fotos reorganizam conforme mudanças no ranking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
