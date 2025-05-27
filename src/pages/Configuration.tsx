import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Navigation } from "@/components/Navigation";
import { salesData } from "@/data/salesData";
import { ArrowLeft, Plus, Trash2, Save, Users, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SalespersonConfig {
  name: string;
  photo: string;
  goal: number;
  challenge: number;
  mega: number;
}

const Configuration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [salespeople, setSalespeople] = useState<SalespersonConfig[]>(
    salesData.salespeople.map(p => ({
      name: p.name,
      photo: p.photo || "/placeholder.svg",
      goal: p.goal,
      challenge: p.challenge,
      mega: p.mega
    }))
  );

  const [newPerson, setNewPerson] = useState({
    name: "",
    photo: "",
    goal: 0,
    challenge: 0,
    mega: 0
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddPerson = () => {
    if (!newPerson.name || !newPerson.goal) return;
    
    setSalespeople([...salespeople, { ...newPerson, photo: newPerson.photo || "/placeholder.svg" }]);
    setNewPerson({ name: "", photo: "", goal: 0, challenge: 0, mega: 0 });
    setShowAddForm(false);
    
    toast({
      title: "Salesperson Added!",
      description: `${newPerson.name} has been added to the team.`,
    });
  };

  const handleRemovePerson = (index: number) => {
    const person = salespeople[index];
    setSalespeople(salespeople.filter((_, i) => i !== index));
    
    toast({
      title: "Salesperson Removed",
      description: `${person.name} has been removed from the team.`,
      variant: "destructive",
    });
  };

  const handleUpdatePerson = (index: number, field: keyof SalespersonConfig, value: string | number) => {
    const updated = [...salespeople];
    updated[index] = { ...updated[index], [field]: value };
    setSalespeople(updated);
  };

  const totalGoals = salespeople.reduce((sum, person) => sum + person.goal, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <Navigation />
      
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="mr-4 hover:bg-purple-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-purple-800">Team Configuration</h1>
                <p className="text-purple-600">Manage salespeople and their goals</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-purple-600">Total Company Goal</p>
              <p className="text-2xl font-bold text-purple-800">R$ {totalGoals.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Existing Salespeople */}
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  Current Team ({salespeople.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {salespeople.map((person, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-purple-50 transition-colors">
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={person.photo} />
                          <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Input
                            value={person.name}
                            onChange={(e) => handleUpdatePerson(index, 'name', e.target.value)}
                            className="font-semibold"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemovePerson(index)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <Label>Goal</Label>
                          <Input
                            type="number"
                            value={person.goal}
                            onChange={(e) => handleUpdatePerson(index, 'goal', parseInt(e.target.value) || 0)}
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Label>Challenge</Label>
                          <Input
                            type="number"
                            value={person.challenge}
                            onChange={(e) => handleUpdatePerson(index, 'challenge', parseInt(e.target.value) || 0)}
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Label>Mega</Label>
                          <Input
                            type="number"
                            value={person.mega}
                            onChange={(e) => handleUpdatePerson(index, 'mega', parseInt(e.target.value) || 0)}
                            className="text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add New Salesperson */}
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="flex items-center">
                  <Plus className="w-6 h-6 mr-2" />
                  Add New Team Member
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {!showAddForm ? (
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Salesperson
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Name *</Label>
                      <Input
                        value={newPerson.name}
                        onChange={(e) => setNewPerson({...newPerson, name: e.target.value})}
                        placeholder="Salesperson name"
                      />
                    </div>
                    
                    <div>
                      <Label>Photo URL</Label>
                      <Input
                        value={newPerson.photo}
                        onChange={(e) => setNewPerson({...newPerson, photo: e.target.value})}
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Goal *</Label>
                        <Input
                          type="number"
                          value={newPerson.goal || ""}
                          onChange={(e) => setNewPerson({...newPerson, goal: parseInt(e.target.value) || 0})}
                          placeholder="30000"
                        />
                      </div>
                      <div>
                        <Label>Challenge</Label>
                        <Input
                          type="number"
                          value={newPerson.challenge || ""}
                          onChange={(e) => setNewPerson({...newPerson, challenge: parseInt(e.target.value) || 0})}
                          placeholder="42000"
                        />
                      </div>
                      <div>
                        <Label>Mega</Label>
                        <Input
                          type="number"
                          value={newPerson.mega || ""}
                          onChange={(e) => setNewPerson({...newPerson, mega: parseInt(e.target.value) || 0})}
                          placeholder="55000"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddPerson}
                        disabled={!newPerson.name || !newPerson.goal}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
