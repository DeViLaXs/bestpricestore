import type { JSX } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from "react-native";
import { MapPin, Users, ChevronLeft, Info, LogOut } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../hooks/useAuth";

export default function MoreScreen(): JSX.Element {
  const { user, logoutMutation } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    Alert.alert(
      "تسجيل الخروج",
      "هل أنت متأكد من رغبتك في تسجيل الخروج؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "خروج",
          style: "destructive",
          onPress: async () => {
            try {
              await logoutMutation.mutateAsync();
              router.replace("/login");
            } catch (err) {
              console.error("Logout failed:", err);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Check if the user has admin role or admin identifier
  const isAdmin =
    user?.role?.toLowerCase() === "admin" ||
    user?.fullName?.toLowerCase() === "admin" ||
    user?.phone === "777777777" ||
    user?.phone === "773124470";

  // Initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const safeTop = insets.top > 0 ? insets.top : 47;

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafd" }}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: safeTop + 16,
          paddingBottom: 110, // Avoid overlapping the floating cart button tab bar
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Section */}
        <View style={styles.profileCard} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50 flex-row-reverse items-center justify-between mb-6">
          <View className="flex-row-reverse items-center gap-4">
            {/* Styled Avatar circle */}
            <View className="w-14 h-14 bg-[#edf3fa] rounded-full items-center justify-center border border-[#e2ecf7]">
              <Text className="text-[#0c3f7c] font-black text-lg">
                {getInitials(user?.fullName || "")}
              </Text>
            </View>

            {/* Profile Text Details */}
            <View className="items-end">
              <Text className="font-extrabold text-gray-900 text-lg text-right">
                {user?.fullName || "مستخدم"}
              </Text>
              <Text className="text-gray-400 text-xs font-semibold mt-0.5 text-right">
                {user?.phone}
              </Text>
              {user?.location && (
                <View className="flex-row-reverse items-center gap-1 mt-1">
                  <MapPin size={12} color="#a0aec0" />
                  <Text className="text-gray-400 text-xs font-semibold text-right">
                    {user?.location}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Optional Role Badge */}
          {isAdmin && (
            <View className="bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              <Text className="text-amber-700 font-extrabold text-[10px]">مسؤول</Text>
            </View>
          )}
        </View>

        {/* Menu Items Title */}
        <Text className="text-right text-base font-bold text-gray-800 mb-3 px-1">
          خيارات الحساب
        </Text>

        {/* Menu List Container */}
        <View className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-50 mb-6">
          {/* Admin Management Section */}
          {isAdmin && (
            <>
              <TouchableOpacity
                onPress={() => router.push("/admin/representatives")}
                className="flex-row-reverse items-center justify-between p-4 border-b border-gray-100 active:bg-gray-50"
                activeOpacity={0.7}
              >
                <View className="flex-row-reverse items-center gap-3">
                  <View className="w-9 h-9 rounded-2xl bg-blue-50 items-center justify-center">
                    <Users size={18} color="#0c3f7c" />
                  </View>
                  <Text className="font-bold text-gray-800 text-sm text-right">إدارة المندوبين</Text>
                </View>
                <ChevronLeft size={18} color="#a0aec0" />
              </TouchableOpacity>
            </>
          )}

          {/* App Info Item */}
          <View
            style={{ minHeight: 52 }}
            className="flex-row-reverse items-center justify-between p-4 border-b border-gray-100"
          >
            <View className="flex-row-reverse items-center gap-3">
              <View className="w-9 h-9 rounded-2xl bg-gray-50 items-center justify-center">
                <Info size={18} color="#a0aec0" />
              </View>
              <Text className="font-bold text-gray-800 text-sm text-right">إصدار التطبيق</Text>
            </View>
            <Text className="text-gray-400 font-bold text-xs">v1.0.0</Text>
          </View>

          {/* Logout Action Item */}
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row-reverse items-center justify-between p-4 active:bg-red-50"
            activeOpacity={0.7}
          >
            <View className="flex-row-reverse items-center gap-3">
              <View className="w-9 h-9 rounded-2xl bg-red-50 items-center justify-center">
                <LogOut size={18} color="#e53e3e" />
              </View>
              <Text className="font-bold text-danger text-sm text-right">تسجيل الخروج</Text>
            </View>
            <ChevronLeft size={18} color="#a0aec0" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    // Add soft native shadow fallback
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
});
