import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Target, Info, ShieldCheck, Star } from "lucide-react";
import type { SalespersonPerformance } from "@/lib/supabaseQueries"; // KPI type no longer needed here
import { Button } from "@/components/ui/button";

interface GoalProgressProps {
  salespeople: SalespersonPerformance[] | null | undefined;
  // kpiData?: KPI | null; // kpiData.total_goal is no longer used for the main display
}

const GoalProgressSkeleton: React.FC = () => {
  return (
    <Card className="flex flex-col items-center bg-white rounded-xl p-6 shadow-md h-full animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div> {/* Title placeholder */}
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-4">
        <div className="w-full h-full bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
      <div className="mt-4 flex justify-around items-center w-full mb-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
    </Card>
  );
};

export const GoalProgress: React.FC<GoalProgressProps> = ({ salespeople }) => {
  if (salespeople === undefined) {
    return <GoalProgressSkeleton />;
  }

  const companyMetrics = React.useMemo(() => {
    if (!salespeople || salespeople.length === 0) {
      return {
        calculatedCompanyGoal: 0,
        calculatedCompanyChallengeGoal: 0,
        calculatedCompanyMegaGoal: 0,
        sellersMeetingChallenge: 0,
        sellersMeetingMegaGoal: 0,
      };
    }
    let calculatedCompanyGoal = 0;
    let calculatedCompanyChallengeGoal = 0;
    let calculatedCompanyMegaGoal = 0;
    let sellersMeetingChallenge = 0;
    let sellersMeetingMegaGoal = 0;

    salespeople.forEach(person => {
      calculatedCompanyGoal += person.current_goal_value ?? 0;
      calculatedCompanyChallengeGoal += person.current_challenge_value ?? 0;
      calculatedCompanyMegaGoal += person.current_mega_goal_value ?? 0;

      if ((person.current_challenge_value ?? 0) > 0 && person.total_sales_amount >= (person.current_challenge_value ?? 0)) {
        sellersMeetingChallenge++;
      }
      if ((person.current_mega_goal_value ?? 0) > 0 && person.total_sales_amount >= (person.current_mega_goal_value ?? 0)) {
        sellersMeetingMegaGoal++;
      }
    });

    return {
      calculatedCompanyGoal,
      calculatedCompanyChallengeGoal,
      calculatedCompanyMegaGoal,
      sellersMeetingChallenge,
      sellersMeetingMegaGoal,
    };
  }, [salespeople]);

  const totalSold = salespeople?.reduce((acc, person) => acc + person.total_sales_amount, 0) || 0;

  const progressPercentage = companyMetrics.calculatedCompanyGoal > 0
    ? Math.min((totalSold / companyMetrics.calculatedCompanyGoal) * 100, 100)
    : 0;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(progressPercentage / 100) * circumference} ${circumference}`;

  if (totalSold === 0 && companyMetrics.calculatedCompanyGoal === 0 && (!salespeople || salespeople.length === 0)) {
    return (
      <Card className="flex flex-col items-center justify-center bg-white rounded-xl p-6 shadow-md h-full">
        <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-center text-gray-500">Dados de progresso da empresa indisponíveis.</p>
        <p className="text-xs text-center text-gray-400 mt-2">Verifique se há vendas registradas e se as metas individuais dos vendedores foram definidas para o período.</p>
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
              stroke="#e5e7eb"
              strokeWidth="18"
              fill="none"
            />
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke="hsl(var(--chart-1))"
              strokeWidth="18"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Target className="w-6 h-6 text-primary-green mb-1" />
            <div className="text-2xl font-bold text-primary-green">
              {progressPercentage.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              Alcançado
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center w-full">
          <p>
            <span className="text-xl font-semibold text-primary-green">
              {totalSold.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-sm text-gray-500"> / {companyMetrics.calculatedCompanyGoal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4 items-center w-full max-w-xs mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center text-blue-500">
                <ShieldCheck className="w-5 h-5 mr-1.5" />
                <span className="text-lg font-bold">{companyMetrics.sellersMeetingChallenge}</span>
              </div>
              <p className="text-xs text-gray-500">Desafios Batidos</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-purple-500">
                <Star className="w-5 h-5 mr-1.5" />
                <span className="text-lg font-bold">{companyMetrics.sellersMeetingMegaGoal}</span>
              </div>
              <p className="text-xs text-gray-500">Megas Batidas</p>
            </div>
          </div>

          {companyMetrics.calculatedCompanyGoal === 0 && totalSold > 0 &&
            <p className="text-xs text-center text-gray-400 mt-3">Metas individuais não definidas para o período.</p>
          }

          <Button variant="link" size="sm" className="mt-4 text-primary-green hover:text-primary-green/90 font-medium">
            Ver Relatório Completo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
