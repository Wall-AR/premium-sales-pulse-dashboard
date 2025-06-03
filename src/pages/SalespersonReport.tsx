import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSellerProfileById, SellerProfile } from "@/lib/supabaseQueries";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Navigation } from "@/components/Navigation";
import { ArrowLeft, Mail, UserCircle, Activity, Loader2, AlertTriangle } from "lucide-react"; // Added relevant icons

const SalespersonReport = () => {
  const { id: sellerId } = useParams<{ id: string }>(); // Ensure 'id' matches your route param
  const navigate = useNavigate();

  const {
    data: seller,
    isLoading,
    isError,
    error
  } = useQuery<SellerProfile | null, Error>({
    queryKey: ['sellerProfile', sellerId],
    queryFn: async () => {
      if (!sellerId) return null; // Should not happen if route is defined correctly
      const { data, error: queryError } = await getSellerProfileById(sellerId);
      if (queryError) {
        // Let React Query handle the error state based on what's thrown
        throw new Error(queryError.message || 'Erro ao buscar perfil do vendedor.');
      }
      return data;
    },
    enabled: !!sellerId, // Only run query if sellerId is present
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
          <p className="ml-4 text-green-700 text-xl">Carregando perfil do vendedor...</p>
        </div>
      </div>
    );
  }

  if (isError) {
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

  if (!seller) {
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

  const getInitials = (name: string | undefined): string => {
    if (!name) return 'N/A';
    const names = name.split(' ');
    if (names.length === 0 || !names[0]) return 'N/A';
    return names.map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
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

              {/* Placeholder for future detailed stats or activity */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Atividade de Vendas</h3>
                <p className="text-gray-500">
                  Dados detalhados de performance e atividades de vendas para este vendedor serão exibidos aqui em futuras atualizações.
                </p>
                {/* Example: Could link to a list of sales by this seller, or show recent activity */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalespersonReport;
