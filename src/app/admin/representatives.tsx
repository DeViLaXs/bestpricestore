import type { JSX } from "react";
import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  Search,
  AlertCircle,
  Users,
  User,
  ArrowLeft,
} from "lucide-react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../hooks/useAuth";
import {
  useRepresentativesQuery,
  useApproveRepresentativeMutation,
  useSuspendRepresentativeMutation,
} from "../../hooks/useRepresentatives";
import RepresentativeListSkeleton from "../../components/RepresentativeListSkeleton";

export default function RepresentativesScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();

  // Route guard: only allow users with Admin role or credentials
  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/" as any);
    }
  }, [user, isAdmin]);
  
  const [searchQuery, setSearchQuery] = useState("");

  // Query & Mutation hooks
  const {
    data: representatives = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useRepresentativesQuery();
  const approveMutation = useApproveRepresentativeMutation();
  const suspendMutation = useSuspendRepresentativeMutation();

  const isActionLoading = approveMutation.isPending || suspendMutation.isPending;

  // Filter representatives list based on search query (name, phone, or location)
  const filteredRepresentatives = useMemo(() => {
    const reps = Array.isArray(representatives) ? representatives : [];
    if (!searchQuery.trim()) return reps;
    const query = searchQuery.toLowerCase().trim();
    return reps.filter(
      (rep) =>
        rep &&
        (String(rep.storeName ?? "")
          .toLowerCase()
          .includes(query) ||
          String(rep.phoneNumber ?? "")
            .toLowerCase()
            .includes(query) ||
          String(rep.location ?? "")
            .toLowerCase()
            .includes(query))
    );
  }, [representatives, searchQuery]);

  const handleToggleStatus = (rep: { id: number; storeName: string; isActive: boolean }) => {
    if (rep.isActive) {
      // Prompt to Suspend
      Alert.alert(
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
                Alert.alert("نجاح", "تم إيقاف حساب المندوب بنجاح.");
              } catch (err: any) {
                Alert.alert("خطأ", err.message || "فشلت عملية إيقاف الحساب.");
              }
            },
          },
        ]
      );
    } else {
      // Prompt to Approve
      Alert.alert(
        "تفعيل الحساب",
        `هل أنت متأكد من رغبتك في تفعيل حساب المندوب "${rep.storeName}"؟`,
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "تفعيل الحساب",
            onPress: async () => {
              try {
                await approveMutation.mutateAsync(rep.id);
                Alert.alert("نجاح", "تم تفعيل حساب المندوب بنجاح.");
              } catch (err: any) {
                Alert.alert("خطأ", err.message || "فشلت عملية تفعيل الحساب.");
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
      <StatusBar style="dark" />

      {/* Clean White Header Banner */}
      <View className="bg-white border-b border-gray-100/50" style={{ paddingTop: safeTop }}>
        <View className="flex-row items-center justify-between px-6 py-2.5">
          {/* Back Button on Left */}
          <TouchableOpacity
            onPress={() => router.replace("/admin/more")}
            className="p-1"
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#1a202c" />
          </TouchableOpacity>

          {/* Title on Right */}
          <Text className="text-lg font-bold text-gray-900 text-right">المندوبين</Text>
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
        ) : filteredRepresentatives.length === 0 ? (
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
            {filteredRepresentatives.map((rep) => (
              <View
                key={rep.id}
                className="bg-white rounded-2xl p-3.5 flex-row items-center justify-between shadow-sm border border-gray-100/80"
              >
                {/* Left Side Action Button */}
                <TouchableOpacity
                  onPress={() => !isActionLoading && handleToggleStatus(rep)}
                  disabled={isActionLoading}
                  activeOpacity={0.7}
                  className={`px-3.5 py-1.5 rounded-full min-w-[84px] items-center justify-center ${
                    rep.isActive ? "bg-[#e0f2fe]" : "bg-[#fee2e2]"
                  }`}
                >
                  {rep.isActive ? (
                    <Text className="text-[#0F4C92] font-extrabold text-[11px]">تعديل الحالة</Text>
                  ) : (
                    <View className="flex-row items-center gap-1">
                      <Text className="text-[#991b1b] font-extrabold text-[11px]">غير نشط</Text>
                      <Text className="text-xs">😢</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Right Side Info & Avatar */}
                <View className="flex-row items-center gap-3 flex-1 justify-end">
                  {/* Name and status */}
                  <View className="items-end">
                    <Text className="font-extrabold text-gray-900 text-sm mb-0.5 text-right">
                      {rep.storeName}
                    </Text>
                    <View className="flex-row-reverse items-center gap-1.5">
                      <Text className="text-[10px] font-bold text-emerald-600">متاح</Text>
                      <Text
                        className={`text-[10px] font-bold ${rep.isActive ? "text-emerald-600" : "text-gray-400"}`}
                      >
                        {rep.isActive ? "نشط" : "غير نشط"}
                      </Text>
                    </View>
                  </View>

                  {/* Avatar Default Icon */}
                  <View className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 items-center justify-center">
                    <User size={18} className="text-gray-400" />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
