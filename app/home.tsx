// app/home.tsx
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./contexts/AuthContext"; 

export default function HomeScreen() {
  const { token } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Goal Peering!</Text>
      <Text style={styles.subTitle}>
        Search your Goals and Join a Peer Group!
      </Text>

      <Button
        title="Search Groups"
        onPress={() => router.push("/search")}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
        You are not Alone on Your Jorney 
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  subTitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
    color:  "#fff",
  },
  infoContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: "transparent",
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color:  "#fff",
  },
});
