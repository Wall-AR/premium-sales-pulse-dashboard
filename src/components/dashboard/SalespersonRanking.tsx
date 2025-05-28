
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Medal, ShieldCheck, Star, Info } from "lucide-react"; // Removed Loader2, kept Info
import { useNavigate } from "react-router-dom";
import type { Salesperson } from "@/lib/supabaseQueries";

interface SalespersonRankingProps {
  salespeople: Salesperson[] | null | undefined;
}

const SalespersonSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="p-3 rounded-lg border border-gray-100 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
              <div className="flex space-x-2">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const SalespersonRanking = ({ salespeople }: SalespersonRankingProps) => {
  const navigate = useNavigate();

  if (salespeople === undefined) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="flex items-center text-gray-700">
            <span className="text-emerald-600 mr-2">🏆</span>
            Ranking de Vendedores
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <SalespersonSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (!salespeople || salespeople.length === 0) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="flex items-center text-gray-700">
            <span className="text-emerald-600 mr-2">🏆</span>
            Ranking de Vendedores
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-center text-gray-500">
          <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          Nenhum dado de vendedor disponível no momento.
        </CardContent>
      </Card>
    );
  }

  const sortedSalespeople = [...salespeople].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0));

  const getRankIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-gray-500">#{position + 1}</span>;
    }
  };

  const getProgressColor = (goalPercentage: number) => {
    if (goalPercentage >= 100) return "bg-emerald-500";
    if (goalPercentage >= 75) return "bg-green-400";
    if (goalPercentage >= 50) return "bg-yellow-400";
    if (goalPercentage >= 25) return "bg-orange-400";
    return "bg-red-400";
  };

  const handlePersonClick = (person: Salesperson) => {
    // Ensure name exists before trying to use it in navigation
    if (person.name) {
      navigate(`/salesperson/${person.name.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="flex items-center text-gray-700">
          <span className="text-emerald-600 mr-2">🏆</span>
          Ranking de Vendedores
          <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
            Atualizado
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {sortedSalespeople.map((person, index) => {
            const sold = person.sold ?? 0;
            const goal = person.goal ?? 1; // Avoid division by zero
            const goalPercentage = goal > 0 ? (sold / goal) * 100 : 0;
            
            return (
              <div
                key={person.name || index} // Use index as fallback if name is not guaranteed
                onClick={() => handlePersonClick(person)}
                className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-6">
                    {getRankIcon(index)}
                  </div>
                  
                  <Avatar className="w-10 h-10 border-2 border-gray-200">
                    <AvatarImage src={person.photo_url} alt={person.name} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-600 font-semibold text-sm">
                      {person.name ? person.name.split(' ').map(n => n[0]).join('') : 'N/A'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800 text-sm">{person.name || 'Vendedor Desconhecido'}</h3>
                      <span className="font-bold text-gray-900 text-sm">R$ {sold.toLocaleString('pt-BR')}</span>
                    </div>
                    
                    {/* Progress Bar for Goal */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor(goalPercentage)}`}
                        style={{ width: `${Math.min(100, goalPercentage)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      Meta: {goalPercentage.toFixed(0)}% (R$ {goal.toLocaleString('pt-BR')})
                    </div>

                    {/* Challenge and Mega Status */}
                    <div className="flex items-center space-x-3 mt-2 text-xs">
                      {person.challenge && (
                        <span className="flex items-center text-blue-600">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Desafio Cumprido
                        </span>
                      )}
                      {person.mega && (
                        <span className="flex items-center text-purple-600">
                          <Star className="w-3.5 h-3.5 mr-1" /> Mega Cumprida
                        </span>
                      )}
                    </div>

                  </div>
                  {/* End of flex-1 div */}
                </div>
                {/* End of flex items-center space-x-3 div */}
              </div>
              // End of main item div
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
// Removed extraneous closing divs that were outside the main component structure
