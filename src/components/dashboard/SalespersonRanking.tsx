import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Medal, Info, ArrowUp, ArrowDown } from "lucide-react"; // Added ArrowUp, ArrowDown
import { useNavigate } from "react-router-dom";
import type { SalespersonPerformance } from "@/lib/supabaseQueries";
import { useAuth } from "@/contexts/AuthContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Added Tooltip components

interface SalespersonRankingProps {
  salespeople: SalespersonPerformance[] | null | undefined;
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
  const { user: currentUser } = useAuth(); // Get current user

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

  // const sortedSalespeople = [...salespeople].sort((a, b) => a.name.localeCompare(b.name)); // Sort by name
  // Data is now pre-sorted by performance from getSalespeopleWithPerformance
  const rankedSalespeople = salespeople;

  const getRankIcon = (position: number) => {
    if (position === 0) return <span role="img" aria-label="gold medal" className="text-xl">🥇</span>;
    if (position === 1) return <span role="img" aria-label="silver medal" className="text-xl">🥈</span>;
    if (position === 2) return <span role="img" aria-label="bronze medal" className="text-xl">🥉</span>;
    return <span className="text-sm font-semibold text-gray-500 w-5 text-center">#{position + 1}</span>;
  };

  const getProgressColor = (goalPercentage: number) => {
    // Performance metrics (sold, goal, progress, challenge, mega) are now available via SalespersonPerformance
    // So, related UI elements are removed or simplified.
    // Progress bar and related text are removed.
    // Challenge and Mega status are removed.
    return "bg-gray-300"; // Default color if needed, but progress bar removed
  };

  const handlePersonClick = (person: SalespersonPerformance) => {
    // Ensure name exists before trying to use it in navigation
    // SalespersonPerformance has `id` which is more reliable for navigation.
    if (person.id) {
      navigate(`/salesperson/${person.id}`); // Navigate using UUID id
    } else {
      console.warn("Salesperson ID is missing, cannot navigate.", person);
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg">
      <CardHeader className="bg-gray-50 border-b p-4">
        <CardTitle className="flex items-center text-lg font-bold text-gray-800">
          <span className="text-emerald-600 mr-2 text-xl">🏆</span>
          Ranking de Vendedores
          <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold"> {/* Subtitle font-semibold */}
            Top Performers
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {rankedSalespeople.map((person, index) => {
            const isCurrentUser = currentUser?.email === person.email;
            return (
              <div
                key={person.id}
                onClick={() => handlePersonClick(person)}
                className={`p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm hover:scale-[1.02]
                  ${isCurrentUser
                    ? 'bg-secondary-green/50 border-primary-green ring-2 ring-primary-green'
                    : 'border-gray-200'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-6">
                    {getRankIcon(index)}
                  </div>
                  
                  <Avatar className="w-10 h-10 border-2 border-gray-200">
                    <AvatarImage src={person.photo_url || undefined} alt={person.name} />
                    <AvatarFallback className={`font-semibold text-sm ${isCurrentUser ? 'bg-primary-green text-white' : 'bg-secondary-green text-primary-green'}`}>
                      {person.name ? person.name.split(' ').map(n => n[0]).join('') : 'N/A'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <h3 className="font-semibold text-gray-800 text-sm">{person.name || 'Vendedor Desconhecido'}</h3>
                        {isCurrentUser && (
                          <span className="ml-2 text-xs font-semibold text-white bg-primary-green px-2 py-0.5 rounded-full">
                            Você
                          </span>
                        )}
                      </div>
                      <div className="flex items-center"> {/* Wrapper for amount and trend */}
                        <p className="text-xl font-semibold text-primary-green">
                          {person.total_sales_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                        {typeof person.previous_period_total_sales_amount === 'number' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className={`ml-2 text-xs flex items-center font-semibold
                                  ${person.total_sales_amount >= person.previous_period_total_sales_amount
                                    ? 'text-green-600' // Positive or same
                                    : 'text-red-600'   // Negative
                                  }`}>
                                  {person.total_sales_amount >= person.previous_period_total_sales_amount ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                  {(() => {
                                    if (person.previous_period_total_sales_amount === 0) {
                                      return person.total_sales_amount > 0 ? "∞%" : "0%"; // Infinite growth or no change from zero
                                    }
                                    const change = ((person.total_sales_amount - person.previous_period_total_sales_amount) / person.previous_period_total_sales_amount) * 100;
                                    return `${Math.abs(change).toFixed(0)}%`;
                                  })()}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                <p>Comparado ao período anterior</p>
                                <p className="text-xs">Mês Anterior: {person.previous_period_total_sales_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {person.number_of_sales} venda(s)
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
// Removed extraneous closing divs that were outside the main component structure
