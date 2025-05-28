import React from 'react';
import React, { useEffect, useState } from 'react'; 
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local getInitials or import from utils
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Assuming getInitials is moved to a utils file or defined locally for fallback
// For simplicity, I'll define a local one if not available globally.
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Assuming getInitials is moved to a utils file or defined locally for fallback
// For simplicity, I'll define a local one if not available globally.
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Assuming getInitials is moved to a utils file or defined locally for fallback
// For simplicity, I'll define a local one if not available globally.
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Assuming getInitials is moved to a utils file or defined locally for fallback
// For simplicity, I'll define a local one if not available globally.
const localGetInitials = (name: string | undefined) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Assuming getInitials is moved to a utils file or defined locally for fallback
// For simplicity, I'll define a local one if not available globally.
const localGetInitials = (name: string) => {
  if (!name) return 'S';
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names.map(n => n[0]).join('').substring(0,2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For preview
import { getInitials } from "@/lib/utils"; // Assuming getInitials is moved to a utils file or defined locally
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NewSellerProfileData, SellerProfile } from '@/lib/supabaseQueries'; // Added SellerProfile

// Define the Zod schema for form validation
export const sellerSchema = z.object({ // Exporting for use in parent if needed for type consistency
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  status: z.enum(['active', 'inactive', 'pending'], {
    errorMap: () => ({ message: "Please select a valid status." }),
  }),
  photo_url: z.string().url({ message: "Invalid URL format for photo." }).optional().or(z.literal('')), // Optional and can be empty string
});

export type SellerFormData = z.infer<typeof sellerSchema>;

interface AddSellerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmitHandler: (data: SellerFormData) => Promise<void>; // Changed to SellerFormData for direct use
  isSubmitting: boolean;
  editingSeller?: SellerProfile | null; // New prop for editing
}

export const AddSellerDialog: React.FC<AddSellerDialogProps> = ({ 
  isOpen, 
  onOpenChange, 
  onSubmitHandler, 
  isSubmitting, 
  editingSeller 
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue, // Added setValue for more granular control if needed
    formState: { errors },
  } = useForm<SellerFormData>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      name: '',
      email: '',
      status: 'pending',
      photo_url: '',
    },
  });

  const isEditMode = !!editingSeller;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingSeller) {
        reset({
          name: editingSeller.name,
          email: editingSeller.email,
          status: editingSeller.status,
          photo_url: editingSeller.photo_url || '', // Ensure empty string if null
        });
      } else {
        // Reset to default for "add new" mode or if editingSeller is null
        reset({
          name: '',
          email: '',
          status: 'pending',
          photo_url: '',
        });
      }
    }
  }, [isOpen, editingSeller, isEditMode, reset]);


  const processSubmit = async (data: SellerFormData) => {
    await onSubmitHandler(data);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) { // Reset form when dialog is explicitly closed
        reset({ name: '', email: '', status: 'pending', photo_url: '' });
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-emerald-700">
            {isEditMode ? 'Editar Vendedor' : 'Adicionar Novo Vendedor'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Atualize os detalhes do vendedor abaixo.' 
              : 'Preencha os detalhes abaixo para cadastrar um novo vendedor.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(processSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input id="name" {...register('name')} className="col-span-3 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          {errors.name && <p className="col-span-4 text-xs text-red-600 text-right -mt-2">{errors.name.message}</p>}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" type="email" {...register('email')} className="col-span-3 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          {errors.email && <p className="col-span-4 text-xs text-red-600 text-right -mt-2">{errors.email.message}</p>}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value} // Use value from controller
                  defaultValue={isEditMode ? editingSeller?.status : "pending"}
                >
                  <SelectTrigger id="status" className="col-span-3 focus:ring-emerald-500 focus:border-emerald-500">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
           {errors.status && <p className="col-span-4 text-xs text-red-600 text-right -mt-2">{errors.status.message}</p>}


          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="photo_url" className="text-right">
              URL da Foto
            </Label>
            <Input id="photo_url" {...register('photo_url')} placeholder="https://example.com/photo.jpg" className="col-span-3 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          {errors.photo_url && <p className="col-span-4 text-xs text-red-600 text-right -mt-2">{errors.photo_url.message}</p>}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Vendedor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
