
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
    reset 
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

  const onSubmit = (data: SalesEntryFormData) => {
    console.log("Nova venda (react-hook-form):", data);
    
    // Find salesperson name for toast
    const salespersonName = sellersQuery.data?.find(s => s.id === data.salesperson_id)?.name || "Desconhecido";

    toast.success("Venda Registrada com Sucesso!", {
      description: `R$ ${data.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} vendidos por ${salespersonName}`,
      duration: 3000,
    });
    reset(); // Reset form to default values
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Navigation />
      
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mr-4 hover:bg-green-100 text-green-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-green-800">Registrar Nova Venda</h1>
              <p className="text-green-600">Cadastre uma nova venda no sistema</p>
            </div>
          </div>

          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <CardTitle className="flex items-center">
                <DollarSign className="w-6 h-6 mr-2" />
                Informações da Venda
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="salesperson_id" className="text-green-700 font-medium">Vendedor *</Label>
                    <Controller
                      name="salesperson_id"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={sellersQuery.isLoading || sellersQuery.isError}
                        >
                          <SelectTrigger className="border-green-200 focus:border-green-500">
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
                    <Label htmlFor="amount" className="text-green-700 font-medium">Valor da Venda (R$) *</Label>
                    <Input
                      id="amount"
                      type="text" // Use text to allow comma, preprocess will handle parseFloat
                      inputMode="decimal" // For better mobile UX
                      placeholder="0,00"
                      {...register("amount")}
                      className={`text-lg font-semibold border-green-200 focus:border-green-500 ${errors.amount ? 'border-red-500' : ''}`}
                    />
                    {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sale_date" className="text-green-700 font-medium">Data da Venda *</Label>
                    <Input
                      id="sale_date"
                      type="date"
                      {...register("sale_date")}
                      className={`border-green-200 focus:border-green-500 ${errors.sale_date ? 'border-red-500' : ''}`}
                    />
                    {errors.sale_date && <p className="text-xs text-red-500 mt-1">{errors.sale_date.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order_number" className="text-green-700 font-medium">Número do Pedido *</Label>
                    <Input
                      id="order_number"
                      placeholder="ex: PED-2025-001"
                      {...register("order_number")}
                      className={`border-green-200 focus:border-green-500 ${errors.order_number ? 'border-red-500' : ''}`}
                    />
                    {errors.order_number && <p className="text-xs text-red-500 mt-1">{errors.order_number.message}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="customer_name" className="text-green-700 font-medium">Nome do Cliente</Label>
                    <Input
                      id="customer_name"
                      placeholder="Nome do cliente"
                      {...register("customer_name")}
                      className={`border-green-200 focus:border-green-500 ${errors.customer_name ? 'border-red-500' : ''}`}
                    />
                    {errors.customer_name && <p className="text-xs text-red-500 mt-1">{errors.customer_name.message}</p>}
                  </div>

                  <div className="md:col-span-2 flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <Controller
                      name="is_new_customer"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="is_new_customer"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-green-300 data-[state=checked]:bg-green-600"
                        />
                      )}
                    />
                    <Label htmlFor="is_new_customer" className="text-green-700 font-medium mb-0">
                      Este é um cliente novo
                    </Label>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-green-700 font-medium">Valor da Venda (R$) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      required
                      className="text-lg font-semibold border-green-200 focus:border-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-green-700 font-medium">Data da Venda *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orderNumber" className="text-green-700 font-medium">Número do Pedido *</Label>
                    <Input
                      id="orderNumber"
                      placeholder="ex: PED-2025-001"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
                      required
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="customerName" className="text-green-700 font-medium">Nome do Cliente</Label>
                    <Input
                      id="customerName"
                      placeholder="Nome do cliente"
                      value={formData.customerName}
                      onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      className="border-green-200 focus:border-green-500"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <Checkbox
                      id="isNewCustomer"
                      checked={formData.isNewCustomer}
                      onCheckedChange={(checked) => setFormData({...formData, isNewCustomer: checked as boolean})}
                      className="border-green-300"
                    />
                    <Label htmlFor="isNewCustomer" className="text-green-700 font-medium">
                      Este é um cliente novo
                    </Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                    disabled={isSubmitting || sellersQuery.isLoading}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar Venda
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
