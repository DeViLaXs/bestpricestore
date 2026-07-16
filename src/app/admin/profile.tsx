import type { JSX } from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  MapPin,
  ChevronLeft,
  LogOut,
  Shield,
  Phone,
  User,
  ArrowLeft,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
import { userService } from "../../services/user.service";

export default function AdminProfileScreen(): JSX.Element {
  const { user, isAdmin, logoutMutation } = useAuth();
  const insets = useSafeAreaInsets();

  // Route guard: only allow users with Admin role or credentials
  useEffect(() => {
    if (user && !isAdmin) {
      Alert.alert("تنبيه", "عذراً، هذه الصفحة مخصصة للمسؤولين فقط.");
      router.replace("/" as any);
    }
  }, [user, isAdmin]);

  // Edit profile state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [storeName, setStoreName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleOpenEditModal = () => {
    setStoreName(user?.fullName || "");
    setPhone(user?.phone || "");
    setLocation(user?.location || "");
    setIsEditModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    if (!storeName.trim() || !phone.trim() || !location.trim()) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    setIsUpdating(true);
    try {
      await userService.updateProfile({
        storeName: storeName.trim(),
        phoneNumber: phone.trim(),
        location: location.trim(),
      });

      // Update Zustand local store state
      const setUser = useAuthStore.getState().setUser;
      if (user) {
        setUser({
          ...user,
          fullName: storeName.trim(),
          phone: phone.trim(),
          location: location.trim(),
        });
      }

      setIsEditModalVisible(false);
      Alert.alert("نجاح", "تم تحديث بيانات الملف الشخصي بنجاح.");
    } catch (error: any) {
      console.log("Profile update failed:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "فشلت عملية تحديث البيانات الشخصية. يرجى المحاولة مرة أخرى.";
      Alert.alert("خطأ", errorMsg);
    } finally {
      setIsUpdating(false);
    }
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
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Screen Header with Back Arrow on Left, Title in Center/Right */}
        <View className="h-16 flex-row items-center justify-between px-6 mb-6">
          <TouchableOpacity
            onPress={() => router.replace("/admin/representatives")}
            className="p-1"
            activeOpacity={0.7}
          >
            <ArrowLeft size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-extrabold tracking-tight text-center flex-1 mr-8">
            الملف الشخصي
          </Text>
        </View>

        {/* Profile Card Section */}
        <View className="bg-white rounded-3xl mx-5 p-5 shadow-md border border-gray-50 items-center relative mt-8 mb-6 pt-16">
          {/* Admin Avatar */}
          <Image
            source={require("../../../assets/images/admin_avatar.jpg")}
            className="w-28 h-28 rounded-full border-4 border-white absolute -top-14 shadow-lg bg-white"
            resizeMode="center"
          />

          {/* Profile Details */}
          <Text className="font-extrabold text-gray-900 text-xl text-center mt-2">
            {user?.fullName || "المسؤول"}
          </Text>
          <Text className="text-gray-400 text-xs font-semibold mt-1 text-center">
            مسؤول النظام
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

          {/* 1. Account Protection (Update Profile Details) */}
          <TouchableOpacity
            onPress={handleOpenEditModal}
            className="flex-row-reverse items-center justify-between p-4 border-b border-gray-50 active:bg-gray-50"
            activeOpacity={0.7}
          >
            <View className="flex-row-reverse items-center">
              <View className="w-9 h-9 rounded-2xl bg-blue-50/70 items-center justify-center">
                <Shield size={18} color="#0c3f7c" />
              </View>
              <Text className="font-bold text-gray-800 text-sm text-right mr-3">
                تعديل بيانات الحساب
              </Text>
            </View>
            <ChevronLeft size={18} color="#a0aec0" />
          </TouchableOpacity>

          

          {/* 3. Logout Action Section */}
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
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal Sheet */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-white rounded-t-[32px] p-6 shadow-xl border-t border-gray-100">
            {/* Header */}
            <View className="flex-row-reverse items-center justify-between mb-6 pb-2 border-b border-gray-100">
              <Text className="font-black text-gray-900 text-lg text-right">
                تعديل بيانات الحساب
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                className="p-1"
              >
                <Text className="text-gray-400 font-bold text-sm">إلغاء</Text>
              </TouchableOpacity>
            </View>

            {/* Form Inputs */}
            <View className="gap-4 mb-6">
              {/* Store Name Input */}
              <View className="gap-1.5">
                <Text className="text-gray-500 font-bold text-xs text-right mr-1">
                  اسم المتجر
                </Text>
                <View className="flex-row-reverse items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5">
                  <User size={18} color="#a0aec0" />
                  <TextInput
                    value={storeName}
                    onChangeText={setStoreName}
                    placeholder="أدخل اسم المتجر"
                    placeholderTextColor="#a0aec0"
                    textAlign="right"
                    className="flex-1 mr-3 text-gray-800 font-semibold text-sm py-1"
                  />
                </View>
              </View>

              {/* Phone Number Input */}
              <View className="gap-1.5">
                <Text className="text-gray-500 font-bold text-xs text-right mr-1">
                  رقم الهاتف
                </Text>
                <View className="flex-row-reverse items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5">
                  <Phone size={18} color="#a0aec0" />
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="أدخل رقم الهاتف"
                    placeholderTextColor="#a0aec0"
                    keyboardType="phone-pad"
                    textAlign="right"
                    className="flex-1 mr-3 text-gray-800 font-semibold text-sm py-1"
                  />
                </View>
              </View>

              {/* Location Input */}
              <View className="gap-1.5">
                <Text className="text-gray-500 font-bold text-xs text-right mr-1">
                  الموقع
                </Text>
                <View className="flex-row-reverse items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5">
                  <MapPin size={18} color="#a0aec0" />
                  <TextInput
                    value={location}
                    onChangeText={setLocation}
                    placeholder="أدخل موقع المتجر"
                    placeholderTextColor="#a0aec0"
                    textAlign="right"
                    className="flex-1 mr-3 text-gray-800 font-semibold text-sm py-1"
                  />
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleUpdateProfile}
              disabled={isUpdating}
              className="bg-[#0c3f7c] rounded-2xl py-3.5 items-center justify-center mb-2 shadow-md active:opacity-90"
              activeOpacity={0.9}
            >
              {isUpdating ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text className="text-white font-extrabold text-sm">
                  حفظ التغييرات
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
