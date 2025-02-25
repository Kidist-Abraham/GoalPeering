import { Stack } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import { View, Button, StyleSheet, Animated } from "react-native";
import { AuthProvider } from "./contexts/AuthContext";
import Sidebar from "./components/SideBar";
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
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={["#03a655", "#042e5e"]} 
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.hamburgerContainer}>
          <Button title="☰" onPress={toggleSidebar} />
        </View>

        <Animated.View
          style={[
            styles.sidebarWrapper,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <Sidebar onClose={closeSidebar} />
        </Animated.View>

        <Stack
          screenOptions={{
            contentStyle: { 
              backgroundColor: "transparent",
              paddingTop: 20
            },
          }}
        />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  hamburgerContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    paddingBottom: 2,
    zIndex: 999,
  },
  sidebarWrapper: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 250,
    zIndex: 998,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
});
