// app/goal/[id].tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import * as Progress from "react-native-progress";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { AddSuccessStory, AddTips, CompleteGoals } from "../api/goalsApi";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
const FRONTED_BASE_URL = Constants.expoConfig?.extra?.FRONTED_BASE_URL;

interface Goal {
  id: number;
  name: string;
  description: string;
  accomplishedCount: number;
  memberCount: number;
  tips: [
    {
      title: string;
      content: string;
      owner: string;
      id: number;
      numberOfUpVote: number;
      numberOfDownVote: number;
    }
  ];
  successStories: [
    {
      title: string;
      content: string;
      owner: string;
      id: number;
    }
  ];
}

type FormMode = "tip" | "story" | null;

export default function GoalScreen() {
  const { id } = useLocalSearchParams() as { id: string };
  const goalId = id;
  const { token } = useAuth();
  const router = useRouter();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  // Load the goal details
  const loadGoal = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/goal/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoal(response.data);
    } catch (error) {
      console.error("Error loading goal:", error);
      Alert.alert("Error", "Failed to load goal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoal();
  }, [id]);

  type ExpandableItemProps = {
    title: string;
    content: string;
    itemType: "tip" | "successStory";
    owner?: string;
    tipId?: number;
    tipNumberOfUpVote?: number;
    tipNumberOfDownVote?: number;
  };

  const ExpandableItem: React.FC<ExpandableItemProps> = ({
    title,
    content,
    itemType,
    owner,
    tipId,
    tipNumberOfUpVote = 0,
    tipNumberOfDownVote = 0,
  }) => {
    const [expanded, setExpanded] = useState(false);
    const [upvoteCount, setUpvoteCount] = useState(tipNumberOfUpVote);
    const [downvoteCount, setDownvoteCount] = useState(tipNumberOfDownVote);

    const handleVote = async (voteValue: number) => {
      if (!goalId || !tipId) return;
      try {
        await axios.post(
          `${API_BASE_URL}/goal/${goalId}/tips/${tipId}/vote`,
          { voteValue },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Voted successfully!");

        // Simple local update for demonstration:
        if (voteValue === 1) {
          setUpvoteCount((prev) => prev + 1);
        } else {
          setDownvoteCount((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error voting:", error);
      }
    };

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.cardArrow}>{expanded ? "▼" : "▶"}</Text>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            {owner && <Text style={styles.cardOwner}> (by {owner})</Text>}
          </View>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.cardContent}>
            <Text style={styles.cardText}>{content}</Text>
            {itemType === "tip" && goalId && tipId && (
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { marginRight: 16 }]}
                  onPress={() => handleVote(1)}
                >
                  <Text style={styles.actionButtonText}>
                    👍 Upvote ({upvoteCount})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleVote(-1)}
                >
                  <Text style={styles.actionButtonText}>
                    👎 Downvote ({downvoteCount})
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const handleComplete = async () => {
    if (!token) return;
    try {
      await CompleteGoals(Number(id), token);
      Alert.alert("Success", "You completed the goal!");
    } catch (error) {
      console.error("Complete goal error:", error);
      Alert.alert("Error", "Failed to complete the goal.");
    }
  };

  const handleOpenForm = (mode: FormMode) => {
    setFormMode(mode);
    setNewTitle("");
    setNewContent("");
    setModalVisible(true);
  };

  const handleCloseForm = () => {
    setModalVisible(false);
    setFormMode(null);
  };

  const handleAddItem = async () => {
    if (!token) return;
    if (!newTitle.trim() || !newContent.trim()) {
      Alert.alert("Validation", "Please enter a title and content.");
      return;
    }

    try {
      if (formMode === "tip") {
        await AddTips(Number(id), token, {
          title: newTitle,
          content: newContent,
        });
        Alert.alert("Success", "You added a tip!");
      } else if (formMode === "story") {
        await AddSuccessStory(Number(id), token, {
          title: newTitle,
          content: newContent,
        });
        Alert.alert("Success", "You added a success story!");
      }
      handleCloseForm();
      // Reload goal to immediately see the update
      loadGoal();
    } catch (error) {
      console.error("Add item error:", error);
      Alert.alert("Error", "Failed to add new item.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#95c427" />
        <Text style={{ marginTop: 10 }}>Loading goal...</Text>
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Goal not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.goalTitle}>{goal.name}</Text>
        <Text style={styles.goalDescription}>{goal.description}</Text>
        <View style={styles.progressContainer}>
          <Progress.Bar
            progress={goal.accomplishedCount / goal.memberCount}
            width={null}
            color="#ffffff"
            unfilledColor="rgba(255,255,255,0.3)"
            borderWidth={0}
            borderRadius={8}
            height={10}
          />
          <Text style={styles.progressText}>
            {`${goal.accomplishedCount} / ${goal.memberCount} accomplished`}
          </Text>
        </View>
        <View style={styles.headerButtonsRow}>
          <TouchableOpacity style={[styles.headerButton, styles.completeButton]} onPress={handleComplete}>
            <Text style={styles.headerButtonText}>Mark as Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerButton, styles.chatButton]} onPress={() => router.push(`/chat/${id}`)}>
            <Text style={styles.headerButtonText}>Go to Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Section */}
      <ScrollView style={styles.contentSection}>
        {/* Tips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tips</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleOpenForm("tip")}
            >
              <Text style={styles.addButtonText}>+ Add Tip</Text>
            </TouchableOpacity>
          </View>
          {goal.tips && goal.tips.length > 0 ? (
            goal.tips.map((tip, index) => (
              <ExpandableItem
                key={`tip-${index}`}
                title={tip.title}
                content={tip.content}
                owner={tip.owner}
                itemType="tip"
                tipId={tip.id}
                tipNumberOfUpVote={tip.numberOfUpVote}
                tipNumberOfDownVote={tip.numberOfDownVote}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No tips yet.</Text>
          )}
        </View>

        {/* Success Stories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Success Stories</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleOpenForm("story")}
            >
              <Text style={styles.addButtonText}>+ Add Story</Text>
            </TouchableOpacity>
          </View>
          {goal.successStories && goal.successStories.length > 0 ? (
            goal.successStories.map((story, index) => (
              <ExpandableItem
                key={`story-${index}`}
                title={story.title}
                content={story.content}
                owner={story.owner}
                itemType="successStory"
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No success stories yet.</Text>
          )}
        </View>
      </ScrollView>

      {/* Modal for Adding Tips/Stories */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {formMode === "tip" ? "Add Tip" : "Add Success Story"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter title"
              placeholderTextColor="#888"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <TextInput
              style={[styles.input, { height: 100 }]}
              multiline
              placeholder="Enter content/description"
              placeholderTextColor="#888"
              value={newContent}
              onChangeText={setNewContent}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#888" }]}
                onPress={handleCloseForm}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#95c427" }]}
                onPress={handleAddItem}
              >
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  /*******************************
   * Screen & General Layout
   *******************************/
  screen: {
    flex: 1,
    backgroundColor: "#edf5f0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /*******************************
   * Header Section
   *******************************/
  headerContainer: {
    backgroundColor: "#95c427",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  goalTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 16,
    color: "#e8f5e9",
    marginBottom: 20,
    lineHeight: 22,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    marginTop: 8,
    color: "#fff",
    fontSize: 14,
    textAlign: "right",
  },
  headerButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerButton: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  completeButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  chatButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  /*******************************
   * Content Section
   *******************************/
  contentSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#FFA000",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#999",
    marginTop: 10,
  },

  /*******************************
   * Expandable Card Item
   *******************************/
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardArrow: {
    fontSize: 18,
    marginRight: 8,
    color: "#444",
  },
  cardTitleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  cardOwner: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#777",
  },
  cardContent: {
    marginTop: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 12,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: "row",
  },
  actionButton: {
    backgroundColor: "#eeeeee",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },

  /*******************************
   * Modal
   *******************************/
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    color: "#333",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
