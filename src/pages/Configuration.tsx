
import { useState, useEffect } from "react"; // Added useEffect
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query"; // Added useQuery
import { getAllSellerProfiles, SellerProfile } from "@/lib/supabaseQueries"; // Added Supabase queries
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Navigation } from "@/components/Navigation";
// import { salesData } from "@/data/salesData"; // Removed as it's no longer used
import { ArrowLeft, Plus, Trash2, Save, Users, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SalespersonConfig extends SellerProfile { // Extend SellerProfile
  // goal, challenge, mega will be added with default values or fetched differently later
  photo: string; // Overwrite/ensure photo is part of this, effectively from photo_url
  goal?: number;
  challenge?: number;
  mega?: number;
}

const Configuration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [salespeople, setSalespeople] = useState<SalespersonConfig[]>([]);

  const {
    data: fetchedSalespeople,
    isLoading: isLoadingSalespeople,
    error: fetchError
  } = useQuery<SellerProfile[], Error>({
    queryKey: ['allSellerProfilesConfigPage'], // Unique query key
    queryFn: getAllSellerProfiles,
  });

  useEffect(() => {
    if (fetchedSalespeople) {
      const configuredSalespeople = fetchedSalespeople.map(p => ({
        ...p, // Spread SellerProfile properties
        photo: p.photo_url || "/placeholder.svg", // Adapt photo_url to photo
        goal: 0, // Placeholder, to be addressed later
        challenge: 0, // Placeholder
        mega: 0 // Placeholder
      }));
      setSalespeople(configuredSalespeople);
    }
  }, [fetchedSalespeople]);

  const [newPerson, setNewPerson] = useState<Omit<SalespersonConfig, 'id' | 'email' | 'status'>>({ // Adjusted for new structure, id comes from DB
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
      title: "Vendedor Adicionado!",
      description: `${newPerson.name} foi adicionado à equipe.`,
    });
  };

  const handleRemovePerson = (index: number) => {
    const person = salespeople[index];
    setSalespeople(salespeople.filter((_, i) => i !== index));
    
    toast({
      title: "Vendedor Removido",
      description: `${person.name} foi removido da equipe.`,
      variant: "destructive",
    });
  };

  const handleUpdatePerson = (index: number, field: keyof SalespersonConfig, value: string | number) => {
    const updated = [...salespeople];
    updated[index] = { ...updated[index], [field]: value };
    setSalespeople(updated);
  };

  const totalGoals = salespeople.reduce((sum, person) => sum + (person.goal || 0), 0); // Added person.goal || 0 for safety

  if (isLoadingSalespeople) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-lg text-green-700">Carregando vendedores...</p> {/* Loading message */}
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-lg text-red-700">Erro ao carregar vendedores: {fetchError.message}</p> {/* Error message */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Navigation />
      
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="mr-4 hover:bg-green-100 text-green-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-green-800">Configuração da Equipe</h1>
                <p className="text-green-600">Gerencie vendedores e suas metas</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-green-600">Meta Total da Empresa</p>
              <p className="text-2xl font-bold text-green-800">R$ {totalGoals.toLocaleString('pt-BR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vendedores Existentes */}
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  Equipe Atual ({salespeople.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {salespeople.map((person, index) => (
                    <div key={person.id} className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"> {/* Use person.id as key */}
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="w-12 h-12 border-2 border-green-300">
                          <AvatarImage src={person.photo} />
                          <AvatarFallback className="bg-green-100 text-green-700">
                            {person.name ? person.name.split(' ').map(n => n[0]).join('') : 'N/A'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Input
                            value={person.name}
                            onChange={(e) => handleUpdatePerson(index, 'name', e.target.value)}
                            className="font-semibold border-green-200 focus:border-green-500"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemovePerson(index)}
                          className="text-red-600 hover:bg-red-50 border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <Label className="text-green-700">Meta</Label>
                          <Input
                            type="number"
                            value={person.goal || 0} // Use person.goal || 0 for safety
                            onChange={(e) => handleUpdatePerson(index, 'goal', parseInt(e.target.value) || 0)}
                            className="text-xs border-green-200 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <Label className="text-green-700">Desafio</Label>
                          <Input
                            type="number"
                            value={person.challenge || 0} // Use person.challenge || 0 for safety
                            onChange={(e) => handleUpdatePerson(index, 'challenge', parseInt(e.target.value) || 0)}
                            className="text-xs border-green-200 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <Label className="text-green-700">Mega</Label>
                          <Input
                            type="number"
                            value={person.mega || 0} // Use person.mega || 0 for safety
                            onChange={(e) => handleUpdatePerson(index, 'mega', parseInt(e.target.value) || 0)}
                            className="text-xs border-green-200 focus:border-green-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Adicionar Novo Vendedor */}
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                <CardTitle className="flex items-center">
                  <Plus className="w-6 h-6 mr-2" />
                  Adicionar Novo Membro
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {!showAddForm ? (
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Vendedor
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-green-700 font-medium">Nome *</Label>
                      <Input
                        value={newPerson.name}
                        onChange={(e) => setNewPerson({...newPerson, name: e.target.value})}
                        placeholder="Nome do vendedor"
                        className="border-green-200 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-green-700 font-medium">URL da Foto</Label>
                      <Input
                        value={newPerson.photo}
                        onChange={(e) => setNewPerson({...newPerson, photo: e.target.value})}
                        placeholder="https://exemplo.com/foto.jpg"
                        className="border-green-200 focus:border-green-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-green-700 font-medium">Meta *</Label>
                        <Input
                          type="number"
                          value={newPerson.goal || ""}
                          onChange={(e) => setNewPerson({...newPerson, goal: parseInt(e.target.value) || 0})}
                          placeholder="30000"
                          className="border-green-200 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <Label className="text-green-700 font-medium">Desafio</Label>
                        <Input
                          type="number"
                          value={newPerson.challenge || ""}
                          onChange={(e) => setNewPerson({...newPerson, challenge: parseInt(e.target.value) || 0})}
                          placeholder="42000"
                          className="border-green-200 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <Label className="text-green-700 font-medium">Mega</Label>
                        <Input
                          type="number"
                          value={newPerson.mega || ""}
                          onChange={(e) => setNewPerson({...newPerson, mega: parseInt(e.target.value) || 0})}
                          placeholder="55000"
                          className="border-green-200 focus:border-green-500"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddPerson}
                        disabled={!newPerson.name || !newPerson.goal}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Adicionar
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
