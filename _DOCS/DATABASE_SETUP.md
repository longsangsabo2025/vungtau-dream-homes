# Hướng dẫn Setup Database cho Vungtau Dream Homes

## Bước 1: Truy cập Supabase Dashboard

1. Truy cập [https://rxjsdoylkflzsxlyccqh.supabase.co](https://rxjsdoylkflzsxlyccqh.supabase.co)
2. Đăng nhập với tài khoản Supabase của bạn

## Bước 2: Tạo bảng và dữ liệu

1. Trong Supabase Dashboard, chọn tab **SQL Editor**
2. Tạo một query mới
3. Copy toàn bộ nội dung trong file `database-setup.sql` và paste vào SQL Editor
4. Chạy query bằng cách nhấn nút **Run**

## Bước 3: Kiểm tra kết quả

1. Chuyển sang tab **Table Editor**
2. Bạn sẽ thấy bảng `properties` đã được tạo với 10 bản ghi mẫu
3. Kiểm tra các policy RLS đã được tạo trong tab **Authentication** > **Policies**

## Bước 4: Chạy ứng dụng

1. Trong VS Code, mở terminal và chạy:
   ```bash
   npm run dev
   ```
2. Truy cập http://localhost:5173
3. Bạn sẽ thấy danh sách bất động sản được tải từ Supabase

## Cấu trúc bảng Properties

| Cột | Kiểu dữ liệu | Mô tả |
|-----|--------------|-------|
| id | UUID | Khóa chính, tự động tạo |
| title | VARCHAR | Tiêu đề bất động sản |
| price | BIGINT | Giá bán (VNĐ) |
| location | VARCHAR | Địa chỉ |
| bedrooms | INTEGER | Số phòng ngủ |
| bathrooms | INTEGER | Số phòng tắm |
| area | INTEGER | Diện tích (m²) |
| image_url | VARCHAR | Link ảnh |
| description | TEXT | Mô tả chi tiết |
| type | VARCHAR | Loại BDS (Villa, Căn hộ, v.v.) |
| status | VARCHAR | Trạng thái (Có sẵn, Hot, Nổi bật) |
| created_at | TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | Thời gian cập nhật |

## Row Level Security (RLS)

Đã cấu hình các policy sau:
- **Public Read**: Cho phép tất cả người dùng đọc dữ liệu
- **Authenticated Insert/Update/Delete**: Chỉ người dùng đã xác thực mới có thể thêm/sửa/xóa

## Troubleshooting

### Lỗi kết nối Supabase
- Kiểm tra URL và API key trong file `.env`
- Đảm bảo project Supabase đang hoạt động

### Không hiển thị dữ liệu
- Kiểm tra RLS policies đã được cấu hình đúng
- Xem Network tab trong Developer Tools để kiểm tra API calls

### Lỗi CORS
- Trong Supabase Dashboard, vào Settings > API
- Thêm `http://localhost:5173` vào danh sách allowed origins