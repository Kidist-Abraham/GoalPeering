export default ({ config }) => ({
    ...config,
    name: "goal-peering",
    slug: "goal-peering",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
    },
    android: {
      package: "com.kid.goalpeering",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    ios: {
      bundleIdentifier: "com.kid.goalpeering"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      ...config.extra,

      API_BASE_URL: "https://goal-peering-b4cd0d5ea8d8.herokuapp.com",
      FRONTED_BASE_URL: "https://goal-peering-b4cd0d5ea8d8.herokuapp.com",

      eas: {
        projectId: "1afac247-11bd-4b24-9f7b-32e2108dc6f6",
      },
    },
  });

  // Run ipconfig getifaddr en0 to get the ip address of your machine if you are testing locally