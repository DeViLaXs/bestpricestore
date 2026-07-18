import type { JSX } from "react";
import { useEffect } from "react";
import { Tabs, router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { Home, Store, ClipboardList, User, ShoppingCart } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

export default function TabsLayout(): JSX.Element | null {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const insets = useSafeAreaInsets();
  const cartItemsCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  // Redirect to login if user is not authenticated (only after hydration is complete)
  const hydrated = useAuthStore((state) => state.hydrated);

  useEffect(() => {
    if (hydrated) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (isAdmin) {
        router.replace("/admin/dashboard");
      } else if (user && !user.isActive) {
        router.replace("/pending");
      }
    }
  }, [hydrated, isAuthenticated, isAdmin, user]);

  // If not hydrated, not authenticated, or admin/inactive, render nothing while redirecting
  if (!hydrated || !isAuthenticated || isAdmin || (user && !user.isActive)) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => {
        const { state, navigation } = props;
        const safeBottom = insets.bottom > 0 ? insets.bottom : 28;
        return (
          <View
            className="flex-row bg-white border-t border-gray-100 shadow-lg items-center justify-between absolute bottom-0 left-0 right-0 px-3 rounded-t-[28px]"
            style={{
              paddingBottom: safeBottom,
              height: 62 + safeBottom,
            }}
          >
            {state.routes.map((route, index) => {
              const isFocused = state.index === index;

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
                    className="flex-1 items-center justify-center z-[999]"
                    activeOpacity={0.8}
                  >
                    <View className="w-14 h-14 rounded-full bg-[#0F4C92] items-center justify-center -mt-8 border-4 border-white shadow-lg relative">
                      <ShoppingCart size={24} color="#ffffff" />
                      {cartItemsCount > 0 && (
                        <View className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full min-w-5 h-5 px-1 items-center justify-center border-2 border-white">
                          <Text className="text-white text-[9px] font-black text-center">
                            {cartItemsCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }

              let label = "";

              if (route.name === "profile") {
                label = "الملف الشخصي";
              } else if (route.name === "orders") {
                label = "طلباتي";
              } else if (route.name === "shop") {
                label = "المتجر";
              } else if (route.name === "index") {
                label = "الشاشة الرئيسية";
              }

              const activeColor = "#0F4C92"; // Blue active tab color
              const inactiveColor = "#9ca3af"; // Gray

              const renderTabIcon = (routeName: string, color: string, size: number) => {
                switch (routeName) {
                  case "index":
                    return <Home color={color} size={size} />;
                  case "shop":
                    return <Store color={color} size={size} />;
                  case "orders":
                    return <ClipboardList color={color} size={size} />;
                  case "profile":
                    return <User color={color} size={size} />;
                  default:
                    return <Home color={color} size={size} />;
                }
              };

              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  className="flex-1 items-center justify-center pt-2"
                  activeOpacity={0.7}
                >
                  {renderTabIcon(route.name, isFocused ? activeColor : inactiveColor, 22)}
                  <Text
                    className="text-[10px] font-semibold mt-1 text-center"
                    style={{ color: isFocused ? activeColor : inactiveColor }}
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
        name="profile"
        options={{
          title: "الملف الشخصي",
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "طلباتي",
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
          title: "المتجر",
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
