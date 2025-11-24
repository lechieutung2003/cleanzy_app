# 🧺 Cleanzy App

Cleanzy is a professional cleaning-service booking application that helps users easily schedule and manage home and office cleaning appointments.

## App Demo

Mobile interface

<img width="360" height="800" alt="06 1_Login1" src="https://github.com/user-attachments/assets/43a82378-5c68-4fe7-bca1-53e5d52ba5bf" />
<img width="360" height="800" alt="06 3_Home_1" src="https://github.com/user-attachments/assets/30896a19-6a69-4a19-8c60-77c29c022365" />

Web interface

<img width="2711" height="1605" alt="image" src="https://github.com/user-attachments/assets/3c87cbcc-5bb3-40a0-9932-020895b6ebdd" />
<img width="2733" height="1538" alt="image" src="https://github.com/user-attachments/assets/720a5ce8-b5e5-45a8-9e67-95d6e95d0a51" />

## Project Architecture

This repository is a monorepo containing two primary parts:

- Mobile (React Native) — the mobile application for iOS and Android
- Backend (Django) — the API server and ERP management system

```
cleanzy_app/
├── mobile/          # React Native mobile app
├── erp/
│   ├── backend/     # Django REST API
│   └── business/    # Nuxt.js admin portal (web application)
├── docs/            # Documentation site
└── devtools/        # Docker & development tools
```

## Key Features

### Mobile App (React Native)

Authentication & Account

- Sign up for a new account
- Sign in / Sign out
- Password reset and change
- Manage user profile
- Edit account information

Services

- Browse available cleaning services
- View service details
- Favorite services
- Search services

Ordering

- Create new orders
- Choose services and quantities
- Add special instructions

Payments

- View detailed invoices
- Pay via PayOS
- Pay using QR codes
- Track payment status
- View transaction history

History & Tracking

- View order history
- Filter by status (Processing, Completed, Canceled)
- View order details
- Track order progress

Profile

- Manage personal information
- Change password
- View Terms of Service
- View Privacy Policy
- Contact customer support

### Backend (Django)

Business Management

- Manage business profiles
- Configure services and pricing

Human Resources (HR)

- Manage employees
- Assign user roles and permissions
- Work schedule (DSS for automatic order assignment)

Order Management

- Process and manage orders
- Track order status
- Manage customers

Payments

- PayOS integration
- Transaction processing
- Real-time payment status via WebSockets
- Webhook handling

## Installation Guide

### System Requirements

- Node.js v20 or later
- npm or yarn
- Python 3.8+
- Java (OpenJDK 1.8) for Android builds
- Android Studio or Xcode for native builds
- PostgreSQL or MySQL for the backend

### Install Mobile App

1. Clone the repository

```bash
git clone <repository-url>
cd cleanzy_app/mobile
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. iOS setup (macOS only)

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

4. Run the app

Start the Metro bundler:

```bash
npm start
```

Run on Android:

```bash
npm run android
```

Run on iOS:

```bash
npm run ios
```

### Install Backend (Django)

1. Change to the backend folder

```bash
cd erp/backend
```

2. Create a virtual environment

```bash
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

3. Install Python dependencies

```bash
pip install -r requirements/base.txt
```

4. Configure environment variables

```bash
# Copy the example env file
cp config.env.sample config.env

# Edit `config.env` with your settings
```

5. Run database migrations

```bash
python manage.py migrate
```

6. (Optional) Load initial data

```bash
python init_data.py
```

7. Start the development server

```bash
python manage.py runserver
```

The backend will be available at: `http://localhost:8000`

### Install Business Portal (Nuxt.js)

```bash
cd erp/business
npm install
# or
pnpm install

npm run dev
```

The business portal will be available at: `http://localhost:3000`

## Running with Docker

```bash
cd devtools
docker-compose up -d
```

## Mobile Folder Structure

```
mobile/
├── src/
│   ├── assets/           # Images & icons
│   ├── components/       # Reusable components
│   ├── contexts/         # React Context
│   ├── models/           # Data models
│   ├── navigation/       # React Navigation setup
│   ├── screens/          # App screens
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
│   └── viewmodels/       # MVVM view models
├── android/              # Android native code
├── ios/                  # iOS native code
└── App.tsx               # Entry point
```

## Technologies Used

### Mobile

- React Native 0.82
- React Navigation 7.x
- TypeScript
- Lucide Icons
- React Native Image Picker
- React Native QRCode SVG
- AsyncStorage

### Backend

- Django + Django REST Framework
- PostgreSQL
- Redis (caching & sessions)
- Celery (background tasks)
- Channels (WebSocket)
- Firebase Admin
- PayOS integration
- OAuth2 / OIDC

### Business Portal

- Nuxt.js 3
- Vue 3
- Tailwind CSS
- TypeScript

## Tests

Mobile

```bash
cd mobile
npm test
```

Backend

```bash
cd erp/backend
python manage.py test
```

**Made with ❤️ by the Cleanzy Team**
