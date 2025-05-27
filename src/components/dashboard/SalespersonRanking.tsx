
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
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-emerald-600">#{position + 1}</span>;
    }
  };

  const getRankTitle = (position: number) => {
    switch (position) {
      case 0:
        return "1ST PLACE";
      case 1:
        return "2ND PLACE";
      case 2:
        return "3RD PLACE";
      default:
        return `${position + 1}TH PLACE`;
    }
  };

  const handlePersonClick = (person: Salesperson) => {
    navigate(`/salesperson/${person.name.toLowerCase()}`);
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <CardTitle className="text-center">🏆 Salesperson Ranking</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {sortedSalespeople.map((person, index) => {
            const goalPercentage = (person.sold / person.goal) * 100;
            
            return (
              <div
                key={person.name}
                onClick={() => handlePersonClick(person)}
                className={`p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-md hover:scale-[1.02] ${
                  index === 0
                    ? "border-yellow-300 bg-yellow-50 hover:bg-yellow-100"
                    : index === 1
                    ? "border-gray-300 bg-gray-50 hover:bg-gray-100"
                    : index === 2
                    ? "border-amber-300 bg-amber-50 hover:bg-amber-100"
                    : "border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(index)}
                  </div>
                  
                  <Avatar className="w-12 h-12 border-2 border-emerald-300">
                    <AvatarImage src={person.photo} alt={person.name} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-600 font-semibold">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-emerald-800 hover:text-emerald-600 transition-colors">
                          {person.name}
                        </h3>
                        <p className="text-xs text-emerald-600">{getRankTitle(index)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-800">R$ {person.sold.toLocaleString()}</p>
                        <p className="text-xs text-emerald-600">{goalPercentage.toFixed(1)}% of goal</p>
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
