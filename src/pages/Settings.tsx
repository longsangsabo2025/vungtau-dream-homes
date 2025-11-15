import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import UserLayout from '../components/UserLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import {
  Bell,
  Mail,
  Shield,
  Moon,
  Globe,
  Eye,
  Lock,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
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
} from '../components/ui/alert-dialog';

interface SettingsData {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    newMessages: boolean;
    propertyUpdates: boolean;
    marketingEmails: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showEmail: boolean;
    showPhone: boolean;
  };
  preferences: {
    language: string;
    theme: string;
    currency: string;
  };
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      push: true,
      sms: false,
      newMessages: true,
      propertyUpdates: true,
      marketingEmails: false,
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showPhone: false,
    },
    preferences: {
      language: 'vi',
      theme: 'light',
      currency: 'VND',
    },
  });

  useEffect(() => {
    // Load settings from localStorage or database
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  function handleNotificationChange(key: keyof SettingsData['notifications'], value: boolean) {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  }

  function handlePrivacyChange(key: keyof SettingsData['privacy'], value: boolean) {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  }

  function handlePreferenceChange(key: keyof SettingsData['preferences'], value: string) {
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
  }

  async function handleSaveSettings() {
    setLoading(true);
    try {
      // Save to localStorage (in production, save to database)
      localStorage.setItem('userSettings', JSON.stringify(settings));

      toast({
        title: 'Thành công!',
        description: 'Cài đặt đã được lưu',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu cài đặt',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount() {
    try {
      // Delete user account
      const { error } = await supabase.auth.admin.deleteUser(user?.id || '');

      if (error) throw error;

      toast({
        title: 'Tài khoản đã bị xóa',
        description: 'Bạn sẽ được chuyển hướng về trang chủ',
      });

      // Sign out and redirect
      setTimeout(() => {
        signOut();
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa tài khoản. Vui lòng liên hệ hỗ trợ.',
        variant: 'destructive',
      });
    }
  }

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cài đặt</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Quản lý tùy chọn và cài đặt tài khoản
            </p>
          </div>

          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Thông báo
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Chọn cách bạn muốn nhận thông báo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Thông báo qua Email
                    </Label>
                    <p className="text-xs text-gray-500">
                      Nhận thông báo quan trọng qua email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Thông báo đẩy</Label>
                    <p className="text-xs text-gray-500">
                      Nhận thông báo trên trình duyệt
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Tin nhắn SMS</Label>
                    <p className="text-xs text-gray-500">
                      Nhận tin nhắn SMS về giao dịch
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.sms}
                    onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                  />
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Tin nhắn mới</Label>
                      <p className="text-xs text-gray-500">
                        Thông báo khi có tin nhắn mới
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.newMessages}
                      onCheckedChange={(checked) => handleNotificationChange('newMessages', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Cập nhật tin đăng</Label>
                      <p className="text-xs text-gray-500">
                        Thông báo về trạng thái tin đăng
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.propertyUpdates}
                      onCheckedChange={(checked) =>
                        handleNotificationChange('propertyUpdates', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Email Marketing</Label>
                      <p className="text-xs text-gray-500">
                        Nhận tin tức và ưu đãi
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.marketingEmails}
                      onCheckedChange={(checked) =>
                        handleNotificationChange('marketingEmails', checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Quyền riêng tư
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Kiểm soát thông tin hiển thị công khai
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Hiển thị hồ sơ công khai
                    </Label>
                    <p className="text-xs text-gray-500">
                      Cho phép người khác xem hồ sơ của bạn
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.profileVisible}
                    onCheckedChange={(checked) => handlePrivacyChange('profileVisible', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Hiển thị Email</Label>
                    <p className="text-xs text-gray-500">
                      Cho phép người khác xem email
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.showEmail}
                    onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Hiển thị SĐT</Label>
                    <p className="text-xs text-gray-500">
                      Cho phép người khác xem số điện thoại
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.showPhone}
                    onCheckedChange={(checked) => handlePrivacyChange('showPhone', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Tùy chọn hiển thị
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Cài đặt ngôn ngữ, giao diện và đơn vị tiền tệ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Ngôn ngữ</Label>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(value) => handlePreferenceChange('language', value)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Giao diện
                  </Label>
                  <Select
                    value={settings.preferences.theme}
                    onValueChange={(value) => handlePreferenceChange('theme', value)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Sáng</SelectItem>
                      <SelectItem value="dark">Tối</SelectItem>
                      <SelectItem value="auto">Tự động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Đơn vị tiền tệ</Label>
                  <Select
                    value={settings.preferences.currency}
                    onValueChange={(value) => handlePreferenceChange('currency', value)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VNĐ (₫)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Security & Account */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-red-600">
                  <Lock className="h-5 w-5" />
                  Bảo mật & Tài khoản
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Quản lý mật khẩu và xóa tài khoản
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Lock className="h-4 w-4" />
                  Đổi mật khẩu
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full justify-start gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa tài khoản
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Xóa tài khoản vĩnh viễn?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa
                        vĩnh viễn, bao gồm:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Tất cả tin đăng bất động sản</li>
                          <li>Danh sách yêu thích</li>
                          <li>Lịch sử giao dịch</li>
                          <li>Tin nhắn và thông báo</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Xác nhận xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex gap-3 sm:gap-4">
              <Button
                size="lg"
                onClick={handleSaveSettings}
                disabled={loading}
                className="flex-1 text-sm sm:text-base"
              >
                {loading ? 'Đang lưu...' : 'Lưu tất cả cài đặt'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
