import { JSX, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, User, Phone, MapPin, CheckCircle2, XCircle } from "lucide-react-native";
import {
  useApproveRepresentativeMutation,
  useSuspendRepresentativeMutation,
} from "../../hooks/useRepresentatives";
import { useAlert } from "../../contexts/AlertContext";
import { useAppToast } from "../../hooks/useAppToast";

export default function RepresentativeDetailsScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const id = Number(params.id);
  const storeName = (params.storeName as string) || "";
  const phoneNumber = (params.phoneNumber as string) || "";
  const location = (params.location as string) || "";
  const initialIsActive = params.isActive === "true";

  const { showAlert } = useAlert();
  const { showSuccessToast, showErrorToast } = useAppToast();
  const approveMutation = useApproveRepresentativeMutation();
  const suspendMutation = useSuspendRepresentativeMutation();

  const isActionLoading = approveMutation.isPending || suspendMutation.isPending;

  // Track active status locally to show updates immediately
  const [isActive, setIsActive] = useState(initialIsActive);

  const handleToggleStatus = () => {
    if (isActive) {
      showAlert(
        "إيقاف الحساب",
        `هل أنت متأكد من رغبتك في إيقاف حساب المندوب "${storeName}"؟`,
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "إيقاف الحساب",
            style: "destructive",
            onPress: async () => {
              try {
                await suspendMutation.mutateAsync(id);
                setIsActive(false);
                showSuccessToast("نجاح", "تم إيقاف حساب المندوب بنجاح.");
              } catch (err: any) {
                showErrorToast("خطأ", err.message || "فشلت عملية إيقاف الحساب.");
              }
            },
          },
        ]
      );
    } else {
      showAlert(
        "تفعيل الحساب",
        `هل أنت متأكد من رغبتك في تفعيل حساب المندوب "${storeName}"؟`,
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "تفعيل الحساب",
            onPress: async () => {
              try {
                await approveMutation.mutateAsync(id);
                setIsActive(true);
                showSuccessToast("نجاح", "تم تفعيل حساب المندوب بنجاح.");
              } catch (err: any) {
                showErrorToast("خطأ", err.message || "فشلت عملية تفعيل الحساب.");
              }
            },
          },
        ]
      );
    }
  };

  const safeTop = insets.top > 0 ? insets.top : 47;

  return (
    <View className="flex-1 bg-[#f8fafd]">
      <StatusBar style="light" />

      {/* Blue Header */}
      <View className="bg-[#0F4C92]" style={{ paddingTop: safeTop }}>
        <View className="flex-row items-center justify-between px-6 py-2.5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-1"
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-white text-right">تفاصيل المندوب</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Card */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/80 items-center mb-6">
          {/* Large Avatar */}
          <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${
            isActive ? "bg-emerald-50 border-2 border-emerald-100" : "bg-red-50 border-2 border-red-100"
          }`}>
            <User size={36} className={isActive ? "text-emerald-600" : "text-red-500"} />
          </View>

          {/* Store Name */}
          <Text className="text-xl font-black text-gray-900 text-center mb-1.5">{storeName}</Text>
          
          {/* Status Badge */}
          <View className={`flex-row items-center gap-1 px-3 py-1 rounded-full ${
            isActive ? "bg-emerald-50" : "bg-red-50"
          }`}>
            {isActive ? (
              <CheckCircle2 size={14} color="#059669" />
            ) : (
              <XCircle size={14} color="#dc2626" />
            )}
            <Text className={`text-xs font-bold ${isActive ? "text-emerald-700" : "text-red-700"}`}>
              {isActive ? "حساب نشط" : "غير نشط"}
            </Text>
          </View>
        </View>

        {/* Details Section */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100/80 gap-4 mb-6">
          <Text className="text-sm font-black text-gray-800 text-right border-b border-gray-100 pb-2.5">
            المعلومات الشخصية
          </Text>

          {/* Phone Number Row */}
          <View className="flex-row-reverse items-center justify-between py-1">
            <View className="flex-row-reverse items-center gap-3">
              <View className="w-9 h-9 rounded-xl bg-gray-50 items-center justify-center border border-gray-100">
                <Phone size={16} className="text-gray-500" />
              </View>
              <View className="items-end">
                <Text className="text-[10px] text-gray-400 font-bold">رقم الهاتف</Text>
                <Text className="text-sm font-extrabold text-gray-800">{phoneNumber || "لا يوجد"}</Text>
              </View>
            </View>
          </View>

          {/* Location Row */}
          <View className="flex-row-reverse items-center justify-between py-1">
            <View className="flex-row-reverse items-center gap-3">
              <View className="w-9 h-9 rounded-xl bg-gray-50 items-center justify-center border border-gray-100">
                <MapPin size={16} className="text-gray-500" />
              </View>
              <View className="items-end">
                <Text className="text-[10px] text-gray-400 font-bold">الموقع / العنوان</Text>
                <Text className="text-sm font-extrabold text-gray-800">{location || "لا يوجد"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleToggleStatus}
          disabled={isActionLoading}
          activeOpacity={0.8}
          className={`w-full py-3.5 rounded-2xl items-center justify-center shadow-xs ${
            isActive ? "bg-red-50 border border-red-200" : "bg-emerald-50 border border-emerald-200"
          }`}
        >
          <Text className={`font-black text-sm ${isActive ? "text-red-700" : "text-emerald-700"}`}>
            {isActive ? "إلغاء تفعيل المندوب" : "تفعيل المندوب"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
