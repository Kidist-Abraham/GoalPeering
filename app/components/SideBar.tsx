import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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

  return (
    <View style={styles.sidebarContainer}>
 

      <TouchableOpacity style={styles.menuButton} onPress={handleHome}>
        <Text style={styles.menuButtonText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton} onPress={handleJoinedGoal}>
        <Text style={styles.menuButtonText}>Joined Goals</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton} onPress={handleOwnedGoal}>
        <Text style={styles.menuButtonText}>My Goals</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
        <Text style={styles.menuButtonText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarContainer: {
    flex: 1,
    width: 250,
    backgroundColor: "#edf5f0",
    padding: 55,

    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,

    // Android Shadow
    elevation: 5,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#95c427",
  },
  menuButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,

    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,

    // Android Shadow
    elevation: 2,

    alignItems: "center",
  },
  menuButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  closeButton: {
    backgroundColor: "#FFA000",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 30,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
