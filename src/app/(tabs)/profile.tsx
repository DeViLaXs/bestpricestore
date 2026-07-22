import type { JSX } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MapPin, ChevronLeft, LogOut, Phone, Package } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../hooks/useAuth";
import { useAlert } from "../../contexts/AlertContext";

export default function MoreScreen(): JSX.Element {
  const { user, logoutMutation } = useAuth();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    showAlert(
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
              console.log("Logout failed:", err);
            }
          },
        },
      ]
    );
  };

  // Initials for avatar fallback
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
    <View className="flex-1 bg-[#f8fafd]">
      <StatusBar style="light" />

      {/* Clean Blue Header Banner */}
      <View className="bg-[#0F4C92]" style={{ paddingTop: safeTop }}>
        <View className="flex-row-reverse items-center px-6 py-2.5">
          <Text className="text-lg font-bold text-white text-right">الملف الشخصي</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 110,
          paddingTop: 24,
        }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Profile Card Section */}
        <View className="bg-white rounded-3xl mx-5 shadow-sm border border-gray-100 items-center pt-10 pb-5 px-5 mb-5">
          {/* Avatar */}
          <View className="w-20 h-20 bg-[#edf3fa] rounded-full items-center justify-center border-2 border-[#0F4C92]/20 mb-3">
            <Text className="text-[#0F4C92] font-black text-2xl">
              {getInitials(user?.fullName || "")}
            </Text>
          </View>

          {/* Name and role */}
          <Text className="font-extrabold text-gray-900 text-lg text-center">
            {user?.fullName || "مندوب"}
          </Text>
          <Text className="text-gray-400 text-xs font-semibold mt-0.5 text-center">مندوب متجر</Text>

          {/* Contact Details Pill */}
          <View className="flex-row items-center justify-center gap-1.5 mt-4 bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-100">
            <MapPin size={13} color="#718096" />
            <Text className="text-gray-500 text-xs font-semibold">
              {user?.location || "لم يتم تحديد الموقع"}
            </Text>
            <Text className="text-gray-300">|</Text>
            <Phone size={13} color="#718096" />
            <Text className="text-gray-500 text-xs font-semibold">{user?.phone}</Text>
          </View>
        </View>

        {/* Account Settings Card */}
        <View className="bg-white rounded-3xl mx-5 shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <Text className="text-right text-sm font-black text-gray-400 px-5 pt-4 pb-1">
            إعدادات الحساب
          </Text>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row-reverse items-center justify-between px-5 py-3.5 active:bg-red-50/50"
            activeOpacity={0.7}
          >
            <View className="flex-row-reverse items-center gap-3">
              <View className="w-9 h-9 rounded-2xl bg-red-50 items-center justify-center">
                <LogOut size={18} color="#e53e3e" />
              </View>
              <Text className="font-bold text-rose-600 text-sm text-right">تسجيل الخروج</Text>
            </View>
            <ChevronLeft size={18} color="#a0aec0" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
