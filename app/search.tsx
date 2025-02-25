import React, { useState, useEffect } from "react";
import {
  Alert,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TouchableOpacity
} from "react-native";
import { useRouter } from "expo-router";
import { fetchGoals, Goals, CreateGoals } from "./api/goalsApi";
import { GoalItem } from "./components/GoalItem"; 
import { useAuth } from "./contexts/AuthContext";

export default function SearchGoalsScreen() {
  const router = useRouter();
  console.log("Rendering SearchGoalsScreen");

  const { token } = useAuth();
  const [goals, setGoals] = useState<Goals[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [query, setQuery] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');

  const totalPages = Math.ceil(total / limit);

  const loadGoals = async (pageNumber: number, newQuery: string, replace = false) => {
    console.log("loadGoals called with:", { pageNumber, newQuery, replace, token });
    setLoading(true);
    try {
      const data = await fetchGoals(pageNumber, limit, newQuery, token);
      console.log("fetchGoals returned:", data);

      if (replace || pageNumber === 1) {
        setGoals(data.goals);
      } else {
        setGoals((prev) => [...prev, ...data.goals]);
      }
      setPage(data.page);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const reload = () => {
    router.push("/search")
  }
  useEffect(() => {
    console.log("useEffect => calling loadGoals(1, '', true)");
    loadGoals(1, "", true);
  }, []);

  const handleSearch = () => {
    console.log("handleSearch => resetting to page 1 with query:", query);
    setPage(1);
    loadGoals(1, query, true);
  };

  const handleCreate = async () => {
    if (!token) return;
    try {
      await CreateGoals(newGoalName, newGoalDescription, token);
      Alert.alert("Success", "You created the goal. It will now be on pending untill it gets 2 votes.");
      reload()
    } catch (error) {
      console.error("Create goal error:", error);
      Alert.alert("Error", "Failed to create a goal.");
    }
  };

  const handleLoadMore = () => {
    if (!loading && page < totalPages) {
      console.log("handleLoadMore => next page:", page + 1);
      loadGoals(page + 1, query, false);
    }
  };

  const onRefresh = async () => {
    console.log("Pull to refresh => reset page to 1");
    setRefreshing(true);
    setPage(1);
    await loadGoals(1, query, true);
  };

  const handleOpenForm = () => {
    setNewGoalName('');
    setNewGoalDescription('');
    setModalVisible(true);
  };

  // Closes the modal
  const handleCloseForm = () => {
    setModalVisible(false);
  };

  const renderGoal = ({ item }: { item: Goals }) => <GoalItem item={item} token ={token} reload = {reload} />;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search goals..."
          value={query}
          onChangeText={setQuery}
        />
        <Button title="Search" onPress={handleSearch} />
      </View>

      <View style={styles.searchContainer}>
        <Button title="Create Your own" onPress={handleOpenForm} />
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Create Group
            </Text>

            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              placeholder="Enter Title"
              value={newGoalName}
              onChangeText={setNewGoalName}
            />

            <TextInput
              style={styles.input}
              placeholder="Enter Content/Description"
              value={newGoalDescription}
              onChangeText={setNewGoalDescription}
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
                onPress={handleCreate}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderGoal}
        onEndReachedThreshold={0.5}
        onEndReached={handleLoadMore}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={
          loading && page < totalPages ? (
            <ActivityIndicator size="large" color="#0000ff" style={{ margin: 16 }} />
          ) : null
        }
      />

      {loading && page === 1 && (
        <ActivityIndicator size="large" color="blue" style={styles.spinnerOverlay} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    searchContainer: {
      marginTop: 50,
      flexDirection: "row",
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#ccc",
      marginRight: 8,
      paddingHorizontal: 8,
      borderRadius: 4,
    },
    goalItem: {
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },
    goalnName: {
      fontSize: 16,
      fontWeight: "bold",
    },
    goalDescription: {
      fontSize: 14,
      color: "#666",
    },
    spinnerOverlay: {
      position: "absolute",
      top: "50%",
      left: "45%",
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
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
    },
  });