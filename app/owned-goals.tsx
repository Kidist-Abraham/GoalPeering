import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Button,TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useAuth } from "./contexts/AuthContext"; 
import { useRouter } from "expo-router";
import { Goals, fetchOwnedGoals, LeaveGoals, CompleteGoals } from "./api/goalsApi";
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;


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
      console.log("hereeeee", data)
      setGoals(data);
    } catch (error) {
      console.error("Error loading owned goals:", error);
      Alert.alert("Error", "Failed to load owned goals.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (goalId: number) => {
    if (!token) return;
    try {
      await CompleteGoals(goalId, token);
      Alert.alert("Success", "You complete the goal");
      loadOwnedGoals();
    } catch (error) {
      console.error("Complete goal error:", error);
      Alert.alert("Error", "Failed to leave the goal.");
    }
  };

  const handleLeave = async (goalId: number) => {
    if (!token) return;
    try {

      Alert.alert(
        'Confirmation',
        'Did you compelte the goal?',
        [
          {
            text: 'Yes',
            onPress: () => handleComplete(goalId),
            style: 'default',
          },
          {
            text: 'No',
            onPress: () => {
              console.log('User pressed No');
              Alert.alert(
                'Confirmation',
                'Are you sure you want to leave?',
                [
                  {
                    text: 'Yes',
                    onPress: () => {
                       LeaveGoals(goalId, token);
                       Alert.alert("Success", "You left the group");
                    },
                    style: 'default',
                  },
                  {
                    text: 'No',
                    onPress: () => {
                      console.log('User pressed No');
                 
                    },
                  },
                ],
                { cancelable: false },
              );
         
            },
          },
        ],
        { cancelable: false },
      );

      
      loadOwnedGoals();

     
    } catch (error) {
      console.error("Leave group error:", error);
      Alert.alert("Error", "Failed to leave the group.");
    }
  };

  useEffect(() => {
    loadOwnedGoals();
  }, []);

  const renderGoal = ({ item }: { item: Goals}) => {
    return (
      <View style={styles.goalItem}>
      <TouchableOpacity
        style={styles.goalItem}
        onPress={() => router.push(`/goal/${item.id}`)} 
      >
        <Text style={styles.goalName}>{item.name}</Text>
        <Text style={styles.goalDescription}>{item.description}</Text>
      </TouchableOpacity>
      <View style={styles.buttonRow}>
      <Button
        title="Leave"
        color="#f44336"
        onPress={() => handleLeave(item.id)}
      />
      <Button
          title="Complete"
          color="#4CAF50"
          onPress={() => handleComplete(item.id)}
        />
    </View>
    </View>
    );
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Owned Goals</Text>
      {loading && <Text>Loading...</Text>}
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderGoal}
        ListEmptyComponent={!loading ? <Text>No owned goals found.</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    color: "#fff",
  },
  goalItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    elevation: 2,
  },
  goalName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
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
});






