# 🚀 Hướng dẫn Deploy lên Railway

## Bước 1: Chuẩn bị

1. Đăng ký tài khoản tại [Railway](https://railway.app/)
2. Cài đặt Railway CLI (tùy chọn):
   ```bash
   npm install -g @railway/cli
   railway login
   ```

## Bước 2: Tạo Project trên Railway

### Cách 1: Qua giao diện web (Khuyến nghị)

1. Đăng nhập vào [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Chọn **"Deploy from GitHub repo"**
4. Kết nối và chọn repository của bạn
5. Railway sẽ tự động detect Dockerfile và build

### Cách 2: Qua CLI

```bash
cd server
railway init
railway up
```

## Bước 3: Thêm PostgreSQL Database

1. Trong project Railway, click **"+ New"**
2. Chọn **"Database"** → **"Add PostgreSQL"**
3. Railway sẽ tự động tạo database và cung cấp `DATABASE_URL`

## Bước 4: Cấu hình Environment Variables

Trong Railway Dashboard, vào **Settings** → **Variables**, thêm các biến sau:

### Bắt buộc:
```
PORT=3001
NODE_ENV=production
JWT_SECRET=<your-secure-jwt-secret>
JWT_REFRESH_SECRET=<your-secure-refresh-secret>
```

### Tùy chọn (Super Admin - nếu không set sẽ dùng mặc định):
```
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=YourSecurePassword123!
SUPER_ADMIN_NAME=Administrator
SUPER_ADMIN_PHONE=0123456789
```

### Cloudinary (nếu sử dụng upload ảnh):
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

> ⚠️ **Lưu ý**: `DATABASE_URL` sẽ được Railway tự động inject từ PostgreSQL service. Không cần set thủ công!

## Bước 5: Liên kết Database với App

1. Trong project, click vào service backend của bạn
2. Vào **Variables**
3. Click **"Add Reference"**
4. Chọn PostgreSQL service và chọn `DATABASE_URL`
5. Railway sẽ tự động inject connection string

## Bước 6: Deploy

- Nếu đã kết nối GitHub: Push code lên branch main, Railway sẽ tự động deploy
- Nếu dùng CLI: `railway up`

## 🔑 Thông tin đăng nhập Super Admin mặc định

Nếu không cấu hình biến môi trường, tài khoản Super Admin mặc định sẽ là:

- **Email**: `superadmin@soligant.com`
- **Password**: `SuperAdmin@2024`

> ⚠️ **QUAN TRỌNG**: Hãy đổi mật khẩu ngay sau khi đăng nhập lần đầu hoặc set biến `SUPER_ADMIN_PASSWORD` với mật khẩu mạnh!

## 📋 Kiểm tra Logs

```bash
# Qua CLI
railway logs

# Hoặc xem trực tiếp trên Railway Dashboard → Deployments → View Logs
```

## 🔧 Troubleshooting

### Lỗi kết nối database
- Kiểm tra đã liên kết PostgreSQL với app chưa
- Kiểm tra `DATABASE_URL` đã được inject chưa

### Lỗi migration
- Xem logs để biết chi tiết lỗi
- Có thể cần reset database nếu schema conflict

### App không start
- Kiểm tra PORT đã set là 3001
- Xem logs để biết lỗi cụ thể

## 🌐 Custom Domain (Tùy chọn)

1. Vào **Settings** → **Domains**
2. Click **"+ Custom Domain"**
3. Thêm domain của bạn
4. Cập nhật DNS records theo hướng dẫn

## 📊 Monitoring

Railway cung cấp:
- Metrics về CPU, Memory, Network
- Logs realtime
- Deploy history

---

**Chúc bạn deploy thành công! 🎉**
