// app/home.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./contexts/AuthContext";

export default function HomeScreen() {
  const { token } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Welcome to Goal Peering!</Text>
        <Text style={styles.subTitle}></Text>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/search")}
        >
          <Text style={styles.primaryButtonText}>Search Groups</Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            You are not alone on your journey.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /***************************************
   * Screen & Header Layout
   ***************************************/
  screen: {
    flex: 1,
    backgroundColor: "#edf5f0",
  },
  headerContainer: {
    backgroundColor: "#95c427",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  subTitle: {
    fontSize: 16,
    color: "#e8f5e9",
    textAlign: "center",
    lineHeight: 22,
    marginHorizontal: 10,
  },

  /***************************************
   * Content Layout
   ***************************************/
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    alignItems: "center",
  },

  /***************************************
   * Primary Button
   ***************************************/
  primaryButton: {
    backgroundColor: "#FFA000",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 30,
    marginBottom: 30,
    alignSelf: "stretch",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  /***************************************
   * Info Container
   ***************************************/
  infoContainer: {
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 12,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 2,
    alignSelf: "stretch",
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
});
