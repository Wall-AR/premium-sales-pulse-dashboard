
import { KPICards } from "./dashboard/KPICards";
import { SalespersonRanking } from "./dashboard/SalespersonRanking";
import { GoalProgress } from "./dashboard/GoalProgress";
import { SalesChart } from "./dashboard/SalesChart";
import { CustomerAnalysis } from "./dashboard/CustomerAnalysis";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { Navigation } from "./Navigation";
import { salesData } from "@/data/salesData";

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      <Navigation />
      <DashboardHeader />
      
      <div className="container mx-auto px-6 py-8">
        {/* KPI Cards */}
        <KPICards data={salesData} />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Salesperson Ranking */}
          <div className="lg:col-span-1">
            <SalespersonRanking salespeople={salesData.salespeople} />
          </div>
          
          {/* Sales Chart */}
          <div className="lg:col-span-2">
            <SalesChart data={salesData.dailySales} />
          </div>
        </div>
        
        {/* Goal Progress and Customer Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <GoalProgress salespeople={salesData.salespeople} />
          <CustomerAnalysis data={salesData} />
        </div>
      </div>
    </div>
  );
};
