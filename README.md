# 🧺 Cleanzy App

**Cleanzy** là ứng dụng đặt dịch vụ giặt ủi chuyên nghiệp, giúp người dùng dễ dàng đặt lịch và quản lý các dịch vụ dọn dẹp nhà cửa, văn phòng,...

## Demo giao diện
Giao diện Mobile


<img width="360" height="800" alt="06 1_Login1" src="https://github.com/user-attachments/assets/43a82378-5c68-4fe7-bca1-53e5d52ba5bf" />
<img width="360" height="800" alt="06 3_Home_1" src="https://github.com/user-attachments/assets/30896a19-6a69-4a19-8c60-77c29c022365" />



Giao diện Web
<img width="2711" height="1605" alt="image" src="https://github.com/user-attachments/assets/3c87cbcc-5bb3-40a0-9932-020895b6ebdd" />
<img width="2733" height="1538" alt="image" src="https://github.com/user-attachments/assets/720a5ce8-b5e5-45a8-9e67-95d6e95d0a51" />

## Kiến trúc dự án

Đây là một mono-repo chứa 2 phần chính:

- **Mobile (React Native)** — Ứng dụng di động cho iOS và Android
- **Backend (Django)** — API server và hệ thống ERP quản lý

```
cleanzy_app/
├── mobile/          # Ứng dụng React Native
├── erp/
│   ├── backend/     # Django REST API
│   └── business/    # Nuxt.js Admin Portal (Web Application)
├── docs/            # Documentation site
└── devtools/        # Docker & development tools
```

## Tính năng chính

### Mobile App (React Native)

#### Xác thực & Tài khoản

- Đăng ký tài khoản mới
- Đăng nhập / Đăng xuất
- Quên mật khẩu và đổi mật khẩu
- Quản lý hồ sơ cá nhân
- Chỉnh sửa thông tin tài khoản

#### Dịch vụ

- Xem danh sách dịch vụ dọn dẹp
- Xem chi tiết từng dịch vụ
- Yêu thích dịch vụ
- Tìm kiếm dịch vụ

#### Đặt hàng

- Tạo đơn hàng mới
- Chọn dịch vụ và số lượng
- Thêm ghi chú đặc biệt

#### Thanh toán

- Xem hóa đơn chi tiết
- Thanh toán qua cổng PayOS
- Thanh toán qua QR code
- Theo dõi trạng thái thanh toán
- Lịch sử giao dịch

#### Lịch sử & Theo dõi

- Xem lịch sử đơn hàng
- Lọc theo trạng thái (Đang xử lý, Hoàn thành, Đã hủy)
- Xem chi tiết đơn hàng
- Theo dõi tiến độ đơn hàng

#### Hồ sơ

- Quản lý thông tin cá nhân
- Thay đổi mật khẩu
- Xem điều khoản sử dụng
- Xem chính sách bảo mật
- Liên hệ hỗ trợ khách hàng

### 🖥️ Backend (Django)

#### Quản lý doanh nghiệp

- Quản lý thông tin doanh nghiệp
- Cài đặt dịch vụ và giá

#### Quản lý nhân sự (HR)

- Quản lý nhân viên
- Phân quyền người dùng
- Lịch làm việc (DSS giúp phân đơn cho nhân viên)

#### Quản lý đơn hàng

- Xử lý đơn hàng
- Theo dõi trạng thái
- Quản lý khách hàng

#### Thanh toán (Payments)

- Tích hợp PayOS
- Xử lý giao dịch
- WebSocket real-time payment status
- Webhook handling

## Hướng dẫn cài đặt

### Yêu cầu hệ thống

- **Node.js**: v20 trở lên
- **npm** hoặc **yarn**
- **Python**: 3.8+
- **Java**: OpenJDK 1.8 (cho Android)
- **Android Studio** hoặc **Xcode** (cho iOS)
- **PostgreSQL** hoặc **MySQL** (cho backend)

### Cài đặt Mobile App

#### Bước 1: Clone repository

```bash
git clone <repository-url>
cd cleanzy_app/mobile
```

#### Bước 2: Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

#### Bước 3: Cài đặt cho iOS (chỉ trên macOS)

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

#### Bước 4: Chạy ứng dụng

**Khởi động Metro Bundler:**

```bash
npm start
```

**Chạy trên Android:**

```bash
npm run android
```

**Chạy trên iOS:**

```bash
npm run ios
```

### Cài đặt Backend (Django)

#### Bước 1: Di chuyển vào thư mục backend

```bash
cd erp/backend
```

#### Bước 2: Tạo virtual environment

```bash
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

#### Bước 3: Cài đặt dependencies

```bash
pip install -r requirements/base.txt
```

#### Bước 4: Cấu hình environment

```bash
# Copy file cấu hình mẫu
cp config.env.sample config.env

# Chỉnh sửa config.env với thông tin của bạn
```

#### Bước 5: Migrate database

```bash
python manage.py migrate
```

#### Bước 6: Tạo dữ liệu khởi tạo (optional)

```bash
python init_data.py
```

#### Bước 7: Chạy development server

```bash
python manage.py runserver
```

Backend sẽ chạy tại: `http://localhost:8000`

### Cài đặt Business Portal (Nuxt.js)

```bash
cd erp/business
npm install
# hoặc
pnpm install

npm run dev
```

Business portal sẽ chạy tại: `http://localhost:3000`

## 🐳 Chạy với Docker

```bash
cd devtools
docker-compose up -d
```

## Cấu trúc thư mục Mobile

```
mobile/
├── src/
│   ├── assets/           # Hình ảnh, icons
│   ├── components/       # Reusable components
│   ├── contexts/         # React Context
│   ├── models/           # Data models
│   ├── navigation/       # React Navigation setup
│   ├── screens/          # Các màn hình
│   │   ├── HomeScreen/
│   │   ├── LoginScreen/
│   │   ├── RegisterScreen/
│   │   ├── CreateOrderScreen/
│   │   ├── PaymentScreen/
│   │   ├── HistoryScreen/
│   │   ├── ProfileScreen/
│   │   └── ...
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   └── viewmodels/       # MVVM ViewModels
├── android/              # Android native code
├── ios/                  # iOS native code
└── App.tsx               # Entry point
```

## Công nghệ sử dụng

### Mobile

- **React Native** 0.82
- **React Navigation** 7.x
- **TypeScript**
- **Lucide Icons**
- **React Native Image Picker**
- **React Native QRCode SVG**
- **AsyncStorage**

### Backend

- **Django** + **Django REST Framework**
- **PostgreSQL**
- **Redis** (caching & sessions)
- **Celery** (background tasks)
- **Channels** (WebSocket)
- **Firebase Admin**
- **PayOS Integration**
- **OAuth2 / OIDC**

### Business Portal

- **Nuxt.js 3**
- **Vue 3**
- **TailwindCSS**
- **TypeScript**

### Mobile

```bash
cd mobile
npm test
```

### Backend

```bash
cd erp/backend
python manage.py test
```

**Made with ❤️ by Cleanzy Team**
