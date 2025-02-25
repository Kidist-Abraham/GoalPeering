// app/goal/[id].tsx
import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet, TouchableOpacity, ScrollView,  TextInput, Modal} from "react-native";
import * as Progress from 'react-native-progress';
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { AddSuccessStory, AddTips, CompleteGoals } from "../api/goalsApi";
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
const FRONTED_BASE_URL = Constants.expoConfig?.extra?.FRONTED_BASE_URL
interface Goal {
  id: number;
  name: string;
  description: string;
  accomplishedCount: number;
  memberCount: number;
  tips: [{
    title: string;
    content: string;
    owner: string
    id: number
    numberOfUpVote: number
    numberOfDownVote: number
}],
  successStories: [{
    title: string;
    content: string;
    owner: string
    id: number
}],
}

type FormMode = 'tip' | 'story' | null;

export default function GoalScreen() {
  const { id } = useLocalSearchParams() as { id: string };
  const goalId = id
  const { token } = useAuth();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

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
  
    // We keep local state to show the current up/down counts in the UI.
    // If we want to keep them fully in sync with the server, 
    // we might do a re-fetch after each vote instead.
    const [upvoteCount, setUpvoteCount] = useState(tipNumberOfUpVote);
    const [downvoteCount, setDownvoteCount] = useState(tipNumberOfDownVote);
  
    const handleVote = async (voteValue: number) => {
      if (!goalId || !tipId) return;
  
      try {
        // POST /:goalId/tips/:tipId/vote
        // Body: { voteValue: +1 or -1 }
        const url = `${API_BASE_URL}/goal/${goalId}/tips/${tipId}/vote`;

        const response = await axios.post(`${API_BASE_URL}/goal/${goalId}/tips/${tipId}/vote`, {
          voteValue
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
          console.log("Voted successfully!");
  
          // Naive local update: If user upvotes, increment upvoteCount.
          // If user downvotes, increment downvoteCount.
          // For a more robust approach, you'd check whether the user previously voted, etc.
          if (voteValue === 1) {
            setUpvoteCount(tipNumberOfUpVote + 1);
            setDownvoteCount(tipNumberOfDownVote)
          } else {
            setUpvoteCount(tipNumberOfUpVote);
            setDownvoteCount(tipNumberOfDownVote + 1)
          }
        
      } catch (error) {
        console.error("Error voting:", error);
      }
    };
  
    return (
      <View style={styles.itemContainer}>
        {/* Header Row: arrow + title + (owner) */}
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.headerRow}
        >
          <Text style={styles.arrow}>{expanded ? "▼" : "▶"}</Text>
  
          <View style={styles.titleOwnerContainer}>
            <Text style={styles.itemTitle}>{title}</Text>
            {owner && (
              <Text style={styles.owner}> (by {owner})</Text>
            )}
          </View>
        </TouchableOpacity>
  
        {/* Content (only visible if expanded) */}
        {expanded && (
          <View style={styles.contentContainer}>
            <Text style={styles.itemContent}>{content}</Text>
  
            {/* If it's a tip, show up/down vote buttons and counts */}
            {itemType === "tip" && goalId && tipId && (
              <View style={styles.voteButtonsContainer}>
                <TouchableOpacity
                  style={styles.voteButton}
                  onPress={() => handleVote(1)}
                >
                  <Text style={styles.voteButtonText}>
                    👍 Upvote ({upvoteCount})
                  </Text>
                </TouchableOpacity>
  
                <TouchableOpacity
                  style={styles.voteButton}
                  onPress={() => handleVote(-1)}
                >
                  <Text style={styles.voteButtonText}>
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
      Alert.alert("Success", "You complete the goal");
    } catch (error) {
      console.error("Complete goal error:", error);
      Alert.alert("Error", "Failed to complete a goal.");
    }
  };

  const handleOpenForm = (mode: FormMode) => {
    setFormMode(mode);
    setNewTitle('');
    setNewContent('');
    setModalVisible(true);
  };

  // Closes the modal
  const handleCloseForm = () => {
    setModalVisible(false);
    setFormMode(null);
  };

  const handleAddItem = async () => {
    if (!token) return; {
    if (!newTitle.trim() || !newContent.trim()) {
      return;
    }

    if (formMode === 'tip') {
      try {
        const tip = { title: newTitle, content: newContent }
        await AddTips(Number(id),token,tip);
        Alert.alert("Success", "You added a tip");
      } catch (error) {
        console.error("Add tip error:", error);
        Alert.alert("Error", "Failed to add a tip");
      }
      
    } else if (formMode === 'story') {
      try {
        const successStory = { title: newTitle, content: newContent }
        await AddSuccessStory(Number(id),token,successStory);
        Alert.alert("Success", "You added a success story");
      } catch (error) {
        console.error("Add success story error:", error);
        Alert.alert("Error", "Failed to add a success story");
      }
      
    }
    handleCloseForm();
    router.push(`/goal/${id}`)
  }
  };


  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading goal...</Text>
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={styles.container}>
        <Text>Goal not found.</Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>{goal.name}</Text>
      <Text style={styles.description}>{goal.description}</Text>
      <Text style={styles.members}>Members: {goal.memberCount}</Text>
      <Text style={styles.members}>Acomplished: {goal.accomplishedCount}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}>

      <View style={{ flex: 1, marginRight: 10 }}>
        <Progress.Bar 
          progress={goal.accomplishedCount / goal.memberCount} 
          width={null} 
          color="green" 
          borderRadius={5} 
        />
      </View>
      

      <Text>{`${goal.accomplishedCount} / ${goal.memberCount}`}</Text>
    </View>
    <Button
          title="Complete"
          color="#4CAF50"
          onPress={() => handleComplete()}
        />

    <Button title="Go to Chat" onPress={() => router.push(`/chat/${id}`)} />
    <ScrollView style={styles.container}>
    
      <Text style={styles.sectionTitle}>Tips</Text>
      <Button title="Add Tips" onPress={() => handleOpenForm('tip')} color="#FF9800" />
      {goal.tips.map((tip, index) => (
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
      ))}


      <Text style={styles.sectionTitle}>Success Stories</Text>
      <Button title="Add Story" onPress={() => handleOpenForm('story')} color="#FF9800" />
      {goal.successStories.map((story, index) => (
        <ExpandableItem 
          key={`story-${index}`} 
          title={story.title} 
          content={story.content} 
          owner= {story.owner}
          itemType="successStory"
        />
      ))}
    </ScrollView>

    <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {formMode === 'tip' ? 'Add Tip' : 'Add Success Story'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter title"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              placeholder="Enter content/description"
              value={newContent}
              onChangeText={setNewContent}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCloseForm}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleAddItem}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "transparent",
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
  },
  expandableItem: {
    backgroundColor: '#f1f1f1',
    marginVertical: 5,
    marginHorizontal: 16,
    borderRadius: 5,
  },
  itemContentContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#888',
  },
  addButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 10,
    color: "#fff",
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
    color: "#ddd",
  },
  members: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  subcontainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 10,
  },
  itemContainer: {
    backgroundColor: '#f1f1f1',
    marginVertical: 5,
    borderRadius: 5,
  },
  titleOwnerContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  voteButtonsContainer: {
    flexDirection: "row",
    gap: 16, // or use marginRight on each button if you prefer
  },
  voteButton: {
    backgroundColor: "#eee",
    borderRadius: 4,
    padding: 6,
  },
  voteButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  owner: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#555",
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  itemContent: {
    fontSize: 14,
    color: '#333',
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrow: {
    fontSize: 16,
    marginRight: 4,
  },
});
