# cleanzy_app

This is a mono-repo containing two main parts:
- Mobile (React Native) — see [mobile/package.json](mobile/package.json) and detailed instructions at [mobile/README.md](mobile/README.md)
- Backend (Django) — entrypoint: [backend/manage.py](backend/manage.py)

## Quick Start

### 1) Mobile
- Navigate to the mobile directory:
  - `npm install`
  - `npm start`  # start Metro
  - `npm run android`  # or `npm run ios` (on macOS, after running pod install)

### 2) Backend
- Create a virtual environment and install requirements:
  - `cd backend`
  - `python -m venv venv`
  - `./venv/Scripts/activate`
  - `pip install -r requirements.txt`
  - `python manage.py migrate`
  - `python manage.py runserver`