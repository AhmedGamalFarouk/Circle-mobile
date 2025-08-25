import 'dotenv/config';

export default {
  expo: {
    name: "Circle-mobile",
    slug: "Circle-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/circle-logo.png",
      resizeMode: "contain",
      backgroundColor: "#1a1a1a"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1a1a1a"
      },
      edgeToEdgeEnabled: true,
      googleServicesFile: "./google-services.json",
      package: "com.ahmedgamal.Circlemobile"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "55e87d87-070f-49de-9af1-41160bd0bcc9"
      },
      aiSuggestOptionsKey: process.env.AI_SUGGEST_OPTIONS_KEY,
    },
  },
};
