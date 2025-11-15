# Hướng dẫn cấu hình Domain vungtauland.store cho Vercel

## Bước 1: Cấu hình DNS Records

Đăng nhập vào nơi bạn mua domain (GoDaddy, Namecheap, Cloudflare, v.v.) và thêm các DNS records sau:

### A Record (cho root domain)
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 14400 (hoặc 3600 cũng được)
```

### CNAME Record (cho www)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 14400 (hoặc 3600 cũng được)
```

## Bước 2: Thêm Domain vào Vercel Dashboard

1. Vào: https://vercel.com/dsmhs-projects/vungtauland/settings/domains
2. Nhập: `vungtauland.store`
3. Click "Add"
4. Vercel sẽ verify DNS records

## Bước 3: Thiết lập Redirect (Optional)

Để redirect www.vungtauland.store → vungtauland.store:
- Trong Vercel dashboard, chọn domain www.vungtauland.store
- Set redirect to vungtauland.store

## Thời gian áp dụng

- DNS propagation: 5-60 phút
- SSL certificate: Tự động được Vercel cấp sau khi DNS verified

## Kiểm tra DNS

Sau khi cấu hình, chạy lệnh:
```bash
nslookup vungtauland.store
```

Kết quả mong đợi: 76.76.21.21
