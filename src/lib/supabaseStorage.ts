import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid'; // For generating unique filenames

const SELLER_AVATARS_BUCKET = 'seller-avatars'; // Define bucket name

/**
 * Uploads a seller's photo to Supabase Storage.
 * @param file The image file to upload.
 * @param sellerId The ID of the seller, used to create a unique path.
 * @returns An object containing the public URL of the uploaded file or an error.
 */
export const uploadSellerPhoto = async (
  file: File,
  sellerId: string
): Promise<{ publicUrl: string | null; error: any }> => {
  if (!file || !sellerId) {
    return { publicUrl: null, error: new Error('File and sellerId are required.') };
  }

  const fileExtension = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const filePath = `${sellerId}/${fileName}`; // Store in a 'public' folder within bucket for easier public access setup

  const { error: uploadError } = await supabase.storage
    .from(SELLER_AVATARS_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600', // Cache for 1 hour
      upsert: true, // Overwrite if file with same path exists (useful for retries or if not using UUID filenames)
    });

  if (uploadError) {
    console.error('Error uploading seller photo:', uploadError);
    return { publicUrl: null, error: uploadError };
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(SELLER_AVATARS_BUCKET)
    .getPublicUrl(filePath);

  if (!urlData || !urlData.publicUrl) {
    console.error('Error getting public URL for seller photo:', filePath);
    // This case might happen if the file uploaded but URL retrieval failed, though unlikely.
    // Or if RLS policies prevent access, even if just to get the URL structure.
    return { publicUrl: null, error: new Error('File uploaded but failed to retrieve public URL.') };
  }

  return { publicUrl: urlData.publicUrl, error: null };
};

/**
 * Deletes a seller's photo from Supabase Storage.
 * @param photoUrl The full public URL of the photo to delete.
 * @returns An object containing an error if one occurred.
 */
export const deleteSellerPhoto = async (
  photoUrl: string
): Promise<{ error: any }> => {
  if (!photoUrl) {
    return { error: new Error('Photo URL is required to delete.') };
  }

  try {
    // Extract the file path from the full URL
    // Example URL: https://<project_ref>.supabase.co/storage/v1/object/public/seller-avatars/public/seller_id/filename.jpg
    // The path part is "public/seller_id/filename.jpg"
    const url = new URL(photoUrl);
    const pathSegments = url.pathname.split('/');
    // Find the segment "seller-avatars" and take everything after it.
    const bucketNameIndex = pathSegments.findIndex(segment => segment === SELLER_AVATARS_BUCKET);
    if (bucketNameIndex === -1 || bucketNameIndex + 1 >= pathSegments.length) {
        console.error('Invalid photo URL format, cannot extract path:', photoUrl);
        return { error: new Error('Invalid photo URL format.') };
    }
    const filePath = pathSegments.slice(bucketNameIndex + 1).join('/');


    if (!filePath) {
      console.error('Could not extract file path from URL:', photoUrl);
      return { error: new Error('Could not extract file path from URL.') };
    }

    console.log(`Attempting to delete file at path: ${filePath} from bucket ${SELLER_AVATARS_BUCKET}`);

    const { error } = await supabase.storage
      .from(SELLER_AVATARS_BUCKET)
      .remove([filePath]); // remove expects an array of paths

    if (error) {
      console.error('Error deleting seller photo:', error);
      return { error };
    }

    return { error: null };
  } catch (e) {
    console.error('Error parsing photo URL for deletion:', e);
    return { error: new Error('Failed to parse photo URL for deletion.') };
  }
};
