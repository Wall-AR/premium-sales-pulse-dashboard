import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSellerProfileById, SellerProfile, getSalesRecordsBySalesperson, SaleRecord } from "@/lib/supabaseQueries";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Navigation } from "@/components/Navigation";
import { ArrowLeft, Mail, UserCircle, Activity, Loader2, AlertTriangle, Filter } from "lucide-react"; // Added relevant icons
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { Input } from "@/components/ui/input"; // Added Input for filter
import { Label }  from "@/components/ui/label"; // Added Label for filter

const SalespersonReport = () => {
  const { id: sellerId } = useParams<{ id: string }>(); // Ensure 'id' matches your route param
  const navigate = useNavigate();
  const [monthYearFilter, setMonthYearFilter] = React.useState<string | undefined>(() => {
    // Default to current month for example, or leave undefined for "all time"
    // const today = new Date();
    // return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    return undefined;
  });

  const {
    data: seller,
    isLoading,
    isError,
    error
  } = useQuery<SellerProfile | null, Error>({
    queryKey: ['sellerProfile', sellerId],
    queryFn: async () => {
      if (!sellerId) return null;
      const { data, error: queryError } = await getSellerProfileById(sellerId);
      if (queryError) {
        throw new Error(queryError.message || 'Erro ao buscar perfil do vendedor.');
      }
      return data;
    },
    enabled: !!sellerId,
  });

  const {
    data: salesRecords,
    isLoading: isLoadingSalesRecords,
    isError: isErrorSalesRecords,
    error: errorSalesRecords
  } = useQuery<SaleRecord[], Error>({
    queryKey: ['salesRecordsBySalesperson', sellerId, monthYearFilter],
    queryFn: () => {
      if (!sellerId) return [];
      return getSalesRecordsBySalesperson(sellerId, monthYearFilter ? { month_year: monthYearFilter } : undefined);
    },
    enabled: !!sellerId,
  });

  const performanceMetrics = React.useMemo(() => {
    if (!salesRecords || salesRecords.length === 0) {
      return {
        totalSalesAmount: 0,
        numberOfSales: 0,
        averageSaleAmount: 0,
        totalNewCustomers: 0,
      };
    }
    const totalSalesAmount = salesRecords.reduce((sum, record) => sum + record.amount, 0);
    const numberOfSales = salesRecords.length;
    const averageSaleAmount = numberOfSales > 0 ? totalSalesAmount / numberOfSales : 0;
    const totalNewCustomers = salesRecords.filter(record => record.is_new_customer).length;
    return {
      totalSalesAmount,
      numberOfSales,
      averageSaleAmount,
      totalNewCustomers,
    };
  }, [salesRecords]);

  const chartData = React.useMemo(() => {
    if (!salesRecords || salesRecords.length === 0) {
      return [];
    }
    const salesByDate: { [date: string]: number } = {};
    salesRecords.forEach(record => {
      const dateObj = new Date(record.sale_date + 'T00:00:00');
      const dateStr = dateObj.toLocaleDateString('en-CA');
      salesByDate[dateStr] = (salesByDate[dateStr] || 0) + record.amount;
    });
    return Object.entries(salesByDate)
      .map(([date, totalSales]) => ({ date, totalSales }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [salesRecords]);

  const chartConfig = {
    totalSales: {
      label: "Vendas",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const getInitials = (name: string | undefined): string => {
    if (!name) return 'N/A';
    const names = name.split(' ');
    if (names.length === 0 || !names[0]) return 'N/A';
    return names.map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Conditional returns AFTER all hooks have been called
  if (isLoading || isLoadingSalesRecords) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
          <p className="ml-4 text-green-700 text-xl">Carregando dados do vendedor...</p>
        </div>
      </div>
    );
  }

  if (isError) { // Error fetching seller profile
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex flex-col items-center justify-center">
        <Navigation />
        <div className="flex-grow flex items-center justify-center text-center">
          <Card className="p-8 bg-white shadow-xl">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Erro ao Carregar Perfil</h2>
            <p className="text-red-600 mb-6">{error?.message || "Não foi possível carregar os dados do vendedor."}</p>
            <Button onClick={() => navigate("/")} className="bg-red-600 hover:bg-red-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Note: isErrorSalesRecords is handled inline where the sales records table/chart are rendered.
  // If it were a fatal error for the whole page, it could be handled here too.

  if (!seller) { // Seller not found after successful fetch (data is null)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
        <Navigation />
        <div className="flex-grow flex items-center justify-center text-center">
          <Card className="p-8 bg-white shadow-xl">
            <UserCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Vendedor Não Encontrado</h2>
            <p className="text-gray-500 mb-6">O perfil do vendedor solicitado não foi encontrado.</p>
            <Button onClick={() => navigate("/")} className="bg-gray-500 hover:bg-gray-600 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Navigation />
      
      {/* Adjusted top padding: py-12 sm:py-20 became pt-[96px] sm:pt-[100px] pb-12 sm:pb-20 */}
      <div className="container mx-auto px-4 sm:px-6 pt-[96px] sm:pt-[100px] pb-12 sm:pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>

          <Card className="shadow-xl border-gray-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 sm:p-8">
              <div className="flex items-center space-x-4 sm:space-x-6">
                <Avatar className="w-20 h-20 sm:w-28 sm:h-28 border-4 border-white shadow-lg">
                  <AvatarImage src={seller.photo_url || undefined} alt={seller.name} />
                  <AvatarFallback className="text-3xl sm:text-4xl font-bold bg-white text-green-700">
                    {getInitials(seller.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-3xl sm:text-4xl font-bold text-white">{seller.name}</CardTitle>
                  <CardDescription className="text-green-100 text-base sm:text-lg mt-1">
                    Perfil do Vendedor
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6 bg-white">
              {/* Date Filter UI */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Label htmlFor="monthYearFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrar Vendas por Mês/Ano:
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="month"
                    id="monthYearFilter"
                    value={monthYearFilter || ""}
                    onChange={(e) => setMonthYearFilter(e.target.value || undefined)}
                    className="max-w-xs border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                  <Button onClick={() => setMonthYearFilter(undefined)} variant="outline" className="text-sm">
                    Limpar Filtro
                  </Button>
                </div>
                {monthYearFilter && <p className="text-xs text-gray-500 mt-1">Exibindo dados para: {new Date(monthYearFilter + '-02').toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'})}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Mail className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">{seller.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Activity className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`font-medium capitalize ${
                      seller.status === 'active' ? 'text-green-700' :
                      seller.status === 'inactive' ? 'text-red-700' :
                      'text-yellow-700'
                    }`}>
                      {seller.status === 'active' ? 'Ativo' :
                       seller.status === 'inactive' ? 'Inativo' :
                       'Pendente'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics Display */}
              {salesRecords && !isLoadingSalesRecords && !isErrorSalesRecords && (
                <div className="mb-8 pt-6 border-t border-gray-200">
                   <h3 className="text-xl font-semibold text-gray-700 mb-4">Resumo de Performance</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Total de Vendas</CardDescription>
                        <CardTitle className="text-2xl">
                          {performanceMetrics.totalSalesAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Número de Vendas</CardDescription>
                        <CardTitle className="text-2xl">{performanceMetrics.numberOfSales}</CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Ticket Médio</CardDescription>
                        <CardTitle className="text-2xl">
                          {performanceMetrics.averageSaleAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Novos Clientes</CardDescription>
                        <CardTitle className="text-2xl">{performanceMetrics.totalNewCustomers}</CardTitle>
                      </CardHeader>
                    </Card>
                  </div>
                </div>
              )}

              {/* Sales Activity Table Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Registros de Vendas</h3> {/* Changed title */}

                {/* Sales Trend Chart */}
                {chartData.length > 1 && ( // Only show chart if there are multiple data points for a trend
                  <Card className="mt-6 mb-8">
                    <CardHeader>
                      <CardTitle>Tendência de Vendas Diárias</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] sm:h-[400px] p-4">
                      <ChartContainer config={chartConfig} className="w-full h-full">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid vertical={false} strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(tick) => new Date(tick + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                            padding={{ left: 20, right: 20 }}
                          />
                          <YAxis
                            tickFormatter={(value) => `R$${(value / 1000)}k`}
                            domain={['auto', 'auto']}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent
                                        indicator="line"
                                        nameKey="totalSales"
                                        labelFormatter={(label, payload) => {
                                           if (payload && payload.length > 0 && payload[0].payload.date) {
                                               return new Date(payload[0].payload.date + 'T00:00:00').toLocaleDateString('pt-BR', {day: '2-digit', month: 'short', year: 'numeric'});
                                           }
                                           return label;
                                        }}
                                        formatter={(value, name, props) => (
                                           <div className="flex flex-col">
                                                <span className="text-xs text-gray-500">{props.payload.label /* This should be the series name from config */}</span>
                                                <span className="font-bold text-gray-800">
                                                    {Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </span>
                                           </div>
                                        )}
                                     />}
                          />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Line dataKey="totalSales" type="monotone" stroke="var(--color-totalSales)" strokeWidth={2} dot={false} name="Vendas" />
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}
                {salesRecords && salesRecords.length > 0 && chartData.length <= 1 && (
                  <p className="text-gray-500 mt-4 mb-4 text-center">Não há dados suficientes para exibir o gráfico de tendência (necessário vendas em pelo menos dois dias diferentes).</p>
                )}

                {/* Sales Records Table */}
                {isLoadingSalesRecords && <p>Carregando registros de vendas...</p>}
                {isErrorSalesRecords && <p className="text-red-500">Erro ao carregar registros de vendas: {errorSalesRecords?.message}</p>}
                {salesRecords && !isLoadingSalesRecords && !isErrorSalesRecords && (
                  salesRecords.length === 0 ? (
                    <p className="text-gray-500">Nenhum registro de venda encontrado para este vendedor.</p>
                  ) : (
                    <div className="overflow-x-auto mt-4 shadow border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor (R$)</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {salesRecords.map((record) => (
                            <tr key={record.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(record.sale_date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.order_number}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.customer_name || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{record.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalespersonReport;
