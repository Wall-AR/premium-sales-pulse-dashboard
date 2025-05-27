
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
import { salesData } from "@/data/salesData";
import { useState } from "react";

export const Dashboard = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'ranking' | 'charts' | 'analysis'>('overview');

  const navigationButtons = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'ranking', label: 'Ranking', icon: Users },
    { id: 'charts', label: 'Gráficos', icon: TrendingUp },
    { id: 'analysis', label: 'Análise', icon: Target }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <KPICards data={salesData} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SalespersonRanking salespeople={salesData.salespeople} />
              </div>
              <div className="lg:col-span-1">
                <GoalProgress salespeople={salesData.salespeople} />
              </div>
            </div>
          </div>
        );
      case 'ranking':
        return <SalespersonRanking salespeople={salesData.salespeople} />;
      case 'charts':
        return <SalesChart data={salesData.dailySales} />;
      case 'analysis':
        return <CustomerAnalysis data={salesData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Navigation />
      
      {/* Header Principal Melhorado */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white pt-20 pb-6">
        <div className="container mx-auto px-6">
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
              <p className="text-xs">Abril 2025</p>
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
