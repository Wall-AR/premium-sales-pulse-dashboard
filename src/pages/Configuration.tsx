
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Added useQueryClient
import {
  getAllSellerProfiles,
  SellerProfile,
  getSellerTargetForSellerAndMonth,
  SellerTarget,
  addSellerTarget, // Added
  updateSellerTarget // Added
} from "@/lib/supabaseQueries";
import { useAuth } from "@/contexts/AuthContext"; // Added useAuth
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Navigation } from "@/components/Navigation";
// import { salesData } from "@/data/salesData"; // Removed as it's no longer used
import { ArrowLeft, Plus, Trash2, Save, Users, Target, Loader2 } from "lucide-react"; // Added Loader2
import { useToast } from "@/hooks/use-toast";

interface SalespersonConfig extends SellerProfile { // Extend SellerProfile
  // goal, challenge, mega will be added with default values or fetched differently later
  photo: string;
  goal?: number;
  challenge?: number;
  mega?: number;
  seller_target_id?: string; // To store ID of existing target for updates
}

const Configuration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [salespeople, setSalespeople] = useState<SalespersonConfig[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [sellerTargetsMap, setSellerTargetsMap] = useState<Record<string, SellerTarget | null>>({});
  const { user: currentUser } = useAuth(); // Get current user
  const queryClient = useQueryClient(); // For query invalidation
  const [isSavingTargets, setIsSavingTargets] = useState<Record<string, boolean>>({});


  const {
    data: fetchedSalespeople,
    isLoading: isLoadingSalespeople,
    error: fetchError
  } = useQuery<SellerProfile[], Error>({
    queryKey: ['allSellerProfilesConfigPage'],
    queryFn: getAllSellerProfiles,
  });

  // Effect to fetch targets when salespeople or selectedMonth changes
  useEffect(() => {
    if (fetchedSalespeople && selectedMonth) {
      const firstDayOfMonth = `${selectedMonth}-01`;
      // Reset targets map for the new month to clear out old month's targets
      setSellerTargetsMap({});
      fetchedSalespeople.forEach(async (sp) => {
        // console.log(`Fetching target for ${sp.name} (${sp.id}) for month ${firstDayOfMonth}`);
        const target = await getSellerTargetForSellerAndMonth(sp.id, firstDayOfMonth);
        // console.log(`Target for ${sp.name}:`, target);
        setSellerTargetsMap(prevMap => ({ ...prevMap, [sp.id]: target }));
      });
    }
  }, [fetchedSalespeople, selectedMonth]);

  // Effect to combine fetchedSalespeople and sellerTargetsMap into the displayable 'salespeople' state
  useEffect(() => {
    if (fetchedSalespeople) {
      const configuredSalespeople = fetchedSalespeople.map(p => {
        const target = sellerTargetsMap[p.id];
        return {
          ...p,
          photo: p.photo_url || "/placeholder.svg",
          goal: target?.goal_value ?? 0,
          challenge: target?.challenge_value ?? 0,
          mega: target?.mega_goal_value ?? 0,
          seller_target_id: target?.id,
        };
      });
      setSalespeople(configuredSalespeople);
    }
  }, [fetchedSalespeople, sellerTargetsMap]);


  const [newPerson, setNewPerson] = useState<Omit<SalespersonConfig, 'id' | 'email' | 'status' | 'seller_target_id'>>({
    name: "",
    photo: "",
    goal: 0,
    challenge: 0,
    mega: 0
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddPerson = () => {
    // This function might need adjustment if adding a new salesperson should also create a default target
    // For now, it just adds to local UI state. Actual salesperson creation is a separate concern.
    if (!newPerson.name || !newPerson.goal) return;
    
    // Create a temporary ID for the new person for local state keying, or handle differently
    const tempId = `new_${Date.now()}`;
    const newSalespersonEntry: SalespersonConfig = {
      // Cast to SellerProfile fields that are expected, even if some are empty
      id: tempId, // This is a local temp ID, real ID comes from DB on actual save
      name: newPerson.name,
      email: '', // Placeholder
      status: 'pending', // Default status
      photo_url: newPerson.photo || null, // Match SellerProfile
      photo: newPerson.photo || "/placeholder.svg", // For SalespersonConfig
      goal: newPerson.goal,
      challenge: newPerson.challenge,
      mega: newPerson.mega,
    };
    setSalespeople(prev => [...prev, newSalespersonEntry]);
    setNewPerson({ name: "", photo: "", goal: 0, challenge: 0, mega: 0 }); // Reset form
    setShowAddForm(false);
    
    toast({
      title: "Vendedor Adicionado (Localmente)",
      description: `${newPerson.name} foi adicionado à lista local. Salve as metas individualmente. Criação de perfil no DB é outra etapa.`,
    });
  };

  const handleRemovePerson = (personId: string) => { // Changed to use personId
    const person = salespeople.find(p => p.id === personId);
    setSalespeople(salespeople.filter((p) => p.id !== personId));
    
    toast({
      title: "Vendedor Removido (Localmente)",
      description: `${person?.name || 'Vendedor'} foi removido da lista local. Deleção no DB é outra etapa.`,
      variant: "destructive",
    });
  };

  const handleUpdatePerson = (personId: string, field: keyof SalespersonConfig, value: string | number) => { // Changed to use personId
    setSalespeople(prevSalespeople =>
      prevSalespeople.map(p =>
        p.id === personId ? { ...p, [field]: value } : p
      )
    );
  };

  const handleSaveTargets = async (person: SalespersonConfig) => {
    if (!currentUser) {
      toast({ title: "Erro de Autenticação", description: "Login necessário para salvar metas.", variant: "destructive" });
      return;
    }
    if (!selectedMonth) {
      toast({ title: "Erro de Seleção", description: "Selecione um mês para definir as metas.", variant: "destructive" });
      return;
    }

    setIsSavingTargets(prev => ({ ...prev, [person.id]: true }));

    // Ensure correct type for NewSellerTargetData which does not include id, created_at, updated_at
    const targetDataForSupabase: Omit<NewSellerTargetData, 'created_by'> = { // created_by will be added if it's a new target by RLS or function logic
                                                                            // For this function, seller_id IS the FK to salespeople.
                                                                            // The RLS on seller_targets is `auth.uid() = seller_id`
                                                                            // This means that targetPayload.seller_id MUST be an auth.uid() for RLS to pass.
                                                                            // This is a mismatch if person.id is from salespeople table and not an auth.uid().
      seller_id: person.id,
      month: `${selectedMonth}-01`,
      goal_value: person.goal ?? 0,
      challenge_value: person.challenge ?? 0,
      mega_goal_value: person.mega ?? 0,
    };

    // For UpdateSellerTargetData, we only send fields that can be updated.
    // seller_id and month should not be part of the update payload typically.
    const updatePayload: UpdateSellerTargetData = {
        goal_value: person.goal ?? 0,
        challenge_value: person.challenge ?? 0,
        mega_goal_value: person.mega ?? 0,
        // updated_by: currentUser.id, // This is part of UpdateSellerTargetData type, but handled by RLS/DB in some setups.
                                     // Our UpdateSellerTargetData in queries.ts does not require it.
                                     // The RLS for seller_targets update is `USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id)`
                                     // The SQL table itself does not have an updated_by field as per the schema provided.
                                     // Let's assume updated_by is not needed in payload based on current UpdateSellerTargetData type.
    };


    let result = null;
    let operationType = '';

    try {
      if (person.seller_target_id) {
        operationType = 'update';
        console.log(`[ConfigPage] Attempting to UPDATE target ID: ${person.seller_target_id} for seller ${person.id} (${person.name}) for month ${targetDataForSupabase.month} with payload:`, JSON.stringify(updatePayload, null, 2));
        console.warn(`[ConfigPage] RLS for UPDATE on 'seller_targets' is 'USING (auth.uid() = seller_id)'. This will fail if logged-in user (auth.uid(): ${currentUser?.id}) is not the seller_id ('${targetDataForSupabase.seller_id}') being updated, or if '${targetDataForSupabase.seller_id}' is not an auth.uid(). Current schema links seller_id to salespeople.id.`);
        result = await updateSellerTarget(person.seller_target_id, updatePayload);
      } else {
        operationType = 'add';
        // NewSellerTargetData requires seller_id, month, goal_value, challenge_value, mega_goal_value.
        // It does not require created_by as per its definition in supabaseQueries.ts, this is a mismatch with the SQL table.
        // The SQL table 'seller_targets' does NOT have 'created_by'. The RLS for INSERT is `WITH CHECK (auth.uid() = seller_id)`.
        // This means targetDataForSupabase.seller_id (which is salespeople.id) MUST BE currentUser.id for the RLS to pass.
        console.log(`[ConfigPage] Attempting to ADD target for seller ${person.id} (${person.name}) for month ${targetDataForSupabase.month} with payload:`, JSON.stringify(targetDataForSupabase, null, 2));
        console.warn(`[ConfigPage] RLS for INSERT on 'seller_targets' is 'WITH CHECK (auth.uid() = seller_id)'. This means targetPayload.seller_id ('${targetDataForSupabase.seller_id}') must be the logged-in user's ID ('${currentUser?.id}'). This will likely fail if an admin is setting targets for others and seller_id refers to salespeople.id.`);
        result = await addSellerTarget(targetDataForSupabase as NewSellerTargetData); // Cast to NewSellerTargetData as per function signature
      }

      if (result && !result.error && result.data) {
        toast({ title: "Sucesso!", description: `Metas para ${person.name} salvas para ${selectedMonth}.` });
        console.log(`[ConfigPage] ${operationType === 'update' ? 'Updated' : 'Added'} target successfully for seller ${person.id}:`, result.data);

        const updatedTarget = await getSellerTargetForSellerAndMonth(person.id, `${selectedMonth}-01`);
        setSellerTargetsMap(prevMap => ({ ...prevMap, [person.id]: updatedTarget }));
        // This will trigger the useEffect that rebuilds the 'salespeople' array with new target id.

        // Optionally, invalidate broader queries if other parts of app use this data directly for the month
        queryClient.invalidateQueries({ queryKey: ['sellerTargetsForMonth', `${selectedMonth}-01`] });
      } else {
        console.error(`[ConfigPage] Error during ${operationType} target for seller ${person.id}:`, result?.error);
        toast({ title: "Erro ao Salvar", description: result?.error?.message || `Não foi possível ${operationType === 'update' ? 'atualizar' : 'adicionar'} as metas. Verifique o console para detalhes.`, variant: "destructive" });
      }
    } catch (e: any) {
      console.error(`[ConfigPage] CRITICAL ERROR during ${operationType} target for seller ${person.id}:`, e);
      toast({ title: "Erro Crítico", description: `Ocorreu um erro inesperado ao salvar as metas. Verifique o console. ${e.message}`, variant: "destructive" });
    } finally {
      setIsSavingTargets(prev => ({ ...prev, [person.id]: false }));
    }
  };

  const totalGoals = salespeople.reduce((sum, person) => sum + (person.goal || 0), 0);

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
    <div className="min-h-screen bg-neutral-bg"> {/* Updated background */}
      <Navigation />
      
      <div className="container mx-auto px-6 pt-[100px] pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Month Selector UI */}
          <div className="mb-6 p-4 bg-white shadow rounded-lg">
            <Label htmlFor="month_selector_config" className="block text-sm font-medium text-gray-700 mb-1">
              Selecione o Mês para Metas:
            </Label>
            <Input
              type="month"
              id="month_selector_config"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="max-w-xs border-gray-300 focus:border-primary-green focus:ring-primary-green"
            />
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="mr-4 hover:bg-gray-100 text-gray-700" // Neutral
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Configuração da Equipe</h1> {/* Neutral */}
                <p className="text-gray-600">Gerencie vendedores e suas metas</p> {/* Neutral */}
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">Meta Total da Empresa</p> {/* Neutral */}
              <p className="text-2xl font-bold text-gray-800">R$ {totalGoals.toLocaleString('pt-BR')}</p> {/* Neutral */}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vendedores Existentes */}
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-primary-green text-white"> {/* Primary Green */}
                <CardTitle className="flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  Equipe Atual ({salespeople.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {salespeople.map((person, index) => (
                    <div key={person.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"> {/* Neutral border */}
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="w-12 h-12 border-2 border-gray-300"> {/* Neutral border */}
                          <AvatarImage src={person.photo} />
                          <AvatarFallback className="bg-secondary-green text-primary-green"> {/* Secondary/Primary for fallback */}
                            {person.name ? person.name.split(' ').map(n => n[0]).join('') : 'N/A'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Input
                            value={person.name}
                            onChange={(e) => handleUpdatePerson(person.id, 'name', e.target.value)}
                            className="font-semibold border-gray-300 focus:border-primary-green"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemovePerson(person.id)} // Use person.id
                          className="text-red-600 hover:bg-red-50 border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <Label className="text-gray-700">Meta</Label>
                          <Input
                            type="number"
                            value={person.goal || 0}
                            onChange={(e) => handleUpdatePerson(person.id, 'goal', parseInt(e.target.value) || 0)}
                            className="text-xs border-gray-300 focus:border-primary-green"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700">Desafio</Label>
                          <Input
                            type="number"
                            value={person.challenge || 0}
                            onChange={(e) => handleUpdatePerson(person.id, 'challenge', parseInt(e.target.value) || 0)}
                            className="text-xs border-gray-300 focus:border-primary-green"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700">Mega</Label>
                          <Input
                            type="number"
                            value={person.mega || 0}
                            onChange={(e) => handleUpdatePerson(person.id, 'mega', parseInt(e.target.value) || 0)}
                            className="text-xs border-gray-300 focus:border-primary-green"
                          />
                        </div>
                      </div>
                       {/* Save Button for this person's targets */}
                      <Button
                        size="sm"
                        onClick={() => handleSaveTargets(person)}
                        className="mt-3 w-full bg-primary-green hover:bg-primary-green/90 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green/70"
                        disabled={isSavingTargets[person.id]}
                      >
                        {isSavingTargets[person.id] ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Salvar Metas {person.name.split(' ')[0]}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Adicionar Novo Vendedor */}
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-primary-green text-white"> {/* Primary Green */}
                <CardTitle className="flex items-center">
                  <Plus className="w-6 h-6 mr-2" />
                  Adicionar Novo Membro
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {!showAddForm ? (
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="w-full bg-primary-green hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green/70"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Vendedor
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-700 font-medium">Nome *</Label> {/* Neutral label */}
                      <Input
                        value={newPerson.name}
                        onChange={(e) => setNewPerson({...newPerson, name: e.target.value})}
                        placeholder="Nome do vendedor"
                        className="border-gray-300 focus:border-primary-green" /* Neutral border, Primary focus */
                      />
                    </div>
                    
                    <div>
                      <Label className="text-gray-700 font-medium">URL da Foto</Label> {/* Neutral label */}
                      <Input
                        value={newPerson.photo}
                        onChange={(e) => setNewPerson({...newPerson, photo: e.target.value})}
                        placeholder="https://exemplo.com/foto.jpg"
                        className="border-gray-300 focus:border-primary-green" /* Neutral border, Primary focus */
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-gray-700 font-medium">Meta *</Label> {/* Neutral label */}
                        <Input
                          type="number"
                          value={newPerson.goal || ""}
                          onChange={(e) => setNewPerson({...newPerson, goal: parseInt(e.target.value) || 0})}
                          placeholder="30000"
                          className="border-gray-300 focus:border-primary-green" /* Neutral border, Primary focus */
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 font-medium">Desafio</Label> {/* Neutral label */}
                        <Input
                          type="number"
                          value={newPerson.challenge || ""}
                          onChange={(e) => setNewPerson({...newPerson, challenge: parseInt(e.target.value) || 0})}
                          placeholder="42000"
                          className="border-gray-300 focus:border-primary-green" /* Neutral border, Primary focus */
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 font-medium">Mega</Label> {/* Neutral label */}
                        <Input
                          type="number"
                          value={newPerson.mega || ""}
                          onChange={(e) => setNewPerson({...newPerson, mega: parseInt(e.target.value) || 0})}
                          placeholder="55000"
                          className="border-gray-300 focus:border-primary-green" /* Neutral border, Primary focus */
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100" // Neutral outline
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddPerson}
                        disabled={!newPerson.name || !newPerson.goal}
                        className="flex-1 bg-primary-green hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green/70"
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
