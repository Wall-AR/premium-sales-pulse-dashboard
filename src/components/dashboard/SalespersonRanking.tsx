import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Medal, Info } from "lucide-react"; // Removed ShieldCheck, Star
import { useNavigate } from "react-router-dom";
import type { SellerProfile } from "@/lib/supabaseQueries"; // Updated type to SellerProfile

interface SalespersonRankingProps {
  salespeople: SellerProfile[] | null | undefined; // Updated prop type
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

  const sortedSalespeople = [...salespeople].sort((a, b) => a.name.localeCompare(b.name)); // Sort by name

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
    // Performance metrics (sold, goal, progress, challenge, mega) are not available in SellerProfile
    // So, related UI elements are removed or simplified.
    // Progress bar and related text are removed.
    // Challenge and Mega status are removed.
    return "bg-gray-300"; // Default color if needed, but progress bar removed
  };

  const handlePersonClick = (person: SellerProfile) => { // Updated type
    // Ensure name exists before trying to use it in navigation
    // SellerProfile has `id` which is more reliable for navigation.
    if (person.id) {
      navigate(`/salesperson/${person.id}`); // Navigate using UUID id
    } else {
      console.warn("Salesperson ID is missing, cannot navigate.", person);
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
          {sortedSalespeople.map((person, index) => (
              <div
                key={person.id} // Use id as key
                onClick={() => handlePersonClick(person)}
                className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-6">
                    {getRankIcon(index)}
                  </div>
                  
                  <Avatar className="w-10 h-10 border-2 border-gray-200">
                    <AvatarImage src={person.photo_url || undefined} alt={person.name} /> {/* Use person.photo_url */}
                    <AvatarFallback className="bg-emerald-100 text-emerald-600 font-semibold text-sm">
                      {person.name ? person.name.split(' ').map(n => n[0]).join('') : 'N/A'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800 text-sm">{person.name || 'Vendedor Desconhecido'}</h3>
                      {/* Sold amount removed as it's not in SellerProfile */}
                    </div>
                    {/* Performance metrics (progress bar, goal text, challenge/mega status) are removed */}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};
// Removed extraneous closing divs that were outside the main component structure
