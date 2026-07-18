import type { JSX } from "react";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Check, MapPin, Phone, User, ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useToast, Toast } from "heroui-native";
import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
import { useUpdateProfileMutation } from "../../hooks/useRepresentatives";

export default function AdminProfileScreen(): JSX.Element {
  const { user, isAdmin } = useAuth();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
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
    if (!storeName.trim() || !phone.trim() || !location.trim()) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        storeName: storeName.trim(),
        phoneNumber: phone.trim(),
        location: location.trim(),
      });

      const setUser = useAuthStore.getState().setUser;
      if (user) {
        setUser({
          ...user,
          fullName: storeName.trim(),
          phone: phone.trim(),
          location: location.trim(),
        });
      }

      toast.show({
        component: (props) => (
          <Toast
            variant="success"
            {...props}
            className="bg-white border border-gray-100 p-3.5 rounded-2xl flex-row-reverse items-center shadow-lg"
          >
            <View className="w-8 h-8 rounded-full bg-green-50 justify-center items-center ml-3">
              <Check size={18} color="#16a34a" />
            </View>
            <View className="items-end flex-1 pr-1">
              <Text className="text-gray-900 font-extrabold text-xs text-right">نجاح</Text>
              <Text className="text-gray-500 font-bold text-[10px] text-right mt-0.5">
                تم تحديث بيانات الملف الشخصي بنجاح.
              </Text>
            </View>
            <Toast.Close className="mr-auto" iconProps={{ size: 14, color: "#94a3b8" }} />
          </Toast>
        ),
      });

      router.back();
    } catch (error: any) {
      console.log("Profile update failed:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "فشلت عملية تحديث البيانات الشخصية. يرجى المحاولة مرة أخرى.";
      Alert.alert("خطأ", errorMsg);
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
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-1"
            activeOpacity={0.7}
          >
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
