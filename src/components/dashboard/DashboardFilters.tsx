
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter } from "lucide-react";

export const DashboardFilters = () => {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="flex items-center text-gray-700">
          <Filter className="w-5 h-5 mr-2" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-600">Data</Label>
          <div className="mt-1 p-3 bg-gray-50 rounded border text-sm text-gray-700 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Abril/2025
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-600">Vendedor</Label>
          <Select defaultValue="todos">
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="aguila">Águila</SelectItem>
              <SelectItem value="thaynan">Thaynan</SelectItem>
              <SelectItem value="wallace">Wallace</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-600">Tipo de Cliente</Label>
          <Select defaultValue="todos">
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="novos">Novos</SelectItem>
              <SelectItem value="existentes">Existentes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
