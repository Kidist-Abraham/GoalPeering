// app/_layout.tsx (or RootLayout.tsx)
import { Stack } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { AuthProvider } from "./contexts/AuthContext";
import Sidebar from "./components/SideBar"; // or wherever your Sidebar component is located
import { LinearGradient } from "expo-linear-gradient";

export default function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-250)).current;

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: sidebarOpen ? 0 : -250,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [sidebarOpen]);

  return (
    <AuthProvider >
      <View style={{ flex: 1 }}>
        {/* Background Gradient */}
        <LinearGradient
          // You can tweak these colors to match your app's theme.
          colors={["#b7e5f7", "#70a2b5"]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Hamburger Button */}
        <View style={styles.hamburgerContainer}>
          <TouchableOpacity style={styles.hamburgerButton} onPress={toggleSidebar}>
            <Text style={styles.hamburgerButtonText}>☰</Text>
          </TouchableOpacity>
        </View>

        {/* Animated Sidebar */}
        <Animated.View
          style={[
            styles.sidebarWrapper,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <Sidebar onClose={closeSidebar} />
        </Animated.View>

        {/* Main App Stack */}
        <Stack
          screenOptions={{
            contentStyle: {
              backgroundColor: "#edf5f0",
              paddingTop: Platform.OS === "ios" ? 20 : 0,
            },
            headerShown: false,
          }}
        />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  /************************************
   * Hamburger Button
   ************************************/
  hamburgerContainer: {
    position: "absolute",
    top: 10,
    left: 20,
    zIndex: 999,
  },
  hamburgerButton: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 12,
    // Shadows for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 2,
  },
  hamburgerButtonText: {
    fontSize: 20,
    color: "#333",
    fontWeight: "600",
  },

  /************************************
   * Sidebar
   ************************************/
  sidebarWrapper: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 250,
    zIndex: 998,
    backgroundColor: "#fff",
    // You can also add some transparency if you like:
    // backgroundColor: 'rgba(255, 255, 255, 0.8)',

    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 5,
  },
});
