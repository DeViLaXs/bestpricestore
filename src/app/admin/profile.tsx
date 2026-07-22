import type { JSX } from "react";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Check, MapPin, Phone, User, ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAppToast } from "../../hooks/useAppToast";
import { useAlert } from "../../contexts/AlertContext";
import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
import { useUpdateProfileMutation } from "../../hooks/useRepresentatives";

export default function AdminProfileScreen(): JSX.Element {
  const { user, isAdmin } = useAuth();
  const insets = useSafeAreaInsets();
  const { showSuccessToast } = useAppToast();
  const { showAlert } = useAlert();
  const updateProfileMutation = useUpdateProfileMutation();

  const [storeName, setStoreName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/" as any);
    }
  }, [user, isAdmin]);

  const handleUpdateProfile = async () => {
    const trimmedStoreName = storeName.trim();
    const trimmedPhone = phone.trim();
    const trimmedLocation = location.trim();

    if (!trimmedStoreName || !trimmedPhone || !trimmedLocation) {
      showAlert("خطأ", "يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    const hasChanges =
      trimmedStoreName !== (user?.fullName || "").trim() ||
      trimmedPhone !== (user?.phone || "").trim() ||
      trimmedLocation !== (user?.location || "").trim();

    if (!hasChanges) {
      showAlert("تنبيه", "لم تقم بإجراء أي تغييرات لحفظها.");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        storeName: trimmedStoreName,
        phoneNumber: trimmedPhone,
        location: trimmedLocation,
      });

      const setUser = useAuthStore.getState().setUser;
      if (user) {
        setUser({
          ...user,
          fullName: trimmedStoreName,
          phone: trimmedPhone,
          location: trimmedLocation,
        });
      }

      showSuccessToast("نجاح", "تم تحديث بيانات الملف الشخصي بنجاح.");

      router.back();
    } catch (error: any) {
      console.log("Profile update failed:", error);
      
      let errorMsg = "فشلت عملية تحديث البيانات الشخصية. يرجى المحاولة مرة أخرى.";
      if (error.response?.data) {
        const envelope = error.response.data;
        if (envelope.errors && Array.isArray(envelope.errors) && envelope.errors.length > 0) {
          errorMsg = envelope.errors.join("\n");
        } else if (envelope.data?.message) {
          errorMsg = envelope.data.message;
        } else if (envelope.message) {
          errorMsg = envelope.message;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      showAlert("خطأ", errorMsg);
    }
  };

  const safeTop = insets.top > 0 ? insets.top : 47;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f8fafd" }}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white border-b border-gray-100/50" style={{ paddingTop: safeTop }}>
        <View className="flex-row items-center justify-between px-6 py-2.5">
          <TouchableOpacity onPress={() => router.back()} className="p-1" activeOpacity={0.7}>
            <ArrowLeft size={24} color="#1a202c" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 text-right">الملف الشخصي</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Section */}
        <View className="items-center py-8">
          <View className="w-20 h-20 rounded-full bg-[#0F4C92]/10 items-center justify-center mb-3 border-2 border-[#0F4C92]/20">
            <User size={36} color="#0F4C92" />
          </View>
          <Text className="text-base font-extrabold text-gray-900">{user?.fullName || "—"}</Text>
          <Text className="text-xs text-gray-400 font-semibold mt-1">مسؤول النظام</Text>
        </View>

        {/* Form Card */}
        <View className="bg-white rounded-3xl mx-5 p-5 shadow-sm border border-gray-100/80">
          <Text className="text-right text-sm font-extrabold text-gray-900 mb-5">
            تعديل بيانات الحساب
          </Text>

          <View className="gap-4 mb-6">
            {/* Store Name */}
            <View className="gap-1.5">
              <Text className="text-gray-500 font-bold text-xs text-right mr-1">اسم المتجر</Text>
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

            {/* Phone */}
            <View className="gap-1.5">
              <Text className="text-gray-500 font-bold text-xs text-right mr-1">رقم الهاتف</Text>
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

            {/* Location */}
            <View className="gap-1.5">
              <Text className="text-gray-500 font-bold text-xs text-right mr-1">الموقع</Text>
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
            disabled={updateProfileMutation.isPending}
            className="bg-[#0F4C92] rounded-2xl py-3.5 items-center justify-center shadow-md"
            activeOpacity={0.9}
          >
            {updateProfileMutation.isPending ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="text-white font-extrabold text-sm">حفظ التغييرات</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
