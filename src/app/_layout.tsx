import type { JSX } from "react";
import { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";
import CustomSplashScreen from "../components/CustomSplashScreen";

import "../global.css";

// Prevent the native splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn("Prevent auto-hide of native splash screen failed:", err);
});

const queryClient = new QueryClient();

const heroUIConfig = {
  devInfo: {
    stylingPrinciples: false,
  },
};

export default function RootLayout(): JSX.Element {
  const [isAssetsReady, setIsAssetsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const hydrated = useAuthStore((state) => state.hydrated);

  useEffect(() => {
    async function prepareApp() {
      try {
        // Perform any essential initializations (e.g. assets loading) here.
        // We simulate a short delay to ensure assets are ready.
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (e) {
        console.warn("Error during app preparation:", e);
      } finally {
        setIsAssetsReady(true);
      }
    }

    prepareApp();
  }, []);

  const isAppReady = isAssetsReady && hydrated;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <HeroUINativeProvider config={heroUIConfig}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="pending" />
              <Stack.Screen name="admin/representatives" />
              <Stack.Screen name="admin/categories" />
              <Stack.Screen name="(tabs)" />
            </Stack>
            <StatusBar style="auto" />

            {showSplash && (
              <CustomSplashScreen
                isReady={isAppReady}
                onAnimationComplete={() => {
                  setShowSplash(false);
                  
                  // Auto-login redirection based on persisted state
                  const { token, user } = useAuthStore.getState();
                  if (token && user) {
                    if (user.role === "Admin") {
                      router.replace("/admin/representatives");
                    } else if (user.isActive) {
                      router.replace("/" as any);
                    } else {
                      router.replace("/pending");
                    }
                  } else {
                    router.replace("/login");
                  }
                }}
              />
            )}
          </HeroUINativeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
