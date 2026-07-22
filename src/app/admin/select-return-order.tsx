import type { JSX } from "react";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  RefreshControl,
} from "react-native";
import { withUniwind } from "uniwind";
import {
  ArrowLeft,
  Search,
  AlertCircle,
  ClipboardList,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Package,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../hooks/useAuth";
import { useAdminOrdersQuery } from "../../hooks/useAdminOrders";
import OrderListSkeleton from "../../components/OrderListSkeleton";

// Wrap Lucide icons with Uniwind
const StyledArrowLeft = withUniwind(ArrowLeft);
const StyledSearch = withUniwind(Search);
const StyledAlertCircle = withUniwind(AlertCircle);
const StyledClipboardList = withUniwind(ClipboardList);

// Status maps for UI rendering
const STATUS_STYLE_MAP: Record<number, { bg: string; text: string; icon: any; name: string }> = {
  1: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    icon: Clock,
    name: "قيد المراجعة",
  },
  2: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", icon: Clock, name: "قيد المعالجة" },
  3: {
    bg: "bg-indigo-50 border-indigo-200",
    text: "text-indigo-700",
    icon: Package,
    name: "تم الشحن",
  },
  4: {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    icon: CheckCircle2,
    name: "تم التوصيل",
  },
  5: { bg: "bg-rose-50 border-rose-200", text: "text-rose-700", icon: XCircle, name: "ملغى" },
};

export default function SelectReturnOrderScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Route guard: only allow admins
  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/" as any);
    }
  }, [user, isAdmin]);

  const { data: orders = [], isLoading, error, refetch, isRefetching } = useAdminOrdersQuery();

  // Re-fetch data automatically when the screen receives focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Helper date formatter
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("ar-YE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        numberingSystem: "latn",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusDetails = (statusId: number) => {
    return STATUS_STYLE_MAP[statusId] || STATUS_STYLE_MAP[1];
  };

  // Filter orders: exclude cancelled orders, and match search query
  const eligibleOrders = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return list.filter((order) => {
      // 1. Exclude Cancelled (status ID 5)
      if (order.orderStatusId === 5) return false;

      // 2. Apply Search
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      const matchStoreName = String(order.storeName ?? "")
        .toLowerCase()
        .includes(query);
      const matchId = String(order.id).includes(query);
      const matchAmountYer = String(order.totalAmountYer).includes(query);
      const matchAmountSar = String(order.totalAmountSar).includes(query);

      return matchStoreName || matchId || matchAmountYer || matchAmountSar;
    });
  }, [orders, searchQuery]);

  const safeTop = insets.top > 0 ? insets.top : 47;
  const safeBottom = insets.bottom > 0 ? insets.bottom : 20;

  return (
    <View className="flex-1 bg-[#f8fafd]">
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-[#0F4C92]" style={{ paddingTop: safeTop }}>
        <View className="flex-row items-center justify-between px-6 py-2.5">
          <TouchableOpacity
            onPress={() => router.replace("/admin/more")}
            className="p-1"
            activeOpacity={0.7}
          >
            <StyledArrowLeft size={24} className="text-white" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-white text-right">اختر الطلب للإرجاع</Text>
        </View>
      </View>

      {/* Search Input */}
      <View className="px-6 pt-4 pb-2 bg-[#f8fafd]">
        <View className="relative justify-center">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ابحث برقم الطلب، اسم المتجر، أو المبلغ..."
            placeholderTextColor="#a0aec0"
            className="h-12 rounded-2xl border-[1.5px] border-gray-200 bg-white pr-11 pl-4 text-xs text-gray-800 font-semibold text-right"
          />
          <StyledSearch size={18} className="text-gray-400 absolute right-4" />
        </View>
      </View>

      {/* Main List */}
      <View className="flex-1 bg-[#f8fafd] pt-2">
        {isLoading && !isRefetching ? (
          <OrderListSkeleton bottomPadding={safeBottom + 20} />
        ) : error ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            className="px-6"
          >
            <StyledAlertCircle size={48} className="text-red-500 mb-2" />
            <Text className="text-red-500 text-center font-bold text-base mb-2">
              تعذر تحميل بيانات الطلبات
            </Text>
            <Text className="text-gray-500 text-center text-xs mb-4">{error.message}</Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="bg-[#0F4C92] px-6 py-2.5 rounded-full"
            >
              <Text className="text-white font-bold">إعادة المحاولة</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : eligibleOrders.length === 0 ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            className="px-6"
          >
            <StyledClipboardList size={48} className="text-gray-300 mb-2" />
            <Text className="text-gray-500 font-bold text-center">
              لا توجد طلبات نشطة تطابق البحث
            </Text>
          </ScrollView>
        ) : (
          <FlatList
            data={eligibleOrders}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: safeBottom + 20,
            }}
            refreshing={isRefetching}
            onRefresh={refetch}
            renderItem={({ item }) => {
              const statusInfo = getStatusDetails(item.orderStatusId);
              const StatusIcon = statusInfo.icon;

              return (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/admin/return-products" as any,
                      params: { orderId: item.id.toString() },
                    })
                  }
                  activeOpacity={0.8}
                  className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm flex-row-reverse items-center justify-between"
                >
                  <View className="flex-1 items-end pl-2">
                    {/* ID and Status */}
                    <View className="flex-row-reverse items-center gap-2 mb-1.5 flex-wrap">
                      <Text className="font-extrabold text-gray-900 text-sm">طلب #{item.id}</Text>
                      <View
                        className={`px-2 py-0.5 rounded-full border ${statusInfo.bg} flex-row-reverse items-center gap-1`}
                      >
                        <StatusIcon size={10} className={statusInfo.text} />
                        <Text
                          numberOfLines={1}
                          className={`text-[9px] font-bold ${statusInfo.text}`}
                        >
                          {statusInfo.name}
                        </Text>
                      </View>
                    </View>

                    {/* Store name */}
                    <Text className="text-gray-800 font-bold text-xs text-right mb-0.5">
                      العميل: {item.storeName || `مستخدم #${item.userId}`}
                    </Text>

                    {/* Date */}
                    <View className="flex-row-reverse items-center gap-1.5 mb-2">
                      <Calendar size={11} color="#718096" />
                      <Text className="text-gray-500 text-[10px] font-bold">
                        {formatDate(item.createdAt)}
                      </Text>
                    </View>

                    {/* Totals */}
                    <View className="flex-row-reverse items-center gap-3">
                      {item.totalAmountYer > 0 && (
                        <View className="bg-blue-50/50 px-2 py-0.5 rounded-md border border-blue-100/50">
                          <Text className="text-[#0F4C92] text-[10px] font-extrabold">
                            {item.totalAmountYer.toLocaleString("en-US")} ريال يمني
                          </Text>
                        </View>
                      )}
                      {item.totalAmountSar > 0 && (
                        <View className="bg-emerald-50/50 px-2 py-0.5 rounded-md border border-emerald-100/50">
                          <Text className="text-emerald-700 text-[10px] font-extrabold">
                            {item.totalAmountSar.toLocaleString("en-US")} ريال سعودي
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <ChevronLeft size={16} color="#a0aec0" />
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}
