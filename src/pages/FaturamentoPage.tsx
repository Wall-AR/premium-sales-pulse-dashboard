import React, { useState } from 'react'; // Added useState
import { useQuery, useQueryClient } from '@tanstack/react-query'; // Added useQueryClient
import { getAllBillingStatements, BillingStatement, addBillingStatement, NewBillingStatementData } from '@/lib/supabaseQueries'; // Added addBillingStatement, NewBillingStatementData
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
import { Edit3, Trash2, Loader2, PlusCircle, ClipboardList, ListChecks } from 'lucide-react'; // Added ClipboardList, ListChecks

const FaturamentoPage = () => {
  const { data: billingStatements, isLoading, isError, error } = useQuery<BillingStatement[], Error>({
    queryKey: ['allBillingStatements'],
    queryFn: getAllBillingStatements,
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStatement, setNewStatement] = useState<Partial<Omit<NewBillingStatementData, 'created_by'>>>({
    month_year: '', // YYYY-MM
    faturamento_released: 0,
    faturamento_atr: 0,
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const handleAddStatement = async () => {
    if (!currentUser) {
      toast.error("Autenticação necessária.");
      return;
    }
    if (!newStatement.month_year) {
      toast.error("Mês/Ano é obrigatório.");
      return;
    }
    // Basic validation for month_year format
    if (!newStatement.month_year.match(/^\d{4}-\d{2}$/)) {
        toast.error("Formato de Mês/Ano inválido. Use YYYY-MM.");
        return;
    }
    // Add more validation as needed for amounts (e.g., non-negative)
    if ((newStatement.faturamento_released ?? 0) < 0 || (newStatement.faturamento_atr ?? 0) < 0) {
        toast.error("Valores de faturamento não podem ser negativos.");
        return;
    }


    setIsSaving(true);
    const payload: NewBillingStatementData = {
      month_year: newStatement.month_year,
      faturamento_released: newStatement.faturamento_released ?? 0,
      faturamento_atr: newStatement.faturamento_atr ?? 0,
      notes: newStatement.notes || undefined,
      created_by: currentUser.id,
    };

    const { error: addError } = await addBillingStatement(payload); // Renamed error to addError

    if (addError) {
      toast.error(`Erro ao adicionar lançamento: ${addError.message}`);
    } else {
      toast.success("Lançamento de faturamento adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['allBillingStatements'] });
      setIsAddDialogOpen(false);
      setNewStatement({ month_year: '', faturamento_released: 0, faturamento_atr: 0, notes: '' });
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
            <h1 className="text-3xl font-bold text-gray-800">Faturamento Mensal</h1> {/* Adjusted size */}
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary-green hover:bg-primary-green/90 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green/70"> {/* Added focus ring */}
                <PlusCircle className="w-4 h-4 mr-2" />
                Adicionar Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Lançamento de Faturamento</DialogTitle>
                <DialogDescription>
                  Insira os dados para o faturamento do mês. Clique em salvar quando terminar.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="month_year" className="text-right">Mês/Ano</Label>
                  <Input
                    id="month_year"
                    type="month"
                    value={newStatement.month_year}
                    onChange={(e) => setNewStatement({ ...newStatement, month_year: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="faturamento_released" className="text-right">Faturado (Liberado)</Label>
                  <Input
                    id="faturamento_released"
                    type="number"
                    value={newStatement.faturamento_released || ''}
                    onChange={(e) => setNewStatement({ ...newStatement, faturamento_released: parseFloat(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="faturamento_atr" className="text-right">Faturado (ATR)</Label>
                  <Input
                    id="faturamento_atr"
                    type="number"
                    value={newStatement.faturamento_atr || ''}
                    onChange={(e) => setNewStatement({ ...newStatement, faturamento_atr: parseFloat(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">Notas</Label>
                  <Textarea
                    id="notes"
                    value={newStatement.notes || ''} // Ensure textarea value is not null/undefined
                    onChange={(e) => setNewStatement({ ...newStatement, notes: e.target.value })}
                    className="col-span-3"
                    placeholder="Notas adicionais..."
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="button" onClick={handleAddStatement} disabled={isSaving} className="bg-primary-green hover:bg-primary-green/90 text-white">
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
            <CardDescription>Lista de todos os lançamentos de faturamento mensais.</CardDescription>
          </CardHeader>
          <CardContent>
            {billingStatements && billingStatements.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês/Ano</TableHead>
                    <TableHead className="text-right">Faturamento Liberado (R$)</TableHead>
                    <TableHead className="text-right">Faturamento ATR (R$)</TableHead>
                    <TableHead className="hidden md:table-cell">Notas</TableHead> {/* Hide notes on small screens */}
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingStatements.map((stmt) => (
                    <TableRow key={stmt.id}>
                      <TableCell className="font-medium">{new Date(stmt.month_year + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric'})}</TableCell>
                      <TableCell className="text-right">{stmt.faturamento_released.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                      <TableCell className="text-right">{stmt.faturamento_atr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate" title={stmt.notes || undefined}>{stmt.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        {/* TODO: Implement Edit/Delete functionality and wire up buttons */}
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
