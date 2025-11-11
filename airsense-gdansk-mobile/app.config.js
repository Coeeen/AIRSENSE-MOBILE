import "dotenv/config";

export default {
  expo: {
    name: "airsense-gdansk-mobile",
    slug: "airsense-gdansk-mobile",
    version: "1.0.0",
    extra: {
      eas: {
        projectId: "2d24e86b-2a1c-4fc5-bb64-04148e2e5a28",
      },
    },
    scheme: "shelfieapp",
    entryPoint: "./index.jsx",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.anonymous.airsensegdanskmobile",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: ["expo-router"],
    env: {
      apiUrl: process.env.API_URL,
      baseAuth: {
        login: process.env.BASEAUTH_LOGIN,
        password: process.env.BASEAUTH_PASSWORD,
      },
    },
  },
};
