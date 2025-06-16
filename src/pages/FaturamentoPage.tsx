import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllBillingEntries, BillingEntry, addBillingEntry, NewBillingEntryData } from '@/lib/supabaseQueries'; // Updated imports
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Edit3, Trash2, Loader2, PlusCircle, ClipboardList, ListChecks } from 'lucide-react';

const FaturamentoPage = () => {
  // Renamed billingStatements to billingEntries for clarity
  const { data: billingEntries, isLoading, isError, error } = useQuery<BillingEntry[], Error>({
    queryKey: ['allBillingEntries'], // Updated queryKey
    queryFn: getAllBillingEntries, // Updated function call
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  // Renamed newStatement to newEntry and updated structure
  const [newEntry, setNewEntry] = useState({
    entry_date: new Date().toISOString().split('T')[0], // Default to today YYYY-MM-DD
    faturamento_released: 0,
    faturamento_atr: 0,
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Renamed handleAddStatement to handleAddEntry
  const handleAddEntry = async () => {
    if (!currentUser) {
      toast.error("Autenticação necessária.");
      return;
    }
    if (!newEntry.entry_date) {
      toast.error("Data de Lançamento é obrigatória.");
      return;
    }
    // Basic validation for entry_date format (already handled by input type="date")
    // Add more validation as needed for amounts (e.g., non-negative)
    if ((newEntry.faturamento_released ?? 0) < 0 || (newEntry.faturamento_atr ?? 0) < 0) {
        toast.error("Valores de faturamento não podem ser negativos.");
        return;
    }

    setIsSaving(true);
    // Construct payload for NewBillingEntryData
    const payload: NewBillingEntryData = {
      entry_date: newEntry.entry_date,
      faturamento_released: newEntry.faturamento_released ?? 0,
      faturamento_atr: newEntry.faturamento_atr ?? 0,
      notes: newEntry.notes || undefined,
      created_by: currentUser.id,
    };

    const { error: addError } = await addBillingEntry(payload); // Use addBillingEntry

    if (addError) {
      toast.error(`Erro ao adicionar lançamento: ${addError.message}`);
    } else {
      toast.success("Lançamento de faturamento adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['allBillingEntries'] }); // Updated queryKey
      setIsAddDialogOpen(false);
      // Reset form
      setNewEntry({
        entry_date: new Date().toISOString().split('T')[0],
        faturamento_released: 0,
        faturamento_atr: 0,
        notes: ''
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-bg flex flex-col">
        <Navigation />
        <div className="flex-grow flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary-green animate-spin" />
          <p className="ml-4 text-primary-green text-xl">Carregando dados de faturamento...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
        <div className="min-h-screen bg-neutral-bg flex flex-col">
            <Navigation />
            <div className="flex-grow flex flex-col items-center justify-center p-4">
                <p className="text-red-600">Erro ao carregar dados: {error?.message}</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Navigation />
      <div className="container mx-auto px-6 pt-[96px] pb-20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <ClipboardList className="w-8 h-8 text-primary-green" />
            <h1 className="text-3xl font-bold text-gray-800">Faturamento Mensal</h1>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary-green hover:bg-primary-green/90 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green/70">
                <PlusCircle className="w-4 h-4 mr-2" />
                Adicionar Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Lançamento de Faturamento</DialogTitle>
                <DialogDescription>
                  Insira os dados para o novo lançamento. Clique em salvar quando terminar.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* entry_date input */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="entry_date" className="text-right">Data Lançamento</Label>
                  <Input
                    id="entry_date"
                    type="date"
                    value={newEntry.entry_date}
                    onChange={(e) => setNewEntry({ ...newEntry, entry_date: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="faturamento_released" className="text-right">Faturado (Liberado)</Label>
                  <Input
                    id="faturamento_released"
                    type="number"
                    value={newEntry.faturamento_released || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, faturamento_released: parseFloat(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="faturamento_atr" className="text-right">Faturado (ATR)</Label>
                  <Input
                    id="faturamento_atr"
                    type="number"
                    value={newEntry.faturamento_atr || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, faturamento_atr: parseFloat(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">Notas</Label>
                  <Textarea
                    id="notes"
                    value={newEntry.notes || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                    className="col-span-3"
                    placeholder="Notas adicionais..."
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="button" onClick={handleAddEntry} disabled={isSaving} className="bg-primary-green hover:bg-primary-green/90 text-white">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Salvar Lançamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-md rounded-xl bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
              <ListChecks className="w-5 h-5 mr-2 text-primary-green" />
              Registros de Faturamento
            </CardTitle>
            <CardDescription>Lista de todos os lançamentos de faturamento.</CardDescription>
          </CardHeader>
          <CardContent>
            {billingEntries && billingEntries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Lançamento</TableHead>
                    <TableHead>Mês/Ano Referência</TableHead>
                    <TableHead className="text-right">Faturamento Liberado (R$)</TableHead>
                    <TableHead className="text-right">Faturamento ATR (R$)</TableHead>
                    <TableHead className="hidden md:table-cell">Notas</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingEntries.map((entry) => ( // Renamed stmt to entry
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{new Date(entry.entry_date + 'T00:00:00').toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'})}</TableCell>
                      <TableCell>{entry.month_year}</TableCell>
                      <TableCell className="text-right">{entry.faturamento_released.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                      <TableCell className="text-right">{entry.faturamento_atr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate" title={entry.notes || undefined}>{entry.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="mr-2 hover:text-primary-green">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500 py-4">Nenhum registro de faturamento encontrado.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FaturamentoPage;
