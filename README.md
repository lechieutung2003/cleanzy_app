# cleanzy_app

Mono-repo chứa 2 phần chính:
- Mobile (React Native) — xem [mobile/package.json](mobile/package.json) và hướng dẫn chi tiết tại [mobile/README.md](mobile/README.md)
- Backend (Django) — entrypoint: [backend/manage.py](backend/manage.py)

Quick start

1) Mobile
- Chuyển vào thư mục mobile:
  - npm install
  - npm start  # chạy Metro
  - npm run android  # hoặc npm run ios (trên macOS, sau khi pod install)

2) Backend
- Tạo virtualenv, cài requirements (nếu có), sau đó:
  - python manage.py migrate
  - python manage.py runserver

Ghi chú
- File .gitignore ở root đã bổ sung để loại trừ build artifacts cho cả mobile và backend.
- Xem [mobile/README.md](mobile/README.md) để biết chi tiết cấu hình React Native và iOS/Android.