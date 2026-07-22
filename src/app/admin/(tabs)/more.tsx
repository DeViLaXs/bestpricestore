import type { JSX } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import {
  MapPin,
  ChevronLeft,
  LogOut,
  Shield,
  Phone,
  Tag,
  Settings,
  User,
  Users,
  CornerUpLeft,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../../hooks/useAuth";
import { useAlert } from "../../../contexts/AlertContext";

export default function AdminMoreScreen(): JSX.Element {
  const { user, logoutMutation } = useAuth();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();

  const handleLogout = async () => {
    showAlert("تسجيل الخروج", "هل أنت متأكد من رغبتك في تسجيل الخروج؟", [
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
    ]);
  };

  const safeTop = insets.top > 0 ? insets.top : 47;

  return (
    <View className="flex-1 bg-[#f8fafd]">
      <StatusBar style="light" />

      {/* Clean Blue Header Banner */}
      <View className="bg-[#0F4C92]" style={{ paddingTop: safeTop }}>
        <View className="flex-row-reverse items-center px-6 py-2.5">
          <Text className="text-lg font-bold text-white text-right">المزيد</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 90, // extra padding for bottom tabs
        }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Profile Card Section */}
        <View className="bg-white rounded-2xl mx-4 p-4 shadow-sm border border-gray-100/80 items-center mt-4 mb-4">
          {/* Admin Avatar Default Icon */}
          <View className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 items-center justify-center mb-2">
            <User size={28} className="text-gray-400" />
          </View>

          {/* Profile Details */}
          <Text className="font-extrabold text-gray-900 text-base text-center">
            {user?.fullName || "المسؤول"}
          </Text>
          <Text className="text-gray-400 text-[10px] font-bold mt-0.5 text-center">
            مسؤول النظام
          </Text>

          {/* Contact Details Pill */}
          <View className="flex-row items-center justify-center gap-1.5 mt-2.5 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            <MapPin size={11} color="#718096" />
            <Text className="text-gray-500 text-[10px] font-bold">
              {user?.location || "لم يتم تحديد الموقع"}
            </Text>
            <Text className="text-gray-300 text-xs">|</Text>
            <Phone size={11} color="#718096" />
            <Text className="text-gray-500 text-[10px] font-bold">{user?.phone}</Text>
          </View>
        </View>

        {/* Menu Items Container Card */}
        <View className="bg-white rounded-2xl mx-4 shadow-sm border border-gray-100/80 mb-4 overflow-hidden">
          <Text className="text-right text-sm font-extrabold text-gray-900 px-4 pt-4 pb-2">
            إعدادات التحكم والنظام
          </Text>

          {/* 1. Edit Profile Details */}
          <TouchableOpacity
            onPress={() => router.push("/admin/profile")}
            className="flex-row-reverse items-center justify-between p-3.5 border-b border-gray-50 active:bg-gray-50"
            activeOpacity={0.7}
          >
            <View className="flex-row-reverse items-center">
              <View className="w-8 h-8 rounded-xl bg-[#0F4C92]/10 items-center justify-center">
                <Shield size={16} color="#0F4C92" />
              </View>
              <Text className="font-bold text-gray-800 text-xs text-right mr-2.5">
                تعديل بيانات الحساب
              </Text>
            </View>
            <ChevronLeft size={16} color="#a0aec0" />
          </TouchableOpacity>

          {/* 2. Manage Categories */}
          <TouchableOpacity
            onPress={() => router.push("/admin/categories")}
            className="flex-row-reverse items-center justify-between p-3.5 border-b border-gray-50 active:bg-gray-50"
            activeOpacity={0.7}
          >
            <View className="flex-row-reverse items-center">
              <View className="w-8 h-8 rounded-xl bg-[#0F4C92]/10 items-center justify-center">
                <Tag size={16} color="#0F4C92" />
              </View>
              <Text className="font-bold text-gray-800 text-xs text-right mr-2.5">
                إدارة الفئات
              </Text>
            </View>
            <ChevronLeft size={16} color="#a0aec0" />
          </TouchableOpacity>

          {/* 3. Manage Representatives */}
          <TouchableOpacity
            onPress={() => router.push("/admin/representatives")}
            className="flex-row-reverse items-center justify-between p-3.5 border-b border-gray-50 active:bg-gray-50"
            activeOpacity={0.7}
          >
            <View className="flex-row-reverse items-center">
              <View className="w-8 h-8 rounded-xl bg-[#0F4C92]/10 items-center justify-center">
                <Users size={16} color="#0F4C92" />
              </View>
              <Text className="font-bold text-gray-800 text-xs text-right mr-2.5">
                إدارة المندوبين
              </Text>
            </View>
            <ChevronLeft size={16} color="#a0aec0" />
          </TouchableOpacity>

          {/* 4. Return Products */}
          <TouchableOpacity
            onPress={() => router.push("/admin/select-return-order" as any)}
            className="flex-row-reverse items-center justify-between p-3.5 border-b border-gray-50 active:bg-gray-50"
            activeOpacity={0.7}
          >
            <View className="flex-row-reverse items-center">
              <View className="w-8 h-8 rounded-xl bg-[#0F4C92]/10 items-center justify-center">
                <CornerUpLeft size={16} color="#0F4C92" />
              </View>
              <Text className="font-bold text-gray-800 text-xs text-right mr-2.5">
                إرجاع المنتجات
              </Text>
            </View>
            <ChevronLeft size={16} color="#a0aec0" />
          </TouchableOpacity>

          {/* 3. System Settings */}
          {/* <TouchableOpacity
            onPress={() => Alert.alert("قريباً", "سيتم إضافة صفحة إعدادات النظام قريباً.")}
            className="flex-row-reverse items-center justify-between p-3.5 border-b border-gray-50 active:bg-gray-50"
            activeOpacity={0.7}
          >
            <View className="flex-row-reverse items-center">
              <View className="w-8 h-8 rounded-xl bg-gray-50 items-center justify-center">
                <Settings size={16} color="#4a5568" />
              </View>
              <Text className="font-bold text-gray-800 text-xs text-right mr-2.5">
                إعدادات النظام
              </Text>
            </View>
            <ChevronLeft size={16} color="#a0aec0" />
          </TouchableOpacity> */}

          {/* 4. Logout Section */}
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row-reverse items-center justify-between p-3.5 active:bg-red-50/50"
            activeOpacity={0.7}
          >
            <View className="flex-row-reverse items-center">
              <View className="w-8 h-8 rounded-xl bg-red-50 items-center justify-center">
                <LogOut size={16} color="#e53e3e" />
              </View>
              <Text className="font-bold text-[#e53e3e] text-xs text-right mr-2.5">
                تسجيل الخروج
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
