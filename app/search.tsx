import React, { useState, useEffect } from "react";
import {
  Alert,
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { fetchGoals, Goals, CreateGoals } from "./api/goalsApi";
import { GoalItem } from "./components/GoalItem";
import { useAuth } from "./contexts/AuthContext";

/**
 * Render the search 
 */

export default function SearchGoalsScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [goals, setGoals] = useState<Goals[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [query, setQuery] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");

  const totalPages = Math.ceil(total / limit);

  const loadGoals = async (
    pageNumber: number,
    newQuery: string,
    replace = false
  ) => {
    setLoading(true);
    try {
      const data = await fetchGoals(pageNumber, limit, newQuery, token);
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
    router.push("/search");
  };

  useEffect(() => {
    loadGoals(1, "", true);
  }, []);

  const handleSearch = () => {
    setPage(1);
    loadGoals(1, query, true);
  };

  const handleCreate = async () => {
    if (!token) return;
    try {
      await CreateGoals(newGoalName, newGoalDescription, token);
      Alert.alert(
        "Success",
        "You created the goal. It will remain pending until it gets 2 votes."
      );
      setModalVisible(false);
      reload();
    } catch (error) {
      console.error("Create goal error:", error);
      Alert.alert("Error", "Failed to create a goal.");
    }
  };

  const handleLoadMore = () => {
    if (!loading && page < totalPages) {
      loadGoals(page + 1, query, false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadGoals(1, query, true);
  };

  const handleOpenForm = () => {
    setNewGoalName("");
    setNewGoalDescription("");
    setModalVisible(true);
  };

  const handleCloseForm = () => {
    setModalVisible(false);
  };

  const renderGoal = ({ item }: { item: Goals }) => (
    <GoalItem item={item} token={token} reload={reload} />
  );

  return (
    <View style={styles.screen}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Search Goals</Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search goals..."
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleOpenForm}>
          <Text style={styles.createButtonText}>+ Create Your Own</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
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
              <ActivityIndicator
                size="large"
                color="#95c427"
                style={{ margin: 16 }}
              />
            ) : null
          }
        />

        {loading && page === 1 && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#95c427" />
          </View>
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create Goal</Text>

            <TextInput
              style={[styles.modalInput, { height: 50 }]}
              placeholder="Enter Title"
              placeholderTextColor="#888"
              multiline
              value={newGoalName}
              onChangeText={setNewGoalName}
            />

            <TextInput
              style={[styles.modalInput, { height: 80 }]}
              placeholder="Enter Description"
              placeholderTextColor="#888"
              multiline
              value={newGoalDescription}
              onChangeText={setNewGoalDescription}
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
                onPress={handleCreate}
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
  screen: {
    flex: 1,
    backgroundColor: "#edf5f0",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  loadingOverlay: {
    position: "absolute",
    alignSelf: "center",
    top: "50%",
  },

  headerContainer: {
    backgroundColor: "#95c427",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginRight: 8,
    color: "#333",
  },
  searchButton: {
    backgroundColor: "#FFA000",
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  createButton: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    alignItems: "center",
    padding: 10,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#fff",

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
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
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
