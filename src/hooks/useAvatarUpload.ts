import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook để upload và quản lý avatar người dùng
 */
export function useAvatarUpload() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadAvatar = useCallback(async (file: File): Promise<string | null> => {
    if (!user) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng đăng nhập để thay đổi ảnh đại diện',
        variant: 'destructive'
      });
      return null;
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'File không hợp lệ',
        description: 'Vui lòng chọn file ảnh',
        variant: 'destructive'
      });
      return null;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      toast({
        title: 'File quá lớn',
        description: 'Ảnh đại diện không được vượt quá 2MB',
        variant: 'destructive'
      });
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Delete old avatar if exists
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`);
        await supabase.storage.from('avatars').remove(filesToDelete);
      }

      setProgress(30);

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      setProgress(70);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      await updateProfile({ avatar_url: publicUrl });

      setProgress(100);

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật ảnh đại diện',
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải ảnh lên. Vui lòng thử lại.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [user, updateProfile, toast]);

  const deleteAvatar = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    setUploading(true);

    try {
      // Delete from storage
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`);
        await supabase.storage.from('avatars').remove(filesToDelete);
      }

      // Update profile
      await updateProfile({ avatar_url: null });

      toast({
        title: 'Thành công',
        description: 'Đã xóa ảnh đại diện',
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting avatar:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa ảnh. Vui lòng thử lại.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setUploading(false);
    }
  }, [user, updateProfile, toast]);

  return {
    uploadAvatar,
    deleteAvatar,
    uploading,
    progress
  };
}
