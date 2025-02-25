import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "expo-router";

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  const handleHome = () => {
    if (!isAuthenticated) {
      alert("Please login to access Home.");
      return;
    }
    router.push("/home");
    onClose();
  };

  const handleLogout = () => {
    if (!isAuthenticated) {
      alert("You are not logged in.");
      return;
    }
    logout();
    router.replace("/");
    onClose();
  };

  const handleJoinedGoal = () => {
    if (!isAuthenticated) {
      alert("You are not logged in.");
      return;
    }
    router.push("/joined-goals");
    onClose();
  };

  const handleOwnedGoal = () => {
    if (!isAuthenticated) {
      alert("You are not logged in.");
      return;
    }
    router.push("/owned-goals");
    onClose();
  };



  console.log("Sidebar component mounted!"); // For debugging

  return (
    <View style={styles.sidebarContainer}>
      <Text style={styles.menuTitle}>Menu</Text>

      <Pressable style={styles.menuButton} onPress={handleHome}>
        <Text style={styles.menuButtonText}>Home</Text>
      </Pressable>

      <Pressable style={styles.menuButton} onPress={handleLogout}>
        <Text style={styles.menuButtonText}>Logout</Text>
      </Pressable>
      
      <Pressable style={styles.menuButton} onPress={onClose}>
        <Text style={styles.menuButtonText}>Close</Text>
      </Pressable>

      <Pressable style={styles.menuButton} onPress={handleJoinedGoal}>
        <Text style={styles.menuButtonText}>Joined Goals</Text>
      </Pressable>

      <Pressable style={styles.menuButton} onPress={handleOwnedGoal}>
        <Text style={styles.menuButtonText}>My Goals</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarContainer: {
    flex: 1,
    width: 250,
    backgroundColor: "#f5f5f5",
    padding: 20,

    // Shadows for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,

    // Shadows for Android
    elevation: 5,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
  },
  menuButton: {
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  menuButtonText: {
    fontSize: 16,
    color: "#333",
  },
});
