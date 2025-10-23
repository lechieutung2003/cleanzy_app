# Mobile App — Cleanzy

This folder contains the **React Native** mobile application for the Cleanzy project.

node -v
- v22.15.0

java -version
- openjdk version "1.8.0_462"
- OpenJDK Runtime Environment (Temurin)(build 1.8.0_462-b08)
- OpenJDK 64-Bit Server VM (Temurin)(build 25.462-b08, mixed mode)

## Project Structure

```
mobile/
├── src/
│   ├── assets/           # Images and static assets
│   ├── components/       # Reusable UI components
│   ├── models/           # Data models (if any)
│   ├── navigation/       # Navigation setup (e.g., AppNavigator)
│   ├── screens/          # App screens (HomeScreen, LoginScreen, etc.)
│   ├── services/         # API and business logic
│   └── viewmodels/       # ViewModel hooks for MVVM pattern
├── App.tsx               # App entry point
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── ...                   # Other config and setup files
```

## Getting Started

### Prerequisites

- Node.js & npm (or Yarn)
- React Native CLI
- Android Studio and/or Xcode (for running on emulator/device)
- [Set up your environment](https://reactnative.dev/docs/environment-setup) as per the official React Native docs

### Installation

1. Open a terminal and navigate to the `mobile` directory:

    ```sh
    cd mobile
    ```

2. Install dependencies:

    ```sh
    npm install
    # or
    yarn install
    ```

### Running the App

#### Start Metro Bundler

```sh
npm start
# or
yarn start
```

#### Run on Android

```sh
npm run android
# or
yarn android
```

#### Run on iOS (macOS only)

1. Install CocoaPods dependencies (first time or after native deps change):

    ```sh
    bundle install
    bundle exec pod install
    ```

2. Run the app:

    ```sh
    npm run ios
    # or
    yarn ios
    ```

> You can also run the app directly from Android Studio or Xcode.

### Project Structure Notes

- **MVVM Pattern:**  
  The app uses the MVVM (Model-View-ViewModel) pattern. UI logic is separated into `viewmodels` hooks, and screens only handle rendering and user interaction.
- **Navigation:**  
  Navigation is set up in `src/navigation/`.
- **Assets:**  
  Images and static files are in `src/assets/`.

### Modifying the App

- Edit `src/screens` to change or add screens.
- Edit `src/components` for reusable UI elements.
- Edit `src/viewmodels` for business/UI logic.

### Troubleshooting

- See the [React Native Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting) if you encounter issues.
- Make sure your environment is set up as per the [official docs](https://reactnative.dev/docs/environment-setup).

### Learn More

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Metro Bundler](https://facebook.github.io/metro/)
- [React Navigation](https://reactnavigation.org/)

---

**Happy coding with Cleanzy Mobile!**