import type { JSX } from "react";
import { useEffect } from "react";
import { Tabs, router } from "expo-router";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Home, ClipboardList, LayoutGrid, MoreHorizontal, Plus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../hooks/useAuth";
import { useAuthStore } from "../../../store/authStore";

export default function AdminTabsLayout(): JSX.Element | null {
  const { isAuthenticated, isAdmin } = useAuth();
  const insets = useSafeAreaInsets();
  const hydrated = useAuthStore((state) => state.hydrated);

  // Route protection
  useEffect(() => {
    if (hydrated) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (!isAdmin) {
        router.replace("/" as any);
      }
    }
  }, [hydrated, isAuthenticated, isAdmin]);

  if (!hydrated || !isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => {
        const { state, navigation } = props;
        const safeBottom = insets.bottom > 0 ? insets.bottom : 20;

        const activeColor = "#0F4C92"; // Blue active tab color
        const inactiveColor = "#9ca3af"; // Gray inactive color

        const renderTabIcon = (
          routeName: string,
          color: string,
          size: number,
          isFocused: boolean
        ) => {
          switch (routeName) {
            case "dashboard":
              return <Home color={color} size={size} />;
            case "orders":
              return <ClipboardList color={color} size={size} />;
            case "products":
              return <LayoutGrid color={color} size={size} />;
            case "more":
              return <MoreHorizontal color={color} size={size} />;
            default:
              return <Home color={color} size={size} />;
          }
        };

        const getLabel = (routeName: string): string => {
          switch (routeName) {
            case "dashboard":
              return "الرئيسية";
            case "orders":
              return "الطلبات";
            case "products":
              return "المنتجات";
            case "more":
              return "المزيد";
            default:
              return "";
          }
        };

        const tabItems: React.ReactNode[] = [];

        state.routes.forEach((route, index) => {
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

          // Insert the blue plus button in the middle (before Products which is index 2)
          if (index === 2) {
            tabItems.push(
              <TouchableOpacity
                key="add-product-fab"
                onPress={() => router.push("/admin/add-product" as any)}
                className="flex-1 items-center justify-center z-[999]"
                activeOpacity={0.8}
              >
                <View className="w-13 h-13 rounded-full bg-[#0F4C92] items-center justify-center -mt-6 border-4 border-white shadow-md">
                  <Plus size={22} color="#ffffff" />
                </View>
              </TouchableOpacity>
            );
          }

          tabItems.push(
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className="flex-1 items-center justify-center pt-2"
              activeOpacity={0.7}
            >
              {renderTabIcon(route.name, isFocused ? activeColor : inactiveColor, 22, isFocused)}
              <Text
                className="text-[11px] font-bold mt-1 text-center"
                style={{ color: isFocused ? activeColor : inactiveColor }}
              >
                {getLabel(route.name)}
              </Text>
            </TouchableOpacity>
          );
        });

        return (
          <View
            className="flex-row-reverse bg-white border-t border-gray-100 shadow-lg items-center justify-between absolute bottom-0 left-0 right-0 px-2 rounded-t-[28px]"
            style={{
              paddingBottom: safeBottom,
              height: 62 + safeBottom,
            }}
          >
            {tabItems}
          </View>
        );
      }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="products" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}
