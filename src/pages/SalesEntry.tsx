
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react"; // Added useState
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllSellerProfiles,
  SellerProfile,
  addSaleRecord,
  updateSaleRecord,
  getSaleRecordById,
  deleteSaleRecord, // Added deleteSaleRecord
  NewSaleRecordData,
  SaleRecord
} from "@/lib/supabaseQueries";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Navigation } from "@/components/Navigation";
import { ArrowLeft, Save, DollarSign, Loader2, Trash2 } from "lucide-react"; // Added Trash2
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Zod Schema Definition
const salesEntrySchema = z.object({
  salesperson_id: z.string().min(1, "Selecione um vendedor."),
  amount: z.preprocess(
    (a) => parseFloat(z.string().parse(a).replace(',', '.')), // Allow comma for decimal
    z.number().positive({ message: "O valor da venda deve ser positivo." })
  ),
  sale_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido."),
  is_new_customer: z.boolean().default(false),
  order_number: z.string().min(1, "Número do pedido é obrigatório."),
  customer_name: z.string().optional(),
});

export type SalesEntryFormData = z.infer<typeof salesEntrySchema>;

const SalesEntry = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setValue // Added setValue for populating form in edit mode
  } = useForm<SalesEntryFormData>({
    resolver: zodResolver(salesEntrySchema),
    defaultValues: {
      salesperson_id: "",
      amount: undefined, // Or 0, depending on desired initial state
      sale_date: new Date().toISOString().split('T')[0],
      is_new_customer: false,
      order_number: "",
      customer_name: "",
    },
  });

  const sellersQuery = useQuery<SellerProfile[], Error>({
    queryKey: ['allSellerProfiles'],
    queryFn: getAllSellerProfiles,
  });

  const { saleId } = useParams<{ saleId?: string }>();
  const isEditMode = !!saleId;
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: saleRecordToEdit, isLoading: isLoadingSaleRecord, isError: isErrorLoadingSaleRecord } = useQuery<SaleRecord | null, Error>({
    queryKey: ['saleRecord', saleId],
    queryFn: async () => {
      if (!saleId) return null;
      const { data, error } = await getSaleRecordById(saleId);
      if (error) throw new Error(error.message || "Erro ao buscar registro de venda.");
      return data;
    },
    enabled: isEditMode && !!saleId, // Only run if in edit mode and saleId is present
  });

  useEffect(() => {
    if (isEditMode && saleRecordToEdit) {
      reset({
        salesperson_id: saleRecordToEdit.salesperson_id,
        amount: saleRecordToEdit.amount,
        sale_date: saleRecordToEdit.sale_date,
        is_new_customer: saleRecordToEdit.is_new_customer,
        order_number: saleRecordToEdit.order_number,
        customer_name: saleRecordToEdit.customer_name || "",
      });
    } else if (!isEditMode) {
      // Ensure form is reset to defaults when switching from edit to new, or on initial load for new
      reset({
        salesperson_id: "",
        amount: undefined,
        sale_date: new Date().toISOString().split('T')[0],
        is_new_customer: false,
        order_number: "",
        customer_name: "",
      });
    }
  }, [isEditMode, saleRecordToEdit, reset]);


  const addSaleMutation = useMutation({
    mutationFn: (params: { saleData: NewSaleRecordData; userEmail: string }) =>
      addSaleRecord(params.saleData, params.userEmail),
    onSuccess: (response) => {
      if (response.error) {
        toast.error(`Erro ao registrar venda: ${response.error.message || 'Erro desconhecido.'}`);
      } else {
        toast.success("Venda registrada com sucesso!");
        reset();
        queryClient.invalidateQueries({ queryKey: ['kpis'] });
      }
    },
    onError: (error: Error) => {
      toast.error(`Falha ao registrar venda: ${error.message}`);
    },
  });

  const updateSaleMutation = useMutation({
    mutationFn: (params: {
      id: string;
      data: Partial<Omit<NewSaleRecordData, 'created_by' | 'salesperson_id'>> & { updated_by: string };
      userEmail: string
    }) => updateSaleRecord(params.id, params.data, params.userEmail),
    onSuccess: (response, variables) => {
      if (response.error) {
        toast.error(`Erro ao atualizar venda: ${response.error.message || 'Erro desconhecido.'}`);
      } else {
        toast.success("Venda atualizada com sucesso!");
        reset();
        queryClient.invalidateQueries({ queryKey: ['kpis'] });
        queryClient.invalidateQueries({ queryKey: ['saleRecord', variables.id] });
        navigate('/');
      }
    },
    onError: (error: Error) => {
      toast.error(`Falha ao atualizar venda: ${error.message}`);
    },
  });

  const onSubmit = async (formData: SalesEntryFormData) => {
    if (!currentUser) {
      toast.error("Autenticação necessária para salvar a venda.");
      return;
    }

    if (isEditMode && saleId) {
      const saleDataForUpdate: Partial<Omit<NewSaleRecordData, 'created_by' | 'salesperson_id'>> & { updated_by: string } = {
        ...formData,
        amount: Number(formData.amount),
        updated_by: currentUser.id,
      };
      await updateSaleMutation.mutateAsync({
        id: saleId,
        data: saleDataForUpdate,
        userEmail: currentUser.email || ""
      });
    } else {
      const saleDataForAdd: NewSaleRecordData = {
        ...formData,
        amount: Number(formData.amount),
        created_by: currentUser.id,
        // salesperson_id is already in formData
      };
      console.log('[SalesEntry.tsx] currentUser:', currentUser);
      console.log('[SalesEntry.tsx] Submitting saleDataForAdd:', JSON.stringify(saleDataForAdd, null, 2));
      await addSaleMutation.mutateAsync({
        saleData: saleDataForAdd,
        userEmail: currentUser.email || ""
      });
    }
  };

  if (isEditMode && isLoadingSaleRecord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
        <p className="ml-4 text-green-700 text-xl">Carregando dados da venda...</p>
      </div>
    );
  }

  if (isEditMode && isErrorLoadingSaleRecord) {
     return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex flex-col items-center justify-center">
        <div className="text-red-600 text-center bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Erro ao Carregar Venda</h2>
            <p className="mb-6">Não foi possível carregar os dados da venda para edição. Por favor, tente novamente mais tarde.</p>
            <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700">
                Voltar ao Dashboard
            </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-neutral-bg"> {/* Updated background */}
      <Navigation />
      
      {/* Adjusted top padding: py-20 mt-20 became pt-[96px] pb-20 */}
      <div className="container mx-auto px-6 pt-[96px] pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mr-4 hover:bg-gray-100 text-gray-700" // Neutral for ghost button
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800"> {/* Neutral for page title */}
                {isEditMode ? "Editar Registro de Venda" : "Registrar Nova Venda"}
              </h1>
              <p className="text-gray-600"> {/* Neutral for subtitle */}
                {isEditMode ? "Atualize os detalhes da venda abaixo." : "Cadastre uma nova venda no sistema."}
              </p>
            </div>
          </div>

          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-primary-green text-white"> {/* Header uses primary-green */}
              <CardTitle className="flex items-center">
                <DollarSign className="w-6 h-6 mr-2" />
                Informações da Venda
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="salesperson_id" className="text-gray-700 font-medium">Vendedor *</Label>
                    <Controller
                      name="salesperson_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={sellersQuery.isLoading || sellersQuery.isError}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-primary-green">
                            <SelectValue placeholder={
                              sellersQuery.isLoading ? "Carregando vendedores..." :
                              sellersQuery.isError ? "Erro ao carregar" :
                              "Selecione o vendedor"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {sellersQuery.data?.map((person) => (
                              <SelectItem key={person.id} value={person.id}>
                                {person.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.salesperson_id && <p className="text-xs text-red-500 mt-1">{errors.salesperson_id.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-gray-700 font-medium">Valor da Venda (R$) *</Label>
                    <Input
                      id="amount"
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      {...register("amount")}
                      className={`text-lg font-semibold border-gray-300 focus:border-primary-green ${errors.amount ? 'border-red-500' : ''}`}
                    />
                    {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sale_date" className="text-gray-700 font-medium">Data da Venda *</Label>
                    <Input
                      id="sale_date"
                      type="date"
                      {...register("sale_date")}
                      className={`border-gray-300 focus:border-primary-green ${errors.sale_date ? 'border-red-500' : ''}`}
                    />
                    {errors.sale_date && <p className="text-xs text-red-500 mt-1">{errors.sale_date.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order_number" className="text-gray-700 font-medium">Número do Pedido *</Label>
                    <Input
                      id="order_number"
                      placeholder="ex: PED-2025-001"
                      {...register("order_number")}
                      className={`border-gray-300 focus:border-primary-green ${errors.order_number ? 'border-red-500' : ''}`}
                    />
                    {errors.order_number && <p className="text-xs text-red-500 mt-1">{errors.order_number.message}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="customer_name" className="text-gray-700 font-medium">Nome do Cliente</Label>
                    <Input
                      id="customer_name"
                      placeholder="Nome do cliente"
                      {...register("customer_name")}
                      className={`border-gray-300 focus:border-primary-green ${errors.customer_name ? 'border-red-500' : ''}`}
                    />
                    {errors.customer_name && <p className="text-xs text-red-500 mt-1">{errors.customer_name.message}</p>}
                  </div>

                  <div className="md:col-span-2 flex items-center space-x-3 p-4 bg-secondary-green/30 rounded-lg border border-secondary-green">
                    <Controller
                      name="is_new_customer"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="is_new_customer"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-gray-400 data-[state=checked]:bg-primary-green"
                        />
                      )}
                    />
                    <Label htmlFor="is_new_customer" className="text-gray-700 font-medium mb-0">
                      Este é um cliente novo
                    </Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100" // Neutral outline
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary-green hover:brightness-90 text-white px-8 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green/70"
                    disabled={isSubmitting || sellersQuery.isLoading}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isEditMode ?
                      (updateSaleMutation.isPending ? "Salvando..." : "Salvar Alterações") :
                      (addSaleMutation.isPending ? "Salvando..." : "Salvar Venda")
                    }
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalesEntry;
