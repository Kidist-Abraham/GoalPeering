import React from "react";
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Goals, JoinGoals, VoteGoal } from "../api/goalsApi";
import * as Progress from "react-native-progress";

interface GoalItemProps {
  item: Goals;
  token: string | null;
  reload: () => void;
}

export function GoalItem({ item, token, reload }: GoalItemProps) {
  const router = useRouter();

  const handleJoin = async () => {
    try {
      await JoinGoals(Number(item.id), token);
      Alert.alert("Success", "You joined the goal!");
      router.push(`/goal/${item.id}`);
    } catch (error) {
      console.error("Join goal error:", error);
      Alert.alert("Error", "Failed to join this goal.");
    }
  };

  const handleVote = async (vote: string) => {
    try {
      await VoteGoal(Number(item.id), vote, token);
      Alert.alert("Success", "Your vote has been registered!");
      reload();
    } catch (error) {
      console.error("Vote goal error:", error);
      Alert.alert("Error", "Failed to vote on this goal.");
    }
  };

  // -- Joined Goal (Active) --
  if (item.joined) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => router.push(`/goal/${item.id}`)}
          >
            <Text style={styles.buttonText}>Go to Goal</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // -- Pending Goal (not voted) --
  if (item.status === "PENDING" && !item.user_voted) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.progressContainer}>
          <Progress.Bar
            progress={item.vote_count / 2}
            width={null}
            color="gray"
            unfilledColor="#e0e0e0"
            borderRadius={8}
            height={10}
          />
          <Text style={styles.progressText}>
            {`${item.vote_count} / 2 votes`}
          </Text>
        </View>

        <Text style={styles.statusText}>This group is pending</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => handleVote("upvote")}
          >
            <Text style={styles.buttonText}>Vote for Group</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // -- Pending Goal (already voted) --
  if (item.status === "PENDING" && item.user_voted) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.progressContainer}>
          <Progress.Bar
            progress={item.vote_count / 2}
            width={null}
            color="green"
            unfilledColor="#e0e0e0"
            borderRadius={8}
            height={10}
          />
          <Text style={styles.progressText}>
            {`${item.vote_count} / 2 votes`}
          </Text>
        </View>

        <Text style={styles.statusText}>This group is pending</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={() => handleVote("remove")}
          >
            <Text style={styles.buttonText}>Remove Vote</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // -- Active Goal (not joined) --
  if (item.status === "ACTIVE" && !item.joined) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleJoin}
          >
            <Text style={styles.buttonText}>Join Group</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Fallback (in case of unknown status)
  return null;
}

const styles = StyleSheet.create({
  /*************************************
   * Card Container
   *************************************/
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,

    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Shadow for Android
    elevation: 2,
  },

  /*************************************
   * Text Elements
   *************************************/
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    lineHeight: 18,
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    fontStyle: "italic",
    color: "#777",
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
    textAlign: "right",
  },

  /*************************************
   * Progress Bar Container
   *************************************/
  progressContainer: {
    marginTop: 6,
    marginBottom: 10,
  },

  /*************************************
   * Button Row
   *************************************/
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: "#95c427",
  },
  warningButton: {
    backgroundColor: "#FFA000",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
