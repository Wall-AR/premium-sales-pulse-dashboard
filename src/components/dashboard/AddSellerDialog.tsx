import React, { useEffect, useState, ChangeEvent } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { NewSellerProfileData, SellerProfile } from '@/lib/supabaseQueries';

// Define getInitials function once
const getInitials = (name: string | undefined): string => {
  if (!name) return 'S'; // Default initials
  const names = name.split(' ');
  if (names.length === 0 || !names[0]) return 'S';
  return names
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

// Define Zod schema constants and schema
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export const sellerSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Endereço de e-mail inválido." }),
  status: z.enum(['active', 'inactive', 'pending'], {
    errorMap: () => ({ message: "Por favor, selecione um status válido." }),
  }),
  photo_file: z.custom<FileList | undefined>()
    .refine((files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE, `O tamanho máximo do arquivo é 2MB.`)
    .refine((files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type), "São aceitos apenas arquivos .jpg, .jpeg, .png, .gif e .webp.")
    .optional(),
});
export type SellerFormData = z.infer<typeof sellerSchema>;

interface AddSellerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmitHandler: (data: SellerFormData) => Promise<void>;
  isSubmitting: boolean;
  editingSeller?: SellerProfile | null;
}

export const AddSellerDialog: React.FC<AddSellerDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmitHandler,
  isSubmitting,
  editingSeller,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SellerFormData>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      name: '',
      email: '',
      status: 'pending',
      photo_file: undefined,
    },
  });

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const watchedPhotoFile = useWatch({ control, name: 'photo_file' });
  const isEditMode = !!editingSeller;

  useEffect(() => {
    if (watchedPhotoFile && watchedPhotoFile.length > 0) {
      const file = watchedPhotoFile[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (!isEditMode || !editingSeller?.photo_url) {
      // Clear preview if no file is selected, unless in edit mode with an existing photo_url
      setImagePreviewUrl(null);
    }
  }, [watchedPhotoFile, isEditMode, editingSeller?.photo_url]);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingSeller) {
        reset({
          name: editingSeller.name,
          email: editingSeller.email,
          status: editingSeller.status,
          photo_file: undefined, // File input cannot be pre-filled for security reasons
        });
        // Set initial preview to existing photo if available
        setImagePreviewUrl(editingSeller.photo_url || null);
      } else {
        reset({
          name: '',
          email: '',
          status: 'pending',
          photo_file: undefined,
        });
        setImagePreviewUrl(null); // Clear preview for new entries
      }
    }
  }, [isOpen, editingSeller, isEditMode, reset]);

  const processSubmit = async (data: SellerFormData) => {
    await onSubmitHandler(data);
    // No need to manually reset here if onOpenChange(false) triggers the useEffect for reset
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form and preview when dialog is closed
      reset({ name: '', email: '', status: 'pending', photo_file: undefined });
      setImagePreviewUrl(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white">
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
        <form onSubmit={handleSubmit(processSubmit)} className="grid gap-6 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border">
              <AvatarImage src={imagePreviewUrl || editingSeller?.photo_url || undefined} alt={editingSeller?.name || "Seller Photo"} />
              <AvatarFallback className="text-lg">
                {getInitials(isEditMode ? editingSeller?.name : '')}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 items-center gap-1.5">
              <Label htmlFor="photo_file">Foto do Vendedor (Opcional)</Label>
              <Input
                id="photo_file"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                {...register('photo_file')}
                className="col-span-3 focus:ring-emerald-500 focus:border-emerald-500 file:text-emerald-700 file:font-semibold"
              />
              {errors.photo_file && <p className="text-xs text-red-600 -mt-0.5">{errors.photo_file.message}</p>}
            </div>
          </div>

          <div className="grid items-center gap-1.5">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" {...register('name')} className="focus:ring-emerald-500 focus:border-emerald-500" />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="grid items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} className="focus:ring-emerald-500 focus:border-emerald-500" />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div className="grid items-center gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={isEditMode ? editingSeller?.status : "pending"}
                >
                  <SelectTrigger id="status" className="focus:ring-emerald-500 focus:border-emerald-500">
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
            {errors.status && <p className="text-xs text-red-600">{errors.status.message}</p>}
          </div>
          
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? (isEditMode ? 'Salvando Alterações...' : 'Adicionando Vendedor...') : (isEditMode ? 'Salvar Alterações' : 'Adicionar Vendedor')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
