import type { JSX } from "react";
import { useEffect, useState } from "react";
import { Stack, router, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";
import CustomSplashScreen from "../components/CustomSplashScreen";
import { getUserRole } from "../hooks/useAuth";
import { AlertProvider, useAlert } from "../contexts/AlertContext";

import "../global.css";

// Prevent the native splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn("Prevent auto-hide of native splash screen failed:", err);
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds cache fresh time
      refetchOnWindowFocus: false, // Not needed for mobile/React Native
    },
  },
});

const heroUIConfig = {
  devInfo: {
    stylingPrinciples: false,
  },
};

/**
 * Inner navigator component — must be rendered INSIDE AlertProvider
 * so that useAlert() can access the context.
 */
function AppNavigator(): JSX.Element {
  const [isAssetsReady, setIsAssetsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const hydrated = useAuthStore((state) => state.hydrated);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const { showAlert } = useAlert();

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

  useEffect(() => {
    if (!isAppReady) return;

    const role = getUserRole(user);
    const isAdminRoute = pathname.startsWith("/admin");
    const isAuthRoute = pathname === "/login" || pathname === "/register";
    const isPendingRoute = pathname === "/pending";

    if (!token || !user) {
      if (!isAuthRoute) {
        router.replace("/login");
      }
      return;
    }

    if (role === "admin") {
      if (!isAdminRoute) {
        router.replace("/admin/dashboard");
      }
      return;
    }

    if (role === "representative") {
      const representativeRoute = user.isActive ? ("/" as any) : "/pending";

      if (isAdminRoute || isAuthRoute || (!user.isActive && !isPendingRoute)) {
        if (isAdminRoute) {
          showAlert("تنبيه", "عذراً، هذه الصفحة مخصصة للمسؤولين فقط.");
        }
        router.replace(representativeRoute);
      }
      return;
    }

    router.replace("/login");
  }, [isAppReady, pathname, token, user]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="pending" />
        <Stack.Screen name="admin/(tabs)" />
        <Stack.Screen name="admin/categories" />
        <Stack.Screen name="admin/add-product" />
        <Stack.Screen name="admin/edit-product" />
        <Stack.Screen name="admin/profile" />
        <Stack.Screen name="admin/representatives" />
        <Stack.Screen name="admin/return-products" />
        <Stack.Screen name="admin/select-return-order" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="product-details" />
      </Stack>
      <StatusBar style="auto" />

      {showSplash && (
        <CustomSplashScreen
          isReady={isAppReady}
          onAnimationComplete={() => {
            setShowSplash(false);
          }}
        />
      )}
    </>
  );
}

/**
 * Root layout — sets up all providers, then renders AppNavigator inside them.
 */
export default function RootLayout(): JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <HeroUINativeProvider config={heroUIConfig}>
            <AlertProvider>
              <AppNavigator />
            </AlertProvider>
          </HeroUINativeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
