
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Navigation } from "@/components/Navigation";
import { salesData } from "@/data/salesData";
import { ArrowLeft, Save, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SalesEntry = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    salesperson: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    isNewCustomer: false,
    orderNumber: "",
    customerName: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Nova venda:", formData);
    
    toast({
      title: "Venda Registrada com Sucesso!",
      description: `R$ ${parseFloat(formData.amount).toLocaleString('pt-BR')} vendidos por ${formData.salesperson}`,
      duration: 3000,
    });

    setFormData({
      salesperson: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      isNewCustomer: false,
      orderNumber: "",
      customerName: ""
    });
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="salesperson" className="text-green-700 font-medium">Vendedor *</Label>
                    <Select value={formData.salesperson} onValueChange={(value) => setFormData({...formData, salesperson: value})}>
                      <SelectTrigger className="border-green-200 focus:border-green-500">
                        <SelectValue placeholder="Selecione o vendedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesData.salespeople.map((person) => (
                          <SelectItem key={person.name} value={person.name}>
                            {person.name}
                          </SelectItem>
                        ))}
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
                    disabled={!formData.salesperson || !formData.amount || !formData.orderNumber}
                  >
                    <Save className="w-4 h-4 mr-2" />
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
