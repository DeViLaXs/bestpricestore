import type { JSX } from "react";
import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Pressable,
  StyleSheet,
} from "react-native";
import { Menu, Search, AlertCircle, Users, LogOut, X, ShoppingBag, Settings, Tag } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../hooks/useAuth";
import {
  useRepresentativesQuery,
  useApproveRepresentativeMutation,
  useSuspendRepresentativeMutation,
} from "../../hooks/useRepresentatives";

export default function RepresentativesScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { user, logoutMutation } = useAuth();

  // Sidebar States and Animation
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [slideAnim] = useState(() => new Animated.Value(-280));

  const toggleSidebar = (open: boolean) => {
    if (open) {
      setIsSidebarOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -280,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        setIsSidebarOpen(false);
      });
    }
  };

  const handleLogout = () => {
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
              toggleSidebar(false);
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

  // Route guard: only allow users with Admin role or credentials
  useEffect(() => {
    const isAdmin =
      user?.role?.toLowerCase() === "admin" ||
      user?.fullName?.toLowerCase() === "admin" ||
      user?.phone === "777777777" ||
      user?.phone === "773124470";

    if (user && !isAdmin) {
      Alert.alert("تنبيه", "عذراً، هذه الصفحة مخصصة للمسؤولين فقط.");
      router.replace("/" as any);
    }
  }, [user]);
  const [searchQuery, setSearchQuery] = useState("");

  // Query & Mutation hooks
  const { data: representatives = [], isLoading, error, refetch, isRefetching } = useRepresentativesQuery();
  const approveMutation = useApproveRepresentativeMutation();
  const suspendMutation = useSuspendRepresentativeMutation();

  const isActionLoading = approveMutation.isPending || suspendMutation.isPending;

  // Filter representatives list based on search query (name, phone, or location)
  const filteredRepresentatives = useMemo(() => {
    if (!searchQuery.trim()) return representatives;
    const query = searchQuery.toLowerCase().trim();
    return representatives.filter(
      (rep) =>
        rep.storeName?.toLowerCase().includes(query) ||
        rep.phoneNumber?.toLowerCase().includes(query) ||
        rep.location?.toLowerCase().includes(query)
    );
  }, [representatives, searchQuery]);

  // Map user ID to a premium realistic male face portrait URL for high-fidelity aesthetics
  const getAvatarUrl = (id: number) => {
    // Deterministic selection based on ID
    const portraitIds = [32, 44, 85, 22, 90, 11, 46, 60, 54, 82];
    const portraitIndex = Math.abs(id) % portraitIds.length;
    return `https://randomuser.me/api/portraits/men/${portraitIds[portraitIndex]}.jpg`;
  };

  /**
   * Triggers the status toggle action
   */
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
    <View style={{ flex: 1, backgroundColor: "#f8fafd" }}>
      <StatusBar style="light" />

      {/* Blue Header Banner */}
      <View style={{ backgroundColor: "#0F4C92", paddingTop: safeTop, paddingBottom: 44 }}>
        <View className="flex-row-reverse items-center justify-between px-6 py-3">
          {/* Title on Right */}
          <Text style={{ fontFamily: "System" }} className="text-xl font-bold text-white text-right">
            إدارة المندوبين
          </Text>

          {/* Hamburger Menu Icon on Left (Opens Sidebar Drawer) */}
          <TouchableOpacity onPress={() => toggleSidebar(true)} className="p-1" activeOpacity={0.7}>
            <Menu size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Container (Rounded White Card overlapping/below) */}
      <View
        style={{
          flex: 1,
          marginTop: -24,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          backgroundColor: "#f8fafd",
          overflow: "hidden",
        }}
      >
        {/* Search input section */}
        <View className="px-6 pt-6 pb-4">
          <View className="relative justify-center">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="ابحث عن مندوب..."
              placeholderTextColor="#a0aec0"
              style={{
                fontFamily: "System",
                height: 48,
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: "#e2e8f0",
                backgroundColor: "#ffffff",
                paddingRight: 44,
                paddingLeft: 16,
                fontSize: 14,
                color: "#1a202c",
                fontWeight: "600",
                textAlign: "right",
              }}
            />
            <Search
              size={20}
              color="#a0aec0"
              style={{ position: "absolute", right: 16 }}
            />
          </View>

          {/* "صفحة" (Page) label mimicking mockup */}
          <View className="flex-row justify-end mt-4 px-1">
            <Text className="text-sm font-bold text-gray-800">صفحة</Text>
          </View>
        </View>

        {/* Representatives List */}
        {isLoading && !isRefetching ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0F4C92" />
            <Text className="text-gray-500 mt-2 font-semibold">جاري تحميل البيانات...</Text>
          </View>
        ) : error ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            className="px-6"
          >
            <AlertCircle size={48} className="text-danger mb-2" />
            <Text className="text-danger text-center font-bold text-base mb-2">تعذر تحميل بيانات المندوبين</Text>
            <Text className="text-gray-500 text-center text-xs mb-4">{error.message}</Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="bg-[#0F4C92] px-6 py-2.5 rounded-full"
            >
              <Text className="text-white font-bold">إعادة المحاولة</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : filteredRepresentatives.length === 0 ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            className="px-6"
          >
            <Users size={48} color="#cbd5e1" className="mb-2" />
            <Text className="text-gray-500 font-bold text-center">لا يوجد مندوبين مسجلين حالياً</Text>
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 40, gap: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={["#0F4C92"]} />
            }
          >
            {filteredRepresentatives.map((rep) => (
              <View
                key={rep.id}
                className="bg-white rounded-3xl p-4 flex-row items-center justify-between shadow-sm border border-gray-50"
              >
                {/* Left Side Action Button */}
                <TouchableOpacity
                  onPress={() => !isActionLoading && handleToggleStatus(rep)}
                  disabled={isActionLoading}
                  activeOpacity={0.7}
                  className={`px-4 py-2.5 rounded-full min-w-[96px] items-center justify-center ${
                    rep.isActive ? "bg-[#dbeafe]" : "bg-[#fee2e2]"
                  }`}
                >
                  {rep.isActive ? (
                    <Text className="text-[#0c3f7c] font-black text-xs">إضافة تعديل</Text>
                  ) : (
                    <View className="flex-row items-center gap-1">
                      <Text className="text-[#991b1b] font-black text-xs">غير نشط</Text>
                      <Text className="text-xs">😢</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Right Side Info & Avatar */}
                <View className="flex-row items-center gap-3.5 flex-1 justify-end">
                  {/* Name and status */}
                  <View className="items-end">
                    <Text className="font-bold text-gray-900 text-[15px] mb-1 text-right">
                      {rep.storeName}
                    </Text>
                    <View className="flex-row-reverse items-center gap-1.5">
                      <Text className="text-[11px] font-bold text-emerald-600">متاح</Text>
                      <Text className={`text-[11px] font-semibold ${rep.isActive ? "text-emerald-600" : "text-gray-400"}`}>
                        {rep.isActive ? "نشط" : "غير نشط"}
                      </Text>
                    </View>
                  </View>

                  {/* Avatar */}
                  <Image
                    source={{ uri: getAvatarUrl(rep.id) }}
                    style={{ width: 44, height: 44, borderRadius: 22 }}
                    className="bg-gray-100"
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <View style={StyleSheet.absoluteFill} className="z-50 flex-row">
          {/* Backdrop (closes sidebar on press) */}
          <Pressable
            style={StyleSheet.absoluteFill}
            className="bg-black/40"
            onPress={() => toggleSidebar(false)}
          />

          {/* Animated Sidebar Container (Left side drawer) */}
          <Animated.View
            style={[
              {
                width: 280,
                height: "100%",
                backgroundColor: "#ffffff",
                paddingTop: insets.top,
                paddingBottom: Math.max(insets.bottom, 20),
                transform: [{ translateX: slideAnim }],
              },
              styles.sidebarShadow,
            ]}
            className="flex-col justify-between"
          >
            {/* Top Section: Header & Menu Items */}
            <View className="flex-1">
              {/* Sidebar Header */}
              <View className="flex-row-reverse items-center justify-between px-5 py-4 border-b border-gray-100">
                <View className="items-end">
                  <Text className="font-extrabold text-[#0c3f7c] text-base text-right">لوحة التحكم</Text>
                  <Text className="text-gray-400 text-[10px] font-semibold text-right">{user?.fullName || "المسؤول"}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleSidebar(false)} className="p-1">
                  <X size={20} color="#a0aec0" />
                </TouchableOpacity>
              </View>

              {/* Sidebar Links */}
              <View className="p-4 gap-2">
                {/* Active Link: إدارة المندوبين */}
                <TouchableOpacity
                  className="flex-row-reverse items-center gap-3 bg-blue-50/70 p-3.5 rounded-2xl"
                  activeOpacity={0.9}
                >
                  <Users size={18} color="#0c3f7c" />
                  <Text className="font-extrabold text-[#0c3f7c] text-sm text-right">إدارة المندوبين</Text>
                </TouchableOpacity>

                {/* Link: إدارة الفئات */}
                <TouchableOpacity
                  onPress={() => {
                    toggleSidebar(false);
                    router.replace("/admin/categories" as any);
                  }}
                  className="flex-row-reverse items-center gap-3 p-3.5 rounded-2xl active:bg-gray-50"
                  activeOpacity={0.7}
                >
                  <Tag size={18} color="#718096" />
                  <Text className="font-bold text-gray-600 text-sm text-right">إدارة الفئات</Text>
                </TouchableOpacity>

                {/* Placeholder Link: إدارة المنتجات */}
                <TouchableOpacity
                  onPress={() => Alert.alert("قريباً", "سيتم إضافة صفحة إدارة المنتجات قريباً.")}
                  className="flex-row-reverse items-center gap-3 p-3.5 rounded-2xl active:bg-gray-50"
                  activeOpacity={0.7}
                >
                  <ShoppingBag size={18} color="#718096" />
                  <Text className="font-bold text-gray-600 text-sm text-right">إدارة المنتجات</Text>
                </TouchableOpacity>

                {/* Placeholder Link: إعدادات النظام */}
                <TouchableOpacity
                  onPress={() => Alert.alert("قريباً", "سيتم إضافة صفحة إعدادات النظام قريباً.")}
                  className="flex-row-reverse items-center gap-3 p-3.5 rounded-2xl active:bg-gray-50"
                  activeOpacity={0.7}
                >
                  <Settings size={18} color="#718096" />
                  <Text className="font-bold text-gray-600 text-sm text-right">إعدادات النظام</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Section: Pinned Logout Button */}
            <View className="px-4 pt-4 border-t border-gray-100">
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row-reverse items-center justify-center gap-2 bg-red-50 p-3.5 rounded-2xl active:bg-red-100"
                activeOpacity={0.7}
              >
                <LogOut size={18} color="#e53e3e" />
                <Text className="font-bold text-danger text-sm text-center">تسجيل الخروج</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
});
