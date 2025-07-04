
import React from "react"; // useState not needed if only consuming props
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Tag, Leaf } from "lucide-react"; // Added Leaf
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DashboardFiltersProps {
  onMonthYearChange: (monthYear?: string) => void;
  currentMonthYear?: string;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({ onMonthYearChange, currentMonthYear }) => {
  return (
    <Card className="rounded-xl shadow-md bg-white h-full"> {/* Ensure card can take full height if its container allows */}
      <CardContent className="p-4 flex flex-col h-full"> {/* New: flex flex-col h-full */}
        <div> {/* Wrapper for actual filter groups */}
          <div className="mb-6"> {/* Período Section */}
            <Label htmlFor="month_year_filter" className="text-sm text-gray-500 flex items-center mb-1">
            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
            Período (Mês/Ano)
          </Label>
          <Input
            type="month"
            id="month_year_filter"
            value={currentMonthYear || ''}
            onChange={(e) => onMonthYearChange(e.target.value || undefined)}
            className="mt-1 w-full border-gray-300 focus:border-green-500 rounded-md shadow-sm"
          />
          {currentMonthYear && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMonthYearChange(undefined)}
              className="mt-2 w-full text-xs text-gray-600 hover:text-gray-800 border-gray-300"
            >
              Limpar Filtro de Período
            </Button>
          )}
        </div>

        <div className="mb-6"> {/* Vendedor Section */}
          {/* Label: text-sm text-gray-500 (font-normal implied) */}
          <Label className="text-sm text-gray-500 flex items-center mb-1">
            <Users className="w-4 h-4 mr-2 text-gray-500" />
            Vendedor
          </Label>
          <Select defaultValue="todos">
            <SelectTrigger className="mt-1 border-gray-300 focus:border-green-500">
              <SelectValue placeholder="Selecione um vendedor" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-300">
              <SelectItem value="todos">Todos os Vendedores</SelectItem>
              <SelectItem value="aguila">Águila</SelectItem>
              <SelectItem value="thaynan">Thaynan</SelectItem>
              <SelectItem value="wallace">Wallace</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div> {/* Tipo de Cliente Section - last item, mb-6 removed or could be smaller */}
          {/* Label: text-sm text-gray-500 (font-normal implied) */}
          <Label className="text-sm text-gray-500 flex items-center mb-1">
            <Tag className="w-4 h-4 mr-2 text-gray-500" />
            Tipo de Cliente
          </Label>
          <Select defaultValue="todos">
            <SelectTrigger className="mt-1 border-gray-300 focus:border-primary-green"> {/* Ensure focus color matches theme */}
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-300">
              <SelectItem value="todos">Todos os Clientes</SelectItem>
              <SelectItem value="novos">Clientes Novos</SelectItem>
              <SelectItem value="existentes">Clientes Existentes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* End of filter groups wrapper */}
        </div>

        {/* Motivational Message */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-500">
            <Leaf className="w-4 h-4 mr-2 text-primary-green" />
            <p className="italic">“Crescendo juntos é nossa meta. Cada venda importa.”</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
