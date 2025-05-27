
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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

interface GoalProgressProps {
  salespeople: Salesperson[];
}

export const GoalProgress = ({ salespeople }: GoalProgressProps) => {
  const getAchievedLevel = (person: Salesperson) => {
    const percMega = person.sold / person.mega;
    const percChallenge = person.sold / person.challenge;
    const percGoal = person.sold / person.goal;
    
    if (percMega >= 1) return 3;
    if (percChallenge >= 1) return 2;
    if (percGoal >= 1) return 1;
    return 0;
  };

  const getCurrentGoal = (person: Salesperson) => {
    const level = getAchievedLevel(person);
    switch (level) {
      case 0: return { amount: person.goal, name: "GOAL" };
      case 1: return { amount: person.challenge, name: "CHALLENGE" };
      case 2: return { amount: person.mega, name: "MEGA" };
      case 3: return { amount: person.mega, name: "MEGA ACHIEVED" };
      default: return { amount: person.goal, name: "GOAL" };
    }
  };

  const getGoalColor = (level: number) => {
    switch (level) {
      case 0: return "emerald";
      case 1: return "amber";
      case 2: return "gray";
      case 3: return "yellow";
      default: return "emerald";
    }
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <CardTitle>🎯 Goal Progress</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {salespeople.map((person) => {
            const level = getAchievedLevel(person);
            const currentGoal = getCurrentGoal(person);
            const progress = (person.sold / currentGoal.amount) * 100;
            const color = getGoalColor(level);
            
            return (
              <div key={person.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-emerald-800">{person.name}</h3>
                    <p className="text-sm text-emerald-600">{currentGoal.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-800">R$ {person.sold.toLocaleString()}</p>
                    <p className="text-sm text-emerald-600">/ R$ {currentGoal.amount.toLocaleString()}</p>
                  </div>
                </div>
                
                <Progress 
                  value={Math.min(progress, 100)} 
                  className="h-3"
                />
                
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Goal: R$ {person.goal.toLocaleString()}</span>
                  <span>Challenge: R$ {person.challenge.toLocaleString()}</span>
                  <span>Mega: R$ {person.mega.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
