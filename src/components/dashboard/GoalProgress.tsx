
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Salesperson {
  name: string;
  sold: number;
  goal: number;
  challenge: number;
  mega: number;
}

interface GoalProgressProps {
  salespeople: Salesperson[];
}

export const GoalProgress = ({ salespeople }: GoalProgressProps) => {
  const totalSold = salespeople.reduce((sum, person) => sum + person.sold, 0);
  const totalGoal = salespeople.reduce((sum, person) => sum + person.goal, 0);
  const progressPercentage = (totalSold / totalGoal) * 100;

  // Calculate the stroke dasharray for the circle
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(progressPercentage / 100) * circumference} ${circumference}`;

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-gray-700 text-center">Progresso para Meta Empresa</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="#e5e7eb"
                strokeWidth="20"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="#059669"
                strokeWidth="20"
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {progressPercentage.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Meta Atingida
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            R$ {totalSold.toLocaleString()} de R$ {totalGoal.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
