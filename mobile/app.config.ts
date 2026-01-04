import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "mobile",
    slug: "mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
    },
    ios: {
        supportsTablet: true
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#ffffff"
        },
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false
    },
    web: {
        favicon: "./assets/favicon.png"
    },
    extra: {
        apiUrl: process.env.API_URL || "http://localhost:3000/api",
        eas: {
            projectId: "21316696-caea-43d9-ad9d-e1fbace68855"
        }
    },
    updates: {
        url: "https://u.expo.dev/21316696-caea-43d9-ad9d-e1fbace68855"
    },
    runtimeVersion: {
        policy: "appVersion"
    },
});
