
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
import { ArrowLeft, Plus, Trash2, Save, Users, Target } from "lucide-react";
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

    const targetPayload = {
      seller_id: person.id,
      month: `${selectedMonth}-01`,
      goal_value: person.goal ?? 0,
      challenge_value: person.challenge ?? 0,
      mega_goal_value: person.mega ?? 0,
    };

    let result;
    if (person.seller_target_id) {
      // Update: RLS for seller_targets: USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id)
      // This policy implies that the 'seller_id' column in 'seller_targets' must be the auth.uid() of the current user.
      // This is problematic if 'seller_id' is a FK to 'salespeople.id' and an admin is making changes.
      // For this to work as an admin, RLS would need to allow based on an admin role, or this should use a service client.
      // Or, if users manage their own targets, person.id (which is salespeople.id) must match currentUser.id.
      // The SQL schema uses seller_id as FK to salespeople.id.
      // The provided RLS `auth.uid() = seller_id` will likely fail unless `salespeople.id` IS an `auth.uid`.
      // This needs careful review of RLS vs. table structure.
      // For now, we pass what's needed for UpdateSellerTargetData if RLS were to allow it.
      // UpdateSellerTargetData expects updated_by. The table has updated_by, but RLS for update uses seller_id.
      // Let's assume for now that the RLS is what user specified and we are trying to work with it.
      // The SQL RLS for UPDATE is `USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id)`
      // The `updateSellerTarget` function itself does not require `updated_by` in its payload params.
      // The SQL table has `updated_by` but its trigger handles `updated_at`, not `updated_by`.
      // So, for `updateSellerTarget`, we just pass the goal fields.
      result = await updateSellerTarget(person.seller_target_id, {
        goal_value: targetPayload.goal_value,
        challenge_value: targetPayload.challenge_value,
        mega_goal_value: targetPayload.mega_goal_value,
        // updated_by: currentUser.id // This would be needed if UpdateSellerTargetData required it and RLS used it.
                                    // But our UpdateSellerTargetData does not include it based on previous step.
                                    // And RLS is checking auth.uid() against seller_id.
      });
    } else {
      // Add: RLS for seller_targets: WITH CHECK (auth.uid() = seller_id)
      // This means targetPayload.seller_id (which is salespeople.id) MUST BE currentUser.id for the RLS to pass.
      // This is also problematic for an admin setting targets for others.
      // NewSellerTargetData does not require created_by in its definition from previous step.
      // The SQL table has created_by, but the RLS is on seller_id.
      // If NewSellerTargetData needed created_by, it would be:
      // const newTargetPayloadWithCreator = { ...targetPayload, created_by: currentUser.id };
      // result = await addSellerTarget(newTargetPayloadWithCreator);
      result = await addSellerTarget(targetPayload); // Assuming RLS works with seller_id matching auth.uid()
    }

    if (result && !result.error && result.data) { // Check result.data for add/update
      toast({ title: "Sucesso!", description: `Metas para ${person.name} salvas para ${selectedMonth}.` });

      // Manually refetch targets for the updated person to refresh UI immediately
      // and get the new seller_target_id if it was an add operation.
      const updatedTarget = await getSellerTargetForSellerAndMonth(person.id, `${selectedMonth}-01`);
      setSellerTargetsMap(prevMap => ({ ...prevMap, [person.id]: updatedTarget }));
      // The useEffect that combines fetchedSalespeople and sellerTargetsMap will then update the 'salespeople' state
      // which will give the person object the new seller_target_id for future updates.

      queryClient.invalidateQueries({ queryKey: ['sellerTargetsForMonth', `${selectedMonth}-01`] }); // If we had a query like this elsewhere
    } else {
      toast({ title: "Erro ao Salvar", description: result?.error?.message || "Não foi possível salvar as metas.", variant: "destructive" });
    }
    setIsSavingTargets(prev => ({ ...prev, [person.id]: false }));
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
