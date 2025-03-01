import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";

/**
 * Protect routes from access by unauthenticated users
 */
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); 
  }, []);

  if (!isMounted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Define public routes
  const publicRoutes = ["/", "/register"];

  // Redirect unauthenticated users
  if (!isAuthenticated && !publicRoutes.includes("/" + segments[0])) {
    router.replace("/");
    return null;
  }

  return <>{children}</>;
};
