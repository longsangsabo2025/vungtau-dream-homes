import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Settings as SettingsIcon,
  Mail,
  Globe,
  Database,
  Shield,
  Bell,
  Palette,
  FileText,
} from 'lucide-react';

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Site Settings
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'Vũng Tàu Dream Homes',
    siteDescription: 'Nền tảng bất động sản hàng đầu Vũng Tàu',
    contactEmail: 'contact@vungtauland.store',
    contactPhone: '0901234567',
    address: 'Vũng Tàu, Bà Rịa - Vũng Tàu',
    facebookUrl: 'https://facebook.com/vungtauland',
    zaloUrl: '',
    allowRegistration: true,
    requireEmailVerification: false,
    maintenanceMode: false,
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@vungtauland.store',
    fromName: 'Vũng Tàu Dream Homes',
  });

  // Property Settings
  const [propertySettings, setPropertySettings] = useState({
    autoApproval: false,
    maxImages: 20,
    maxVideos: 5,
    defaultListingDays: 90,
    featuredPrice: 500000,
    requireAgentApproval: true,
  });

  // SEO Settings
  const [seoSettings, setSeoSettings] = useState({
    metaTitle: 'Vũng Tàu Dream Homes - Bất động sản Vũng Tàu',
    metaDescription: 'Tìm kiếm và đầu tư bất động sản tại Vũng Tàu với giá tốt nhất',
    metaKeywords: 'bất động sản vũng tàu, nhà đất vũng tàu, mua bán nhà',
    googleAnalyticsId: '',
    facebookPixelId: '',
  });

  async function handleSaveSiteSettings() {
    try {
      setLoading(true);
      // Mock save - trong thực tế sẽ save vào database
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: 'Thành công!',
        description: 'Đã lưu cài đặt website',
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

  async function handleSaveEmailSettings() {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: 'Thành công!',
        description: 'Đã lưu cài đặt email',
      });
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu cài đặt email',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePropertySettings() {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: 'Thành công!',
        description: 'Đã lưu cài đặt tin đăng',
      });
    } catch (error) {
      console.error('Error saving property settings:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu cài đặt',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSeoSettings() {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: 'Thành công!',
        description: 'Đã lưu cài đặt SEO',
      });
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu cài đặt SEO',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Cài đặt hệ thống
            </h1>
            <p className="text-gray-600">Quản lý cấu hình và tùy chọn hệ thống</p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="general" className="gap-2">
                <SettingsIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Chung</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Email</span>
              </TabsTrigger>
              <TabsTrigger value="property" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Tin đăng</span>
              </TabsTrigger>
              <TabsTrigger value="seo" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">SEO</span>
              </TabsTrigger>
              <TabsTrigger value="backup" className="gap-2">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Backup</span>
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin Website</CardTitle>
                    <CardDescription>
                      Cấu hình thông tin cơ bản của website
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="siteName">Tên website</Label>
                      <Input
                        id="siteName"
                        value={siteSettings.siteName}
                        onChange={(e) =>
                          setSiteSettings({ ...siteSettings, siteName: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="siteDescription">Mô tả</Label>
                      <Textarea
                        id="siteDescription"
                        value={siteSettings.siteDescription}
                        onChange={(e) =>
                          setSiteSettings({
                            ...siteSettings,
                            siteDescription: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactEmail">Email liên hệ</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={siteSettings.contactEmail}
                          onChange={(e) =>
                            setSiteSettings({
                              ...siteSettings,
                              contactEmail: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="contactPhone">Số điện thoại</Label>
                        <Input
                          id="contactPhone"
                          value={siteSettings.contactPhone}
                          onChange={(e) =>
                            setSiteSettings({
                              ...siteSettings,
                              contactPhone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input
                        id="address"
                        value={siteSettings.address}
                        onChange={(e) =>
                          setSiteSettings({ ...siteSettings, address: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="facebookUrl">Facebook URL</Label>
                        <Input
                          id="facebookUrl"
                          value={siteSettings.facebookUrl}
                          onChange={(e) =>
                            setSiteSettings({
                              ...siteSettings,
                              facebookUrl: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="zaloUrl">Zalo URL</Label>
                        <Input
                          id="zaloUrl"
                          value={siteSettings.zaloUrl}
                          onChange={(e) =>
                            setSiteSettings({ ...siteSettings, zaloUrl: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cài đặt tài khoản</CardTitle>
                    <CardDescription>
                      Quản lý đăng ký và xác thực người dùng
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Cho phép đăng ký</Label>
                        <p className="text-sm text-gray-500">
                          Người dùng có thể tự đăng ký tài khoản mới
                        </p>
                      </div>
                      <Switch
                        checked={siteSettings.allowRegistration}
                        onCheckedChange={(checked) =>
                          setSiteSettings({
                            ...siteSettings,
                            allowRegistration: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Xác thực email</Label>
                        <p className="text-sm text-gray-500">
                          Yêu cầu xác thực email khi đăng ký
                        </p>
                      </div>
                      <Switch
                        checked={siteSettings.requireEmailVerification}
                        onCheckedChange={(checked) =>
                          setSiteSettings({
                            ...siteSettings,
                            requireEmailVerification: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Chế độ bảo trì</Label>
                        <p className="text-sm text-gray-500">
                          Tạm thời đóng website để bảo trì
                        </p>
                      </div>
                      <Switch
                        checked={siteSettings.maintenanceMode}
                        onCheckedChange={(checked) =>
                          setSiteSettings({
                            ...siteSettings,
                            maintenanceMode: checked,
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={handleSaveSiteSettings} disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
                </Button>
              </div>
            </TabsContent>

            {/* Email Settings */}
            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle>Cấu hình Email</CardTitle>
                  <CardDescription>
                    Thiết lập SMTP để gửi email tự động
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={emailSettings.smtpHost}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, smtpHost: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        value={emailSettings.smtpPort}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, smtpPort: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      value={emailSettings.smtpUser}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, smtpUser: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) =>
                        setEmailSettings({
                          ...emailSettings,
                          smtpPassword: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={emailSettings.fromEmail}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            fromEmail: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="fromName">From Name</Label>
                      <Input
                        id="fromName"
                        value={emailSettings.fromName}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, fromName: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveEmailSettings} disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu cài đặt email'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Property Settings */}
            <TabsContent value="property">
              <Card>
                <CardHeader>
                  <CardTitle>Cài đặt tin đăng</CardTitle>
                  <CardDescription>
                    Quản lý quy tắc và giới hạn tin đăng
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Tự động duyệt tin</Label>
                      <p className="text-sm text-gray-500">
                        Tin đăng được tự động phê duyệt khi đăng
                      </p>
                    </div>
                    <Switch
                      checked={propertySettings.autoApproval}
                      onCheckedChange={(checked) =>
                        setPropertySettings({
                          ...propertySettings,
                          autoApproval: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Yêu cầu duyệt agent</Label>
                      <p className="text-sm text-gray-500">
                        Chỉ agent được duyệt mới đăng tin
                      </p>
                    </div>
                    <Switch
                      checked={propertySettings.requireAgentApproval}
                      onCheckedChange={(checked) =>
                        setPropertySettings({
                          ...propertySettings,
                          requireAgentApproval: checked,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="maxImages">Số ảnh tối đa</Label>
                      <Input
                        id="maxImages"
                        type="number"
                        value={propertySettings.maxImages}
                        onChange={(e) =>
                          setPropertySettings({
                            ...propertySettings,
                            maxImages: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="maxVideos">Số video tối đa</Label>
                      <Input
                        id="maxVideos"
                        type="number"
                        value={propertySettings.maxVideos}
                        onChange={(e) =>
                          setPropertySettings({
                            ...propertySettings,
                            maxVideos: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="defaultListingDays">Thời hạn đăng (ngày)</Label>
                      <Input
                        id="defaultListingDays"
                        type="number"
                        value={propertySettings.defaultListingDays}
                        onChange={(e) =>
                          setPropertySettings({
                            ...propertySettings,
                            defaultListingDays: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="featuredPrice">Giá tin nổi bật (VNĐ)</Label>
                    <Input
                      id="featuredPrice"
                      type="number"
                      value={propertySettings.featuredPrice}
                      onChange={(e) =>
                        setPropertySettings({
                          ...propertySettings,
                          featuredPrice: Number.parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <Button onClick={handleSavePropertySettings} disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu cài đặt tin đăng'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Settings */}
            <TabsContent value="seo">
              <Card>
                <CardHeader>
                  <CardTitle>Cài đặt SEO</CardTitle>
                  <CardDescription>
                    Tối ưu hóa công cụ tìm kiếm và phân tích
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={seoSettings.metaTitle}
                      onChange={(e) =>
                        setSeoSettings({ ...seoSettings, metaTitle: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={seoSettings.metaDescription}
                      onChange={(e) =>
                        setSeoSettings({
                          ...seoSettings,
                          metaDescription: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="metaKeywords">Meta Keywords</Label>
                    <Input
                      id="metaKeywords"
                      value={seoSettings.metaKeywords}
                      onChange={(e) =>
                        setSeoSettings({ ...seoSettings, metaKeywords: e.target.value })
                      }
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                      <Input
                        id="googleAnalyticsId"
                        value={seoSettings.googleAnalyticsId}
                        onChange={(e) =>
                          setSeoSettings({
                            ...seoSettings,
                            googleAnalyticsId: e.target.value,
                          })
                        }
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>

                    <div>
                      <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                      <Input
                        id="facebookPixelId"
                        value={seoSettings.facebookPixelId}
                        onChange={(e) =>
                          setSeoSettings({
                            ...seoSettings,
                            facebookPixelId: e.target.value,
                          })
                        }
                        placeholder="123456789012345"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveSeoSettings} disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu cài đặt SEO'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Backup Settings */}
            <TabsContent value="backup">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sao lưu dữ liệu</CardTitle>
                    <CardDescription>
                      Quản lý backup và phục hồi dữ liệu hệ thống
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Backup database</p>
                        <p className="text-sm text-gray-500">
                          Tạo bản sao lưu toàn bộ database
                        </p>
                      </div>
                      <Button variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        Backup ngay
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Tự động backup</p>
                        <p className="text-sm text-gray-500">
                          Lên lịch backup tự động hàng ngày
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Phục hồi từ backup</p>
                        <p className="text-sm text-gray-500">
                          Khôi phục dữ liệu từ file backup
                        </p>
                      </div>
                      <Button variant="outline">
                        <Shield className="h-4 w-4 mr-2" />
                        Phục hồi
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Lịch sử backup</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Database className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-sm">
                              backup_15_11_2025.sql
                            </p>
                            <p className="text-xs text-gray-500">
                              15/11/2025 - 08:00 AM - 125 MB
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          Tải xuống
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Database className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-sm">
                              backup_14_11_2025.sql
                            </p>
                            <p className="text-xs text-gray-500">
                              14/11/2025 - 08:00 AM - 123 MB
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          Tải xuống
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Database className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-sm">
                              backup_13_11_2025.sql
                            </p>
                            <p className="text-xs text-gray-500">
                              13/11/2025 - 08:00 AM - 121 MB
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          Tải xuống
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}
