import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Target, Info, ShieldCheck, Star } from "lucide-react";
import type { SellerProfile } from "@/lib/supabaseQueries"; // Updated type to SellerProfile

interface GoalProgressProps {
  salespeople: SellerProfile[] | null | undefined; // Updated prop type
}

const GoalProgressSkeleton: React.FC = () => {
  return (
    <Card className="bg-white shadow-sm animate-pulse">
      <CardHeader className="bg-gray-50 border-b">
        <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto"></div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            <div className="w-full h-full bg-gray-200 rounded-full"></div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4 mx-auto"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4 mx-auto mt-1"></div>
        </div>
      </CardContent>
    </Card>
  );
};


export const GoalProgress = ({ salespeople }: GoalProgressProps) => {
  if (salespeople === undefined) {
    return <GoalProgressSkeleton />;
  }

  if (!salespeople || salespeople.length === 0) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-gray-700 text-center">Progresso da Empresa</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-gray-500">
          <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          Nenhum dado de vendedor disponível para calcular o progresso.
        </CardContent>
      </Card>
    );
  }

  // Since SellerProfile does not contain performance data (sold, goal, challenge, mega),
  // we'll display 0 or "N/A" for these metrics.
  const totalSold = 0;
  const totalGoal = 0; 
  const progressPercentage = 0;
  const challengesMet = 0; // Not available in SellerProfile
  const megasMet = 0; // Not available in SellerProfile

  // Calculate the stroke dasharray for the circle
  const radius = 70; 
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(progressPercentage / 100) * circumference} ${circumference}`;

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-gray-700 text-center">Progresso para Meta Empresa</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40 sm:w-48 sm:h-48"> {/* Adjusted size */}
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180"> {/* Adjusted viewBox */}
              <circle
                cx="90" 
                cy="90"
                r={radius}
                stroke="#e5e7eb" // Light gray
                strokeWidth="18" // Adjusted strokeWidth
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                stroke="#059669" // Emerald-600
                strokeWidth="18" // Adjusted strokeWidth
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Target className="w-6 h-6 text-emerald-600 mb-1" />
              <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
                {progressPercentage.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Meta Global
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold text-gray-700">
            R$ {totalSold.toLocaleString('pt-BR')} / <span className="text-gray-500">R$ {totalGoal.toLocaleString('pt-BR')}</span>
          </p>
          <div className="mt-4 flex justify-around items-center">
            <div className="text-center">
              <div className="flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-5 h-5 mr-1.5" />
                <span className="text-xl font-bold">N/A</span> 
              </div>
              <p className="text-xs text-gray-500">Desafios Batidos</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-purple-600">
                <Star className="w-5 h-5 mr-1.5 text-gray-400" /> {/* Icon kept, but value N/A */}
                <span className="text-xl font-bold">N/A</span>
              </div>
              <p className="text-xs text-gray-500">Megas Batidas</p>
            </div>
          </div>
          <p className="text-xs text-center text-gray-400 mt-3">Dados de performance detalhados indisponíveis.</p>
        </div>
      </CardContent>
    </Card>
  );
};
// Removed extraneous closing divs that were outside the main component structure
