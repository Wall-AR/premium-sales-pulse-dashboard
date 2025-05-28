import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllSellerProfiles, 
  SellerProfile, 
  addSellerProfile, 
  updateSellerProfile,
  deleteSellerProfile, 
  NewSellerProfileData 
} from '@/lib/supabaseQueries';
import { uploadSellerPhoto, deleteSellerPhoto } from '@/lib/supabaseStorage'; // Import storage functions
import { Button } from '@/components/ui/button';
import { AddSellerDialog, SellerFormData } from '@/components/dashboard/AddSellerDialog';
import { toast } from 'sonner'; // Import toast
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  PlusCircle, 
  UserCircle, 
  AlertTriangle as PageAlertTriangle, 
  Users, 
  Pencil,
  ArrowLeft, // Added ArrowLeft
  Trash2 // Added Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, 
} from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom'; // Added useNavigate


const SellerManagementPage = () => {
  const navigate = useNavigate(); // Added navigate
  const queryClient = useQueryClient();
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false); 
  const [editingSeller, setEditingSeller] = useState<SellerProfile | null>(null);
  const [sellerToDelete, setSellerToDelete] = useState<SellerProfile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


  const { data: sellers, isLoading, error, isError } = useQuery<SellerProfile[], Error>({
    queryKey: ['allSellerProfiles'],
    queryFn: getAllSellerProfiles,
  });

  const addSellerMutation = useMutation({
    mutationFn: addSellerProfile,
    onSuccess: (response) => {
      if (response.error) {
        toast.error(`Erro ao adicionar vendedor: ${response.error.message || 'Erro desconhecido.'}`);
      } else {
        queryClient.invalidateQueries({ queryKey: ['allSellerProfiles'] });
        setIsAddEditDialogOpen(false);
        toast.success('Vendedor adicionado com sucesso!');
      }
    },
    onError: (err: Error) => {
      toast.error(`Falha ao adicionar vendedor: ${err.message}`);
    },
  });

  const updateSellerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewSellerProfileData> }) => 
      updateSellerProfile(id, data),
    onSuccess: (response) => {
      if (response.error) {
        toast.error(`Erro ao atualizar vendedor: ${response.error.message || 'Erro desconhecido.'}`);
      } else {
        queryClient.invalidateQueries({ queryKey: ['allSellerProfiles'] });
        setIsAddEditDialogOpen(false);
        setEditingSeller(null); 
        toast.success('Vendedor atualizado com sucesso!');
      }
    },
    onError: (err: Error) => {
      toast.error(`Falha ao atualizar vendedor: ${err.message}`);
    },
  });

  const deleteSellerMutation = useMutation({
    mutationFn: deleteSellerProfile,
    onSuccess: (response) => {
      if (response.error) {
         toast.error(`Erro ao excluir vendedor: ${response.error.message || 'Erro desconhecido.'}`);
      } else {
        queryClient.invalidateQueries({ queryKey: ['allSellerProfiles'] });
        toast.success('Vendedor excluído com sucesso!');
      }
      setIsDeleteDialogOpen(false);
      setSellerToDelete(null);
    },
    onError: (err: Error) => {
      toast.error(`Falha ao excluir vendedor: ${err.message}`);
      setIsDeleteDialogOpen(false);
      setSellerToDelete(null);
    },
  });

  const handleDialogSubmit = async (formData: SellerFormData) => {
    if (editingSeller) {
      await updateSellerMutation.mutateAsync({ id: editingSeller.id, data: formData });
    } else {
      await addSellerMutation.mutateAsync(formData as NewSellerProfileData);
    }
  };
  
  const handleOpenAddDialog = () => {
    setEditingSeller(null); 
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (seller: SellerProfile) => {
    setEditingSeller(seller);
    setIsAddEditDialogOpen(true);
  };
  
  const handleAddEditDialogClose = (open: boolean) => {
    setIsAddEditDialogOpen(open);
    if (!open) {
      setEditingSeller(null); 
    }
  };

  const handleOpenDeleteDialog = (seller: SellerProfile) => {
    setSellerToDelete(seller);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSeller = () => {
    if (sellerToDelete) {
      deleteSellerMutation.mutate(sellerToDelete.id);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'N/A';
    const names = name.split(' ');
    if (names.length === 0 || !names[0]) return 'N/A'; // Handle empty name string or array
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const getStatusVariant = (status: SellerProfile['status'] | undefined) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'secondary';
    }
  };


  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
              <Users className="mr-3 h-7 w-7 text-emerald-600" />
              Gerenciamento de Vendedores
            </CardTitle>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Vendedor
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]"></TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="animate-pulse">
                    <TableCell><div className="h-10 w-10 rounded-full bg-gray-200"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-3/4"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded w-3/4"></div></TableCell>
                    <TableCell><div className="h-6 bg-gray-200 rounded w-1/2"></div></TableCell>
                    <TableCell className="text-right"><div className="h-8 w-8 bg-gray-200 rounded ml-auto"></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
              <Users className="mr-3 h-7 w-7 text-emerald-600" />
              Gerenciamento de Vendedores
            </CardTitle>
             <CardDescription>Ocorreu um erro ao carregar os dados dos vendedores.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <PageAlertTriangle className="mx-auto h-12 w-12 text-red-500" /> {/* Changed to PageAlertTriangle */}
            <p className="mt-4 text-red-600">
              Erro ao buscar vendedores: {error?.message || "Detalhes do erro não disponíveis."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex"> 
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>
      </div>
      <Card className="shadow-lg border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center">
             <Users className="mr-3 h-8 w-8 text-emerald-700" />
            <div>
                <CardTitle className="text-2xl font-semibold text-gray-800">
                Gerenciamento de Vendedores
                </CardTitle>
                <CardDescription>Adicione, visualize e gerencie os perfis dos vendedores.</CardDescription>
            </div>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all">
            <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Novo Vendedor
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {!isLoading && !isError && sellers && sellers.length === 0 ? (
            <div className="text-center py-10">
              <UserCircle className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-700">Nenhum vendedor cadastrado.</h3>
              <p className="mt-1 text-sm text-gray-500">Clique em 'Adicionar Novo Vendedor' para começar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] sm:w-[80px] p-2"></TableHead>
                  <TableHead className="p-2">Nome</TableHead>
                  <TableHead className="p-2 hidden md:table-cell">Email</TableHead>
                  <TableHead className="p-2">Status</TableHead>
                  <TableHead className="text-right p-2">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellers.map((seller) => (
                  <TableRow key={seller.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="p-2">
                      <Avatar className="h-10 w-10 border-2 border-emerald-100">
                        <AvatarImage src={seller.photo_url || undefined} alt={seller.name} />
                        <AvatarFallback className="bg-emerald-50 text-emerald-600 font-semibold">
                          {getInitials(seller.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium text-gray-800 p-2">{seller.name}</TableCell>
                    <TableCell className="text-gray-600 p-2 hidden md:table-cell">{seller.email}</TableCell>
                    <TableCell className="p-2">
                      <Badge variant={getStatusVariant(seller.status)} className="capitalize">
                        {seller.status || 'Desconhecido'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right p-2">
                      <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                        <MoreHorizontal className="h-5 w-5 text-gray-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerManagementPage;
