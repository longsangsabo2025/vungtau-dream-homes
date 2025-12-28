import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  propertyId?: string;
  existingImages?: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({
  propertyId,
  existingImages = [],
  onImagesChange,
  maxImages = 10
}: ImageUploadProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: 'Chưa đăng nhập',
        description: 'Vui lòng đăng nhập để tải ảnh lên.',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${propertyId || 'temp'}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải ảnh lên. Vui lòng thử lại.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: 'Vượt quá giới hạn',
        description: `Chỉ có thể tải lên tối đa ${maxImages} ảnh`,
        variant: 'destructive'
      });
      return;
    }

    // Validate file types and sizes
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'File không hợp lệ',
          description: `${file.name} không phải là file ảnh`,
          variant: 'destructive'
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: 'File quá lớn',
          description: `${file.name} vượt quá 5MB`,
          variant: 'destructive'
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    const uploadPromises = validFiles.map(file => uploadImage(file));
    const uploadedUrls = await Promise.all(uploadPromises);
    const successfulUrls = uploadedUrls.filter((url): url is string => url !== null);

    if (successfulUrls.length > 0) {
      const newImages = [...images, ...successfulUrls];
      setImages(newImages);
      onImagesChange(newImages);
      
      toast({
        title: 'Thành công',
        description: `Đã tải lên ${successfulUrls.length} ảnh`
      });
    }

    setUploading(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [images.length, maxImages]);

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    
    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'property-images');
    if (bucketIndex !== -1) {
      const filePath = urlParts.slice(bucketIndex + 1).join('/');
      
      // Delete from storage
      await supabase.storage
        .from('property-images')
        .remove([filePath]);
    }

    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Hình ảnh bất động sản *
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Tải lên tối đa {maxImages} ảnh. Định dạng: JPG, PNG. Kích thước tối đa: 5MB/ảnh.
        </p>
      </div>

      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed p-8 text-center cursor-pointer transition-colors',
          dragActive && 'border-primary bg-primary/5',
          uploading && 'pointer-events-none opacity-50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading || images.length >= maxImages}
        />

        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}
          
          <div>
            <p className="text-base font-medium">
              {uploading ? 'Đang tải ảnh lên...' : 'Kéo thả ảnh vào đây hoặc click để chọn'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {images.length}/{maxImages} ảnh
            </p>
          </div>

          {!uploading && images.length < maxImages && (
            <Button type="button" variant="outline" size="sm">
              <ImageIcon className="h-4 w-4 mr-2" />
              Chọn ảnh
            </Button>
          )}
        </div>
      </Card>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <Card key={index} className="relative group overflow-hidden aspect-square">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Xóa
                </Button>
              </div>

              {/* Primary badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                  Ảnh chính
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-sm text-red-500">* Vui lòng tải lên ít nhất 1 ảnh</p>
      )}
    </div>
  );
}
