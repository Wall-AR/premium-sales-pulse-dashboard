
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Main Dashboard Header */}
      <div className="bg-emerald-600 text-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard Aprimorado com Fotos dos Vendedores</h1>
              <p className="text-emerald-100 mt-1">Visualização personalizada para identificação rápida da equipe e seus resultados</p>
            </div>
            <div className="text-right text-emerald-100">
              <p className="text-sm">Visualização com Fotos dos Vendedores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Title Bar */}
      <div className="bg-emerald-700 text-white">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-emerald-200">📊</span>
              <span className="font-medium">Dashboard de Vendas | Abril 2025</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-emerald-200 hover:text-white">⟲</button>
              <button className="text-emerald-200 hover:text-white">⚙️</button>
              <button className="text-emerald-200 hover:text-white">⛶</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <DashboardFilters />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-4 space-y-6">
            {/* KPI Cards */}
            <KPICards data={salesData} />
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Salesperson Ranking */}
              <div className="lg:col-span-2">
                <SalespersonRanking salespeople={salesData.salespeople} />
              </div>
              
              {/* Goal Progress */}
              <div className="lg:col-span-1">
                <GoalProgress salespeople={salesData.salespeople} />
              </div>
            </div>
            
            {/* Sales Chart */}
            <div className="w-full">
              <SalesChart data={salesData.dailySales} />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8">
          <CustomerAnalysis data={salesData} />
        </div>

        {/* Resources Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">📸</span>
            <h3 className="text-lg font-semibold text-gray-800">Recursos de Fotos dos Vendedores</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-green-600">🔍</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Identificação Visual</h4>
                <p className="text-sm text-gray-600">Reconheça vendedores instantaneamente através de suas fotos</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <span className="text-yellow-600">👑</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Badges de Conquista</h4>
                <p className="text-sm text-gray-600">Ícones de coroa e medalhas acompanham as fotos dos líderes</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-blue-600">🔄</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Atualização Dinâmica</h4>
                <p className="text-sm text-gray-600">Fotos reorganizam conforme mudanças no ranking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
