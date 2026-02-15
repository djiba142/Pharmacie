import { supabase } from '@/integrations/supabase/client';

/**
 * Upload an avatar image to Supabase Storage
 * @param userId - The user's ID
 * @param file - The image file to upload
 * @returns The public URL of the uploaded image
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
        throw new Error('L\'image ne doit pas dépasser 2 MB');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
        });

    if (uploadError) {
        throw new Error(`Erreur d'upload: ${uploadError.message}`);
    }

    // Get public URL
    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    return data.publicUrl;
}

/**
 * Delete an avatar from Supabase Storage
 * @param avatarUrl - The URL of the avatar to delete
 */
export async function deleteAvatar(avatarUrl: string): Promise<void> {
    if (!avatarUrl) return;

    // Extract file path from URL
    const urlParts = avatarUrl.split('/avatars/');
    if (urlParts.length < 2) return;

    const filePath = `avatars/${urlParts[1]}`;

    const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

    if (error) {
        console.error('Error deleting avatar:', error);
    }
}

/**
 * Update user profile with new avatar URL
 * @param userId - The user's ID
 * @param avatarUrl - The new avatar URL
 */
export async function updateProfileAvatar(userId: string, avatarUrl: string): Promise<void> {
    const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', userId);

    if (error) {
        throw new Error(`Erreur de mise à jour du profil: ${error.message}`);
    }
}
