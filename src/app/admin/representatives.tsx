import type { JSX } from "react";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Search, AlertCircle, Users, User, ArrowLeft, Phone, MapPin } from "lucide-react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../hooks/useAuth";
import { useAlert } from "../../contexts/AlertContext";
import { useAppToast } from "../../hooks/useAppToast";
import {
  useRepresentativesQuery,
  useApproveRepresentativeMutation,
  useSuspendRepresentativeMutation,
} from "../../hooks/useRepresentatives";
import RepresentativeListSkeleton from "../../components/RepresentativeListSkeleton";

export default function RepresentativesScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();
  const { showAlert } = useAlert();
  const { showSuccessToast, showErrorToast } = useAppToast();

  // Route guard: only allow users with Admin role or credentials
  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/" as any);
    }
  }, [user, isAdmin]);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Query & Mutation hooks
  const {
    data: representatives = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useRepresentativesQuery(debouncedQuery);

  // Auto refetch when page gets focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const approveMutation = useApproveRepresentativeMutation();
  const suspendMutation = useSuspendRepresentativeMutation();

  const isActionLoading = approveMutation.isPending || suspendMutation.isPending;

  const repsList = useMemo(() => {
    return Array.isArray(representatives) ? representatives : [];
  }, [representatives]);

  const handleToggleStatus = (rep: { id: number; storeName: string; isActive: boolean }) => {
    if (rep.isActive) {
      // Prompt to Suspend
      showAlert(
        "إيقاف الحساب",
        `هل أنت متأكد من رغبتك في إيقاف حساب المندوب "${rep.storeName}"؟`,
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "إيقاف الحساب",
            style: "destructive",
            onPress: async () => {
              try {
                await suspendMutation.mutateAsync(rep.id);
                await refetch();
                showSuccessToast("نجاح", "تم إيقاف حساب المندوب بنجاح.");
              } catch (err: any) {
                showErrorToast("خطأ", err.message || "فشلت عملية إيقاف الحساب.");
              }
            },
          },
        ]
      );
    } else {
      // Prompt to Approve
      showAlert(
        "تفعيل الحساب",
        `هل أنت متأكد من رغبتك في تفعيل حساب المندوب "${rep.storeName}"؟`,
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "تفعيل الحساب",
            onPress: async () => {
              try {
                await approveMutation.mutateAsync(rep.id);
                await refetch();
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
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      {/* Clean Blue Header Banner */}
      <View className="bg-[#0F4C92]" style={{ paddingTop: safeTop }}>
        <View className="flex-row items-center justify-between px-6 py-2.5">
          {/* Back Button on Left */}
          <TouchableOpacity
            onPress={() => router.replace("/admin/more")}
            className="p-1"
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>

          {/* Title on Right */}
          <Text className="text-lg font-bold text-white text-right">المندوبين</Text>
        </View>
      </View>

      {/* Search Area */}
      <View className="px-6 pt-3 pb-2 bg-[#f8fafd]">
        <View className="relative justify-center">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ابحث عن مندوب..."
            placeholderTextColor="#a0aec0"
            className="h-10 rounded-xl border-[1.5px] border-gray-200 bg-white pr-11 pl-4 text-xs text-gray-800 font-semibold text-right"
          />
          <Search size={18} color="#a0aec0" style={{ position: "absolute", right: 16 }} />
        </View>
      </View>

      {/* Representatives List */}
      <View className="flex-1 bg-[#f8fafd]">
        {isLoading && !isRefetching ? (
          <View className="pt-2">
            <RepresentativeListSkeleton count={5} />
          </View>
        ) : error ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            className="px-6"
          >
            <AlertCircle size={48} className="text-danger mb-2" />
            <Text className="text-danger text-center font-bold text-base mb-2">
              تعذر تحميل بيانات المندوبين
            </Text>
            <Text className="text-gray-500 text-center text-xs mb-4">{error.message}</Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="bg-[#0F4C92] px-6 py-2.5 rounded-full"
            >
              <Text className="text-white font-bold">إعادة المحاولة</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : representatives.length === 0 ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            className="px-6"
          >
            <Users size={48} color="#cbd5e1" className="mb-2" />
            <Text className="text-gray-500 font-bold text-center">
              لا يوجد مندوبين مسجلين حالياً
            </Text>
          </ScrollView>
        ) : repsList.length === 0 ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            className="px-6"
          >
            <Users size={48} color="#cbd5e1" className="mb-2" />
            <Text className="text-gray-500 font-bold text-center">
              لا يوجد مندوبين مطابقين للبحث
            </Text>
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: insets.bottom + 40,
              gap: 10,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={["#0F4C92"]} />
            }
          >
            {repsList.map((rep) => (
              <TouchableOpacity
                key={rep.id}
                onPress={() => {
                  router.push({
                    pathname: "/admin/representative-details",
                    params: {
                      id: rep.id.toString(),
                      storeName: rep.storeName,
                      phoneNumber: rep.phoneNumber || "",
                      location: rep.location || "",
                      isActive: rep.isActive.toString(),
                    },
                  } as any);
                }}
                activeOpacity={0.8}
                className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-sm border border-gray-100"
              >
                {/* Left Side Status Toggle Button */}
                <TouchableOpacity
                  onPress={() => !isActionLoading && handleToggleStatus(rep)}
                  disabled={isActionLoading}
                  activeOpacity={0.7}
                  className={`px-4 py-2 rounded-xl min-w-[76px] items-center justify-center border ${
                    rep.isActive 
                      ? "bg-red-50/50 border-red-100" 
                      : "bg-emerald-50/50 border-emerald-100"
                  }`}
                >
                  <Text className={`font-black text-xs ${rep.isActive ? "text-red-600" : "text-emerald-600"}`}>
                    {rep.isActive ? "إيقاف" : "تفعيل"}
                  </Text>
                </TouchableOpacity>

                {/* Right Side Info & Avatar */}
                <View className="flex-row items-center gap-3 flex-1 justify-end">
                  {/* Name and details */}
                  <View className="items-end gap-1 flex-1">
                    <Text className="font-extrabold text-gray-900 text-sm text-right">
                      {rep.storeName}
                    </Text>

                    {rep.phoneNumber ? (
                      <View className="flex-row-reverse items-center gap-1.5">
                        <Phone size={11} className="text-gray-400" />
                        <Text className="text-[11px] font-medium text-gray-500">{rep.phoneNumber}</Text>
                      </View>
                    ) : null}

                    {rep.location ? (
                      <View className="flex-row-reverse items-center gap-1.5">
                        <MapPin size={11} className="text-gray-400" />
                        <Text className="text-[11px] font-medium text-gray-500">{rep.location}</Text>
                      </View>
                    ) : null}

                    <View className={`px-2 py-0.5 mt-0.5 rounded-md flex-row-reverse items-center gap-1 ${
                      rep.isActive ? "bg-emerald-50" : "bg-red-50"
                    }`}>
                      <View className={`w-1.5 h-1.5 rounded-full ${rep.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                      <Text className={`text-[9px] font-bold ${rep.isActive ? "text-emerald-700" : "text-red-700"}`}>
                        {rep.isActive ? "نشط" : "غير نشط"}
                      </Text>
                    </View>
                  </View>

                  {/* Avatar Icon */}
                  <View className={`w-11 h-11 rounded-full items-center justify-center border ${
                    rep.isActive ? "bg-emerald-50/30 border-emerald-100/60" : "bg-red-50/30 border-red-100/60"
                  }`}>
                    <User size={20} className={rep.isActive ? "text-emerald-600" : "text-red-400"} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
