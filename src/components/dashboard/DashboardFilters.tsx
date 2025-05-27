
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter } from "lucide-react";

export const DashboardFilters = () => {
  return (
    <Card className="bg-white shadow-lg border-green-100">
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-b">
        <CardTitle className="flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div>
          <Label className="text-sm font-medium text-green-700">Período</Label>
          <div className="mt-1 p-3 bg-green-50 rounded border border-green-200 text-sm text-green-700 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Abril/2025
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-green-700">Vendedor</Label>
          <Select defaultValue="todos">
            <SelectTrigger className="mt-1 border-green-200 focus:border-green-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-green-200">
              <SelectItem value="todos">Todos os Vendedores</SelectItem>
              <SelectItem value="aguila">Águila</SelectItem>
              <SelectItem value="thaynan">Thaynan</SelectItem>
              <SelectItem value="wallace">Wallace</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-green-700">Tipo de Cliente</Label>
          <Select defaultValue="todos">
            <SelectTrigger className="mt-1 border-green-200 focus:border-green-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-green-200">
              <SelectItem value="todos">Todos os Clientes</SelectItem>
              <SelectItem value="novos">Clientes Novos</SelectItem>
              <SelectItem value="existentes">Clientes Existentes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
