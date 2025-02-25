import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import Constants from "expo-constants";
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        userName,
        email,
        password,
      });
      router.replace("/");
    } catch (error: any) {
      console.error("Register error:", error);
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred";
      Alert.alert("Registration Failed", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Register" onPress={handleRegister} color="#4CAF50" />
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
      backgroundColor: "transparent", 
    },
    title: {
      fontSize: 24,
      marginBottom: 20,
      textAlign: "center",
      color: "#fff", 
    },
    input: {
      borderWidth: 1,
      borderColor: "#ddd",
      padding: 10,
      marginBottom: 20,
      borderRadius: 5,
      backgroundColor: "#fff", 
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
    },
  });
  