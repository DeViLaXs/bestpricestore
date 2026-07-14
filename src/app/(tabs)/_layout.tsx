import type { JSX } from "react";
import { useEffect } from "react";
import { Tabs, router } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Home, Store, Heart, Menu, ShoppingCart } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../hooks/useAuth";

export default function TabsLayout(): JSX.Element | null {
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated]);

  // If not authenticated, render nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => {
        const { state, descriptors, navigation } = props;
        const safeBottom = insets.bottom > 0 ? insets.bottom : 28;
        return (
          <View
            style={[
              styles.tabBarContainer,
              {
                paddingBottom: safeBottom,
                height: 64 + safeBottom,
              },
            ]}
          >
            {state.routes.map((route, index) => {
              const isFocused = state.index === index;
              const { options } = descriptors[route.key];

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  (navigation.navigate as any)({ name: route.name, merge: true });
                }
              };

              // Special center floating cart button
              if (route.name === "cart") {
                return (
                  <TouchableOpacity
                    key={route.key}
                    onPress={onPress}
                    style={styles.floatingTabButton}
                    activeOpacity={0.8}
                  >
                    <View style={styles.floatingIconContainer}>
                      <ShoppingCart size={24} color="#ffffff" />
                    </View>
                  </TouchableOpacity>
                );
              }

              let label = "";

              if (route.name === "more") {
                label = "الاعضي";
              } else if (route.name === "wishlist") {
                label = "إعاضل أعلامانة";
              } else if (route.name === "shop") {
                label = "انقتت";
              } else if (route.name === "index") {
                label = "الشاشة الرئيسية";
              }

              const activeColor = "#0c3f7c"; // Navy blue
              const inactiveColor = "#9ca3af"; // Gray

              const renderTabIcon = (routeName: string, color: string, size: number) => {
                switch (routeName) {
                  case "index":
                    return <Home color={color} size={size} />;
                  case "shop":
                    return <Store color={color} size={size} />;
                  case "wishlist":
                    return <Heart color={color} size={size} />;
                  case "more":
                    return <Menu color={color} size={size} />;
                  default:
                    return <Home color={color} size={size} />;
                }
              };

              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  style={styles.tabButton}
                  activeOpacity={0.7}
                >
                  {renderTabIcon(route.name, isFocused ? activeColor : inactiveColor, 22)}
                  <Text
                    style={[styles.tabLabel, { color: isFocused ? activeColor : inactiveColor }]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      }}
    >
      <Tabs.Screen
        name="more"
        options={{
          title: "الاعضي",
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "إعاضل أعلامانة",
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "سلة",
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "انقتت",
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "الشاشة الرئيسية",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  floatingTabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  floatingIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0c3f7c", // Navy blue
    alignItems: "center",
    justifyContent: "center",
    marginTop: -32, // Floats it above the tab bar
    shadowColor: "#0c3f7c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 4,
    borderColor: "#ffffff",
  },
});
