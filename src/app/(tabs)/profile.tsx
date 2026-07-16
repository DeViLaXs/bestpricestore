import type { JSX } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import {
  MapPin,
  ChevronLeft,
  LogOut,
  Phone,
  Package,
} from "lucide-react-native";
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
              console.log("Logout failed:", err);
            }
          },
        },
      ],
      { cancelable: true }
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

      {/* Decorative Blue Top Background Block */}
      <View className="bg-[#0c3f7c] h-56 w-full absolute top-0 left-0 right-0" />

      <ScrollView
        contentContainerStyle={{
          paddingTop: safeTop + 8,
          paddingBottom: 110, // Avoid overlapping floating cart/tabbar
        }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Screen Title Header */}
        <View className="h-16 justify-center items-center mb-6">
          <Text className="text-white text-xl font-extrabold tracking-tight text-center">
            الملف الشخصي
          </Text>
        </View>

        {/* Profile Card Section */}
        <View className="bg-white rounded-3xl mx-5 p-5 shadow-md border border-gray-50 items-center relative mt-8 mb-6 pt-16">
          {/* Styled Avatar centered and absolute positioned overlapping the card top */}
          <View className="w-28 h-28 bg-[#edf3fa] rounded-full items-center justify-center border-4 border-white absolute -top-14 shadow-lg">
            <Text className="text-[#0c3f7c] font-black text-3xl">
              {getInitials(user?.fullName || "")}
            </Text>
          </View>

          {/* Profile Details */}
          <Text className="font-extrabold text-gray-900 text-xl text-center mt-2">
            {user?.fullName || "مندوب"}
          </Text>
          <Text className="text-gray-400 text-xs font-semibold mt-1 text-center">
            مندوب متجر
          </Text>

          {/* Contact Details Pill */}
          <View className="flex-row items-center justify-center gap-1.5 mt-3.5 bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-100">
            <MapPin size={13} color="#718096" />
            <Text className="text-gray-500 text-xs font-semibold">
              {user?.location || "لم يتم تحديد الموقع"}
            </Text>
            <Text className="text-gray-300">|</Text>
            <Phone size={13} color="#718096" />
            <Text className="text-gray-500 text-xs font-semibold">
              {user?.phone}
            </Text>
          </View>
        </View>

        {/* Menu Items Container Card */}
        <View className="bg-white rounded-3xl mx-5 shadow-md border border-gray-50 mb-6 overflow-hidden">
          <Text className="text-right text-base font-black text-gray-900 px-5 pt-5 pb-2">
            إعدادات الحساب
          </Text>

          {/* My Orders Action Section */}
          <TouchableOpacity
            onPress={() => router.push("/orders")}
            className="flex-row-reverse items-center justify-between p-4 border-b border-gray-100 active:bg-blue-50"
            activeOpacity={0.7}
          >
            <View className="flex-row-reverse items-center">
              <View className="w-9 h-9 rounded-2xl bg-blue-50 items-center justify-center">
                <Package size={18} color="#0c3f7c" />
              </View>
              <Text className="font-bold text-gray-800 text-sm text-right mr-3">
                طلباتي
              </Text>
            </View>
            <ChevronLeft size={18} color="#a0aec0" />
          </TouchableOpacity>

          {/* Logout Action Section */}
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row-reverse items-center justify-between p-4 active:bg-red-50"
            activeOpacity={0.7}
          >
            <View className="flex-row-reverse items-center">
              <View className="w-9 h-9 rounded-2xl bg-red-50 items-center justify-center">
                <LogOut size={18} color="#e53e3e" />
              </View>
              <Text className="font-bold text-[#e53e3e] text-sm text-right mr-3">
                تسجيل الخروج
              </Text>
            </View>
            <ChevronLeft size={18} color="#a0aec0" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
