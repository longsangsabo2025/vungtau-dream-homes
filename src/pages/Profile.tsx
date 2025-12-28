import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import UserLayout from '../components/UserLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useToast } from '../hooks/use-toast';
import { User, Mail, Phone, MapPin, Building, Calendar, Upload, Loader2, Trash2 } from 'lucide-react';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    avatar_url: '',
    created_at: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        // If profile exists, use it; otherwise use user metadata
        if (data) {
          setProfileData({
            full_name: data.full_name || '',
            email: user.email || '',
            phone: data.phone || '',
            address: data.address || '',
            bio: data.bio || '',
            avatar_url: data.avatar_url || '',
            created_at: data.created_at || '',
          });
        } else {
          // No profile yet - use default data from user
          setProfileData({
            full_name: user.user_metadata?.full_name || '',
            email: user.email || '',
            phone: user.user_metadata?.phone || '',
            address: '',
            bio: '',
            avatar_url: user.user_metadata?.avatar_url || '',
            created_at: user.created_at || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Don't show error toast for missing profile - it's normal for new users
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user, toast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.full_name,
          phone: profileData.phone,
          address: profileData.address,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Thành công!',
        description: 'Thông tin tài khoản đã được cập nhật',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật thông tin',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  // Avatar upload handler
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'File không hợp lệ',
        description: 'Vui lòng chọn file ảnh (JPG, PNG, GIF)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File quá lớn',
        description: 'Ảnh đại diện không được vượt quá 2MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Delete old avatar files if exist
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`);
        await supabase.storage.from('avatars').remove(filesToDelete);
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      // Update local state
      setProfileData(prev => ({ ...prev, avatar_url: publicUrl }));

      toast({
        title: 'Thành công!',
        description: 'Đã cập nhật ảnh đại diện',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải ảnh lên. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  // Delete avatar handler
  async function handleDeleteAvatar() {
    if (!user || !profileData.avatar_url) return;

    setUploadingAvatar(true);

    try {
      // Delete from storage
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`);
        await supabase.storage.from('avatars').remove(filesToDelete);
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: null,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      // Update local state
      setProfileData(prev => ({ ...prev, avatar_url: '' }));

      toast({
        title: 'Thành công!',
        description: 'Đã xóa ảnh đại diện',
      });
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa ảnh. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
    }
  }

  function handleChange(field: keyof ProfileData, value: string) {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCancel() {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          email: user.email || '',
          phone: data.phone || '',
          address: data.address || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          created_at: data.created_at || '',
        });
      }
    } catch (error) {
      console.error('Error reloading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <UserLayout>
        <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
            <p className="text-sm sm:text-base">Đang tải...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tài khoản</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Quản lý thông tin cá nhân của bạn
            </p>
          </div>

          <div className="space-y-6">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Ảnh đại diện</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Cập nhật ảnh đại diện của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profileData.avatar_url} alt={profileData.full_name} />
                      <AvatarFallback className="text-2xl">
                        {profileData.full_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {uploadingAvatar && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm text-gray-600 mb-3">
                      JPG, PNG hoặc WebP. Kích thước tối đa 2MB
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        id="avatar-upload"
                        disabled={uploadingAvatar}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Tải ảnh lên
                      </Button>
                      {profileData.avatar_url && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          onClick={handleDeleteAvatar}
                          disabled={uploadingAvatar}
                        >
                          <Trash2 className="h-4 w-4" />
                          Xóa ảnh
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Thông tin cá nhân</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Cập nhật thông tin chi tiết về bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <Label htmlFor="full_name" className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Họ và tên *
                    </Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="text-sm"
                      required
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <Label htmlFor="email" className="text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="text-sm bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email không thể thay đổi
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone" className="text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Số điện thoại
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="0901234567"
                      className="text-sm"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <Label htmlFor="address" className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Địa chỉ
                    </Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      className="text-sm"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <Label htmlFor="bio" className="text-sm flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Giới thiệu bản thân
                    </Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => handleChange('bio', e.target.value)}
                      placeholder="Viết vài dòng giới thiệu về bản thân..."
                      rows={4}
                      className="text-sm"
                    />
                  </div>

                  {/* Account Info */}
                  {profileData.created_at && (
                    <div className="pt-4 border-t">
                      <Label className="text-sm flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        Thành viên từ:{' '}
                        <span className="font-semibold text-gray-900">
                          {new Date(profileData.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </Label>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={saving}
                      className="flex-1 text-sm sm:text-base"
                    >
                      {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleCancel}
                      className="flex-1 text-sm sm:text-base"
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
