# 📧 Hướng dẫn Setup Email Templates cho Supabase

## 🎨 Email Templates đã tạo

| Template | File | Màu chủ đạo | Mục đích |
|----------|------|-------------|----------|
| Xác nhận đăng ký | `confirm-signup.html` | 🔵 Ocean Blue | Xác nhận email khi đăng ký |
| Đặt lại mật khẩu | `reset-password.html` | 🟠 Amber | Reset password |
| Magic Link | `magic-link.html` | 🟣 Purple | Đăng nhập không cần password |
| Mời tham gia | `invite-user.html` | 🟢 Green | Mời user mới |

## 🚀 Cách Setup trên Supabase Dashboard

### Bước 1: Truy cập Supabase Dashboard
1. Mở https://supabase.com/dashboard
2. Chọn project `rxjsdoylkflzsxlyccqh`

### Bước 2: Vào Authentication Settings
1. Click **Authentication** ở sidebar trái
2. Click **Email Templates** tab

### Bước 3: Copy & Paste Templates

#### 📬 Confirm Signup
1. Chọn template "Confirm Signup"
2. Copy toàn bộ nội dung file `confirm-signup.html`
3. Paste vào ô "Message body"
4. Subject: `🏠 Xác nhận email - Chào mừng đến VungTauLand!`

#### 🔐 Reset Password
1. Chọn template "Reset Password"
2. Copy toàn bộ nội dung file `reset-password.html`
3. Paste vào ô "Message body"
4. Subject: `🔐 Đặt lại mật khẩu - VungTauLand`

#### ✨ Magic Link
1. Chọn template "Magic Link"
2. Copy toàn bộ nội dung file `magic-link.html`
3. Paste vào ô "Message body"
4. Subject: `✨ Đăng nhập nhanh - VungTauLand`

#### 🎁 Invite User
1. Chọn template "Invite User"
2. Copy toàn bộ nội dung file `invite-user.html`
3. Paste vào ô "Message body"
4. Subject: `🎁 Bạn được mời tham gia VungTauLand!`

### Bước 4: Save Changes
Click **Save** sau mỗi template.

## 🎨 Logo Files

| File | Kích thước | Mục đích |
|------|------------|----------|
| `public/logo.svg` | 200x60 | Logo full với text |
| `public/logo-icon.svg` | 60x60 | Icon only |

## 📝 Template Variables (Supabase)

Các biến có thể sử dụng trong template:

| Variable | Mô tả |
|----------|-------|
| `{{ .ConfirmationURL }}` | Link xác nhận |
| `{{ .Email }}` | Email người dùng |
| `{{ .Token }}` | Token xác nhận |
| `{{ .TokenHash }}` | Hash của token |
| `{{ .SiteURL }}` | URL website |

## ✅ Checklist

- [ ] Setup Confirm Signup template
- [ ] Setup Reset Password template
- [ ] Setup Magic Link template
- [ ] Setup Invite User template
- [ ] Test gửi email thử
- [ ] Kiểm tra email trên mobile

## 🔧 Custom SMTP (Tùy chọn)

Nếu muốn dùng SMTP riêng (Gmail, SendGrid, etc):

1. Vào **Project Settings** → **Auth**
2. Scroll xuống **SMTP Settings**
3. Enable "Custom SMTP"
4. Điền thông tin:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: your-email@gmail.com
   - Password: App password (không phải password thường)

## 📱 Test Email

Sau khi setup xong, test bằng cách:
1. Đăng ký tài khoản mới
2. Kiểm tra email
3. Xác nhận link hoạt động
4. Kiểm tra hiển thị trên mobile

---

**VungTauLand** - Bất Động Sản #1 Vũng Tàu 🏠
