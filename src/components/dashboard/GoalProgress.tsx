import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Target, Info, ShieldCheck, Star } from "lucide-react";
import type { SalespersonPerformance, KPI } from "@/lib/supabaseQueries";
import { Button } from "@/components/ui/button";

interface GoalProgressProps {
  salespeople: SalespersonPerformance[] | null | undefined;
  kpiData?: KPI | null;
}

const GoalProgressSkeleton: React.FC = () => {
  return (
    <Card className="flex flex-col items-center bg-white rounded-xl p-6 shadow-md h-full animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div> {/* Title placeholder */}
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-4"> {/* Adjusted size to match actual */}
        <div className="w-full h-full bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div> {/* Sold/Goal text placeholder */}
      <div className="mt-4 flex justify-around items-center w-full mb-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div> {/* Placeholder for one stat */}
        <div className="h-8 bg-gray-200 rounded w-1/3"></div> {/* Placeholder for another stat */}
      </div>
      <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div> {/* Button placeholder */}
    </Card>
  );
};

export const GoalProgress: React.FC<GoalProgressProps> = ({ salespeople, kpiData }) => {
  // Determine loading state based on whether salespeople data is present.
  // kpiData loading is handled by the parent, if it's undefined, totalGoal will be 0.
  if (salespeople === undefined) {
    return <GoalProgressSkeleton />;
  }

  const totalSold = salespeople?.reduce((acc, person) => acc + person.total_sales_amount, 0) || 0;
  const totalGoal = kpiData?.total_goal ?? 0;
  const progressPercentage = totalGoal > 0 ? Math.min((totalSold / totalGoal) * 100, 100) : 0;

  const challengesMetText = "N/A";
  const megasMetText = "N/A";

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(progressPercentage / 100) * circumference} ${circumference}`;

  // Display a specific message if there's no meaningful data to show progress for.
  // This happens if totalSold is 0 (no sales from salespeople data) AND totalGoal is 0 (no KPI data or goal is zero).
  if (totalSold === 0 && totalGoal === 0) {
    return (
      <Card className="flex flex-col items-center justify-center bg-white rounded-xl p-6 shadow-md h-full transition-all duration-200 hover:scale-105 hover:shadow-lg">
        <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-center text-gray-500">Dados de progresso da empresa indisponíveis.</p>
        <p className="text-xs text-center text-gray-400 mt-2">Verifique se há vendas registradas e se a meta global foi definida.</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col items-center bg-white rounded-xl p-6 shadow-md h-full transition-all duration-200 hover:scale-105 hover:shadow-lg">
      <CardContent className="w-full flex flex-col items-center text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Progresso da Meta da Empresa</h3>

        <div className="relative w-40 h-40 sm:w-48 sm:h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke="#e5e7eb" // gray-200
              strokeWidth="18"
              fill="none"
            />
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke="hsl(var(--chart-1))" // Using theme color (e.g. green-600)
              strokeWidth="18"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Target className="w-6 h-6 text-green-600 mb-1" />
            {/* Percentage: Metric Style (size kept, color/weight updated) */}
            <div className="text-2xl font-bold text-green-700">
              {progressPercentage.toFixed(0)}%
            </div>
            {/* "Alcançado": Label Style */}
            <div className="text-sm text-gray-500 mt-0.5">
              Alcançado
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center w-full">
          {/* Total Sold / Total Goal: Metric and Label Styles */}
          <p>
            <span className="text-xl font-semibold text-green-700">
              {totalSold.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-sm text-gray-500"> / {totalGoal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4 items-center w-full max-w-xs mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center text-blue-500"> {/* Adjusted color */}
                <ShieldCheck className="w-5 h-5 mr-1.5" />
                <span className="text-lg font-bold">{challengesMetText}</span> {/* Adjusted size */}
              </div>
              <p className="text-xs text-gray-500">Desafios Batidos</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-purple-500"> {/* Adjusted color */}
                <Star className="w-5 h-5 mr-1.5" /> {/* Adjusted icon color if needed, or keep gray */}
                <span className="text-lg font-bold">{megasMetText}</span> {/* Adjusted size */}
              </div>
              <p className="text-xs text-gray-500">Megas Batidas</p>
            </div>
          </div>

          {totalGoal === 0 && <p className="text-xs text-center text-gray-400 mt-3">Meta global não definida.</p>}

          <Button variant="link" size="sm" className="mt-4 text-green-600 hover:text-green-700 font-medium">
            Ver Relatório Completo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
