import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "./contexts/AuthContext";
import { useRouter } from "expo-router";
import { Goals, fetchOwnedGoals, LeaveGoals, CompleteGoals } from "./api/goalsApi";
import Constants from "expo-constants";


const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

/**
 * Render the goals ocreated by the user
 */

export default function OwnedGoalsScreen() {
  const { token } = useAuth();
  const router = useRouter();

  const [goals, setGoals] = useState<Goals[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOwnedGoals = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchOwnedGoals(token);
      setGoals(data);
    } catch (error) {
      console.error("Error loading owned goals:", error);
      Alert.alert("Error", "Failed to load owned goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwnedGoals();
  }, []);

  const handleComplete = async (goalId: number) => {
    if (!token) return;
    try {
      await CompleteGoals(goalId, token);
      Alert.alert("Success", "You completed the goal!");
      loadOwnedGoals();
    } catch (error) {
      console.error("Complete goal error:", error);
      Alert.alert("Error", "Failed to complete the goal.");
    }
  };

  const handleLeave = async (goalId: number) => {
    if (!token) return;

    Alert.alert(
      "Confirmation",
      "Did you complete the goal?",
      [
        {
          text: "Yes",
          onPress: () => handleComplete(goalId),
          style: "default",
        },
        {
          text: "No",
          onPress: () => {
            Alert.alert(
              "Confirmation",
              "Are you sure you want to leave?",
              [
                {
                  text: "Yes",
                  onPress: async () => {
                    try {
                      await LeaveGoals(goalId, token);
                      Alert.alert("Success", "You left the group.");
                      loadOwnedGoals();
                    } catch (err) {
                      console.error("Leave group error:", err);
                      Alert.alert("Error", "Failed to leave the group.");
                    }
                  },
                  style: "default",
                },
                {
                  text: "No",
                  onPress: () => {
                  },
                },
              ],
              { cancelable: false }
            );
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderGoal = ({ item }: { item: Goals }) => {
    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push(`/goal/${item.id}`)}
        >
          <Text style={styles.goalName}>{item.name}</Text>
          <Text style={styles.goalDescription}>{item.description}</Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={() => handleLeave(item.id)}
          >
            <Text style={styles.buttonText}>Leave</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={() => handleComplete(item.id)}
          >
            <Text style={styles.buttonText}>Complete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Your Owned Goals</Text>
      </View>
      <View style={styles.contentContainer}>
        {loading && (
          <ActivityIndicator
            size="large"
            color="#95c427"
            style={{ marginVertical: 20 }}
          />
        )}
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGoal}
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.emptyText}>No owned goals found.</Text>
            ) : null
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#edf5f0",
  },
  headerContainer: {
    backgroundColor: "#95c427",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#333",
    fontSize: 16,
    marginTop: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  goalName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  dangerButton: {
    backgroundColor: "#f44336",
  },
  successButton: {
    backgroundColor: "#95c427",
  },
});
