
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Medal } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Salesperson {
  name: string;
  sold: number;
  goal: number;
  challenge: number;
  mega: number;
  clients: number;
  newClients: number;
  avgTicket: number;
  photo?: string;
}

interface SalespersonRankingProps {
  salespeople: Salesperson[];
}

export const SalespersonRanking = ({ salespeople }: SalespersonRankingProps) => {
  const navigate = useNavigate();
  const sortedSalespeople = [...salespeople].sort((a, b) => b.sold - a.sold);

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

  const getProgressColor = (goalPercentage: number, challengePercentage: number, megaPercentage: number) => {
    if (megaPercentage >= 100) return "bg-yellow-400";
    if (challengePercentage >= 100) return "bg-orange-400"; 
    if (goalPercentage >= 100) return "bg-emerald-500";
    return "bg-gray-300";
  };

  const getProgressWidth = (person: Salesperson) => {
    const goalPercentage = (person.sold / person.goal) * 100;
    const challengePercentage = (person.sold / person.challenge) * 100;
    const megaPercentage = (person.sold / person.mega) * 100;
    
    return Math.min(100, Math.max(goalPercentage, challengePercentage, megaPercentage));
  };

  const handlePersonClick = (person: Salesperson) => {
    navigate(`/salesperson/${person.name.toLowerCase()}`);
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="flex items-center text-gray-700">
          <span className="text-emerald-600 mr-2">🏆</span>
          Ranking de Vendedores
          <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
            Novo
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {sortedSalespeople.map((person, index) => {
            const goalPercentage = (person.sold / person.goal) * 100;
            const challengePercentage = (person.sold / person.challenge) * 100;
            const megaPercentage = (person.sold / person.mega) * 100;
            
            return (
              <div
                key={person.name}
                onClick={() => handlePersonClick(person)}
                className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-6">
                    {getRankIcon(index)}
                  </div>
                  
                  <Avatar className="w-10 h-10 border-2 border-gray-200">
                    <AvatarImage src={person.photo} alt={person.name} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-600 font-semibold text-sm">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm">{person.name}</h3>
                      <span className="font-bold text-gray-900 text-sm">R$ {person.sold.toLocaleString()}</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-gray-600 space-x-4">
                        <span>Meta</span>
                        <span>Desafio: {challengePercentage.toFixed(0)}%</span>
                        <span>Mega</span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(goalPercentage, challengePercentage, megaPercentage)}`}
                            style={{ width: `${getProgressWidth(person)}%` }}
                          ></div>
                        </div>
                        {/* Goal markers */}
                        <div className="absolute top-0 left-0 w-full h-2 flex justify-between">
                          <div className="w-0.5 h-2 bg-orange-400"></div>
                          <div className="w-0.5 h-2 bg-yellow-400"></div>
                        </div>
                      </div>
                    </div>
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
