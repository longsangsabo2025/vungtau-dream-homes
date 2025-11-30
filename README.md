# 🏡 Vungtau Dream Homes - Website Bất Động Sản Vũng Tàu

Ứng dụng web quản lý và hiển thị bất động sản tại Vũng Tàu được xây dựng với React, TypeScript và Supabase.

## 🚀 QUICK START

```bash
# Option 1: Use quick start script (RECOMMENDED)
.\start-dev.ps1

# Option 2: Manual start
npm run dev
```

**URL:** http://localhost:8080

## ✅ PROJECT STATUS (Nov 22, 2025)

- ✅ **Security**: 0 vulnerabilities
- ✅ **Dependencies**: 584 packages up-to-date
- ✅ **Build**: 2.31s, 806 KB bundle
- ✅ **Tests**: Working with 50% coverage threshold
- ✅ **Production**: READY 🚀

## ✨ Tính năng

- 🏠 **Hiển thị danh sách bất động sản**: Giao diện hiện đại với thông tin chi tiết
- 🔍 **Tìm kiếm và lọc**: Tìm theo tên, địa điểm, loại BDS, trạng thái
- ➕ **Thêm bất động sản mới**: Form đầy đủ với validation
- 📱 **Responsive Design**: Tối ưu cho mọi thiết bị
- ⚡ **Real-time Data**: Kết nối trực tiếp với Supabase
- 🎨 **UI/UX hiện đại**: Sử dụng Shadcn/ui và Tailwind CSS
- 🔐 **Authentication**: Đăng nhập/đăng ký với Supabase Auth
- 👤 **User Dashboard**: Quản lý tin đăng cá nhân
- 🛡️ **Admin Panel**: Quản lý toàn bộ hệ thống

## 🛠 Công nghệ sử dụng

- **Frontend**: React 18, TypeScript, Vite 7
- **UI Framework**: Tailwind CSS, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Monitoring**: Sentry, Google Analytics
- **Testing**: Vitest, Testing Library
- **State Management**: React Hooks, TanStack Query

## 🚀 Cài đặt và chạy

### Bước 1: Cài đặt dependencies

```bash
cd vungtau-dream-homes
npm install
```

### Bước 2: Cấu hình môi trường

1. File `.env` đã được tạo với thông tin Supabase Vungtauland
2. File `.env.example` chứa template cho cấu hình

### Bước 3: Setup Database

Làm theo hướng dẫn trong file `DATABASE_SETUP.md`:

1. Truy cập Supabase Dashboard
2. Chạy script SQL trong `database-setup.sql`
3. Kiểm tra bảng `properties` đã được tạo

### Bước 4: Chạy ứng dụng

```bash
npm run dev
```

Truy cập: <http://localhost:8081>

## 📁 Cấu trúc dự án

```text
src/
├── components/          # React components
│   ├── ui/             # Shadcn/ui components
│   ├── PropertyCard.tsx    # Card hiển thị BDS
│   ├── PropertyList.tsx    # Danh sách BDS
│   ├── AddPropertyDialog.tsx  # Form thêm BDS
│   └── ...
├── hooks/              # Custom React hooks
│   └── useSupabase.ts     # Hooks tương tác DB
├── lib/                # Utilities
│   └── supabase.ts        # Supabase client config
└── pages/              # Page components
```

## 🔧 Tính năng chính

### 1. Hiển thị danh sách BDS

- Grid layout responsive
- Skeleton loading states
- Error handling với retry
- Badge hiển thị loại và trạng thái

### 2. Tìm kiếm và lọc

- Tìm theo tên và địa điểm
- Lọc theo loại BDS
- Lọc theo trạng thái
- Hiển thị số lượng kết quả

### 3. Thêm BDS mới

- Form validation đầy đủ
- Upload ảnh qua URL
- Toast notifications
- Auto-refresh danh sách

## 🌐 Supabase Configuration

**Project**: Vungtauland

- URL: `https://rxjsdoylkflzsxlyccqh.supabase.co`
- Anon Key: Configured in `.env`
- Service Role: Configured (server-side only)

## 🔐 Bảo mật

- Environment variables cho sensitive data
- `.env` được ignore trong git
- RLS policies cho database access
- Input validation và sanitization

---

💡 **Ghi chú**: Ứng dụng đã hoàn thiện và sẵn sàng sử dụng với đầy đủ tính năng CRUD!
