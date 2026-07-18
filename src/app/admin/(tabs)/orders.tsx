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
  FlatList,
  Modal,
} from "react-native";
import {
  Search,
  AlertCircle,
  ClipboardList,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  X,
  Package,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { withUniwind } from "uniwind";
import OrderListSkeleton from "../../../components/OrderListSkeleton";
import OrderDetailSkeleton from "../../../components/OrderDetailSkeleton";
import { useAuth } from "../../../hooks/useAuth";
import {
  useAdminOrdersQuery,
  useAdminOrderDetailsQuery,
  useAdminUpdateOrderStatusMutation,
} from "../../../hooks/useAdminOrders";

// Wrap Lucide icons with Uniwind for Tailwind CSS layout compatibility
const StyledSearch = withUniwind(Search);
const StyledX = withUniwind(X);
const StyledPackage = withUniwind(Package);

// Status Badge Styling Maps
const STATUS_STYLE_MAP: Record<
  number,
  { bg: string; text: string; icon: any; name: string }
> = {
  1: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: Clock, name: "قيد المراجعة" },
  2: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", icon: Clock, name: "قيد المعالجة" },
  3: { bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700", icon: Package, name: "تم الشحن" },
  4: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: CheckCircle2, name: "تم التوصيل" },
  5: { bg: "bg-rose-50 border-rose-200", text: "text-rose-700", icon: XCircle, name: "ملغى" },
};

export default function AdminOrdersScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();

  // Search & Status Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);

  // Details Modal States
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Queries & Mutations
  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAdminOrdersQuery();
  const updateStatusMutation = useAdminUpdateOrderStatusMutation();

  // Route guard: only allow admins
  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/" as any);
    }
  }, [user, isAdmin]);

  // Local Filter & Search logic
  const filteredOrders = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return list.filter((order) => {
      // 1. Status Filter
      const matchStatus = selectedStatusId === null || order.orderStatusId === selectedStatusId;
      if (!matchStatus) return false;

      // 2. Search query (Customer store name, order ID, or total amount)
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      const matchStoreName = String(order.storeName ?? "").toLowerCase().includes(query);
      const matchId = String(order.id).includes(query);
      const matchAmountYer = String(order.totalAmountYer).includes(query);
      const matchAmountSar = String(order.totalAmountSar).includes(query);

      return matchStoreName || matchId || matchAmountYer || matchAmountSar;
    });
  }, [orders, selectedStatusId, searchQuery]);

  // Dynamic order status count computation
  const counts = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    let all = list.length;
    let pendingReview = 0;
    let processing = 0;
    let shipped = 0;
    let delivered = 0;
    let cancelled = 0;

    list.forEach((order) => {
      if (order.orderStatusId === 1) pendingReview++;
      else if (order.orderStatusId === 2) processing++;
      else if (order.orderStatusId === 3) shipped++;
      else if (order.orderStatusId === 4) delivered++;
      else if (order.orderStatusId === 5) cancelled++;
    });

    return { all, pendingReview, processing, shipped, delivered, cancelled };
  }, [orders]);

  // Helper status translation
  const getStatusDetails = (statusId: number) => {
    return STATUS_STYLE_MAP[statusId] || STATUS_STYLE_MAP[1];
  };

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

  const handleOpenDetails = (id: number) => {
    setSelectedOrderId(id);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedOrderId(null);
    setIsDetailsOpen(false);
  };

  const filterStatuses = [
    { id: null, name: "الكل" },
    { id: 1, name: "قيد المراجعة" },
    { id: 2, name: "قيد المعالجة" },
    { id: 3, name: "تم الشحن" },
    { id: 4, name: "تم التوصيل" },
    { id: 5, name: "ملغى" },
  ];

  const safeTop = insets.top > 0 ? insets.top : 47;

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Clean White Header Banner */}
      <View className="bg-white border-b border-gray-100/50" style={{ paddingTop: safeTop }}>
        <View className="flex-row-reverse items-center px-6 py-2.5">
          <Text className="text-lg font-bold text-gray-900 text-right">الطلبات</Text>
        </View>
      </View>

      {/* Search Area */}
      <View className="px-6 pt-3 pb-2 bg-[#f8fafd]">
        {/* Search bar */}
        <View className="relative justify-center">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ابحث عن متجر، رقم طلب، أو مبلغ..."
            placeholderTextColor="#a0aec0"
            className="h-10 rounded-xl border-[1.5px] border-gray-200 bg-white pr-11 pl-4 text-xs text-gray-800 font-semibold text-right"
          />
          <StyledSearch size={18} className="text-gray-400 absolute right-4" />
        </View>
      </View>

      {/* Status Filter Tabs */}
      <View className="border-b border-gray-100 bg-[#f8fafd]">
        <FlatList
          data={filterStatuses}
          horizontal
          inverted
          showsHorizontalScrollIndicator={false}
          className="h-11"
          contentContainerStyle={{
            alignItems: "center",
            paddingHorizontal: 10,
          }}
          keyExtractor={(item) => (item.id !== null ? item.id.toString() : "all")}
          renderItem={({ item: status }) => {
            const isSelected = selectedStatusId === status.id;
            const count =
              status.id === null
                ? counts.all
                : status.id === 1
                  ? counts.pendingReview
                  : status.id === 2
                    ? counts.processing
                    : status.id === 3
                      ? counts.shipped
                      : status.id === 4
                        ? counts.delivered
                        : counts.cancelled;

            return (
              <TouchableOpacity
                onPress={() => setSelectedStatusId(status.id)}
                activeOpacity={0.7}
                className="px-3.5 h-full justify-center"
              >
                <View className="items-center">
                  <Text
                    className={`text-xs font-bold ${
                      isSelected ? "text-[#0F4C92]" : "text-gray-500"
                    }`}
                  >
                    {status.name} ({count})
                  </Text>
                  <View
                    className={`h-[2.5px] w-full bg-[#0F4C92] rounded-t-full mt-1.5 ${
                      isSelected ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Orders List Container */}
      <View className="flex-1 bg-[#f8fafd] pt-2.5">
        {isLoading && !isRefetching ? (
          <OrderListSkeleton bottomPadding={insets.bottom + 90} />
        ) : error ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            className="px-6"
          >
            <AlertCircle size={48} color="#e53e3e" className="mb-2" />
            <Text className="text-[#e53e3e] text-center font-bold text-base mb-2">
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
        ) : filteredOrders.length === 0 ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            className="px-6"
          >
            <ClipboardList size={48} color="#cbd5e1" className="mb-2" />
            <Text className="text-gray-500 font-bold text-center">لا توجد طلبات تطابق الفلاتر المحددة</Text>
          </ScrollView>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: insets.bottom + 90, // extra padding for bottom tabs
            }}
            refreshing={isRefetching}
            onRefresh={refetch}
            renderItem={({ item }) => {
              const statusInfo = getStatusDetails(item.orderStatusId);
              const StatusIcon = statusInfo.icon;

              return (
                <TouchableOpacity
                  onPress={() => handleOpenDetails(item.id)}
                  activeOpacity={0.8}
                  className="bg-white rounded-2xl p-3.5 mb-3 border border-gray-100 shadow-sm flex-row-reverse items-center justify-between"
                >
                  <View className="flex-1 items-end pl-2">
                    {/* ID and Status Badge */}
                    <View className="flex-row-reverse items-center gap-2 mb-1 flex-wrap">
                      <Text className="font-extrabold text-gray-900 text-sm">
                        طلب #{item.id}
                      </Text>
                      <View className={`px-2 py-0.5 rounded-full border ${statusInfo.bg} flex-row-reverse items-center gap-1`}>
                        <StatusIcon size={10} className={statusInfo.text} />
                        <Text numberOfLines={1} className={`text-[9px] font-bold ${statusInfo.text}`}>
                          {statusInfo.name}
                        </Text>
                      </View>
                    </View>

                    {/* Customer Store Name */}
                    <Text className="text-gray-800 font-bold text-xs text-right mb-0.5">
                      العميل: {item.storeName || `مستخدم #${item.userId}`}
                    </Text>

                    {/* Date */}
                    <View className="flex-row-reverse items-center gap-1.5 mb-1.5">
                      <Calendar size={11} color="#718096" />
                      <Text className="text-gray-500 text-[10px] font-bold">
                        {formatDate(item.createdAt)}
                      </Text>
                    </View>

                    {/* Amounts */}
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

      {/* Details Slide-up Modal */}
      {selectedOrderId && (
        <AdminOrderDetailsModal
          orderId={selectedOrderId}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          getStatusDetails={getStatusDetails}
          formatDate={formatDate}
          updateMutation={updateStatusMutation}
        />
      )}
    </View>
  );
}

// Order details sheet component
interface DetailsModalProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
  getStatusDetails: (statusId: number) => { name: string; bg: string; text: string; icon: any };
  formatDate: (dateStr: string) => string;
  updateMutation: ReturnType<typeof useAdminUpdateOrderStatusMutation>;
}

function AdminOrderDetailsModal({
  orderId,
  isOpen,
  onClose,
  getStatusDetails,
  formatDate,
  updateMutation,
}: DetailsModalProps) {
  const { data: orderDetails, isLoading, error } = useAdminOrderDetailsQuery(orderId);
  const insets = useSafeAreaInsets();

  const handleUpdateStatus = (targetStatusId: number, targetName: string) => {
    const isCancel = targetStatusId === 5;
    Alert.alert(
      isCancel ? "إلغاء الطلب" : "تحديث حالة الطلب",
      `هل أنت متأكد من رغبتك في تعديل حالة الطلب إلى "${targetName}"؟${
        isCancel ? "\nتنبيه: سيؤدي هذا إلى استعادة المخزون المخصوم تلقائياً." : ""
      }`,
      [
        { text: "تراجع", style: "cancel" },
        {
          text: isCancel ? "إلغاء الطلب" : "تحديث",
          style: isCancel ? "destructive" : "default",
          onPress: async () => {
            try {
              await updateMutation.mutateAsync({ id: orderId, orderStatusId: targetStatusId });
              Alert.alert("نجاح", "تم تحديث حالة الطلب بنجاح.");
            } catch (err: any) {
              Alert.alert("فشل التحديث", err.message || "حدث خطأ أثناء تعديل حالة الطلب.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const statusInfo = orderDetails ? getStatusDetails(orderDetails.orderStatusId) : null;
  const StatusIcon = statusInfo?.icon;
  const currentStatusId = orderDetails?.orderStatusId || 0;

  // Next transition setup
  let primaryAction: { id: number; name: string; label: string } | null = null;
  if (currentStatusId === 1) {
    primaryAction = { id: 2, name: "Processing", label: "بدء تجهيز الطلب" };
  } else if (currentStatusId === 2) {
    primaryAction = { id: 3, name: "Shipped", label: "شحن الطلب" };
  } else if (currentStatusId === 3) {
    primaryAction = { id: 4, name: "Delivered", label: "تأكيد توصيل الطلب" };
  }

  const isTerminal = currentStatusId === 4 || currentStatusId === 5;

  const safeBottom = insets.bottom > 0 ? insets.bottom : 20;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    > 
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-[32px] h-[85%] relative overflow-hidden flex-col">
          {/* Header */}
          <View className="flex-row-reverse items-center justify-between px-6 py-5 border-b border-gray-100">
            <Text className="font-black text-gray-900 text-lg">تفاصيل الطلب #{orderId}</Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            >
              <StyledX size={18} className="text-gray-600" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <OrderDetailSkeleton showTimeline={true} />
          ) : error ? (
            <View className="flex-1 items-center justify-center p-6">
              <AlertCircle size={40} color="#e53e3e" />
              <Text className="text-gray-800 font-bold mt-3 text-center">
                فشل في تحميل تفاصيل الطلب
              </Text>
              <Text className="text-gray-500 text-xs mt-1 text-center">
                {error.message || "تأكد من صلاحياتك واتصالك بالإنترنت."}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="bg-[#0F4C92] px-6 py-2 rounded-full mt-5"
              >
                <Text className="text-white font-bold">إغلاق</Text>
              </TouchableOpacity>
            </View>
          ) : orderDetails ? (
            <>
              <ScrollView
                className="flex-1 px-6 pt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: safeBottom + 100 }}
              >
                {/* Status Summary Card */}
                <View className="bg-[#f8fafd] rounded-2xl p-4 border border-gray-100 mb-6 items-end">
                  <View className="flex-row-reverse items-center gap-2 mb-2">
                    <Text className="font-bold text-gray-400 text-xs">حالة الطلب الحالية:</Text>
                    {statusInfo && (
                      <View className={`px-2.5 py-0.5 rounded-full border ${statusInfo.bg} flex-row-reverse items-center gap-1`}>
                        <StatusIcon size={12} className={statusInfo.text} />
                        <Text className={`text-[10px] font-black ${statusInfo.text}`}>
                          {statusInfo.name}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row-reverse items-center gap-2">
                    <Text className="font-bold text-gray-400 text-xs">تاريخ الطلب:</Text>
                    <Text className="font-semibold text-gray-700 text-xs">
                      {formatDate(orderDetails.createdAt)}
                    </Text>
                  </View>
                </View>

                {/* Progress Visual Timeline Tracker */}
                <Text className="text-right font-black text-gray-900 text-base mb-4">
                  مسار حالة الطلب
                </Text>
                <View className="flex-row-reverse items-center justify-between bg-gray-50/50 p-4 border border-gray-100 rounded-2xl mb-6">
                  {/* Step 1: Pending */}
                  <View className="items-center flex">
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${
                      currentStatusId >= 1 ? "bg-amber-500 text-white" : "bg-gray-200"
                    }`}>
                      {currentStatusId > 1 && currentStatusId !== 5 ? (
                        <CheckCircle2 size={16} color="#ffffff" />
                      ) : (
                        <Text className="text-white text-xs font-bold">1</Text>
                      )}
                    </View>
                    <Text className={`text-[9px] font-bold mt-1 text-center ${
                      currentStatusId >= 1 ? "text-amber-700" : "text-gray-400"
                    }`}>
                      قيد المراجعة
                    </Text>
                  </View>

                  {/* Line 1 */}
                  <View className={`h-0.5 flex-1 ${currentStatusId >= 2 && currentStatusId !== 5 ? "bg-blue-500" : "bg-gray-200"}`} />

                  {/* Step 2: Processing */}
                  <View className="items-center flex">
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${
                      currentStatusId >= 2 && currentStatusId !== 5 ? "bg-blue-500 text-white" : "bg-gray-200"
                    }`}>
                      {currentStatusId > 2 && currentStatusId !== 5 ? (
                        <CheckCircle2 size={16} color="#ffffff" />
                      ) : (
                        <Text className={`text-xs font-bold ${currentStatusId >= 2 && currentStatusId !== 5 ? "text-white" : "text-gray-400"}`}>2</Text>
                      )}
                    </View>
                    <Text className={`text-[9px] font-bold mt-1 text-center ${
                      currentStatusId >= 2 && currentStatusId !== 5 ? "text-blue-700" : "text-gray-400"
                    }`}>
                      قيد المعالجة
                    </Text>
                  </View>

                  {/* Line 2 */}
                  <View className={`h-0.5 flex-1 ${currentStatusId >= 3 && currentStatusId !== 5 ? "bg-indigo-500" : "bg-gray-200"}`} />

                  {/* Step 3: Shipped */}
                  <View className="items-center flex">
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${
                      currentStatusId >= 3 && currentStatusId !== 5 ? "bg-indigo-500 text-white" : "bg-gray-200"
                    }`}>
                      {currentStatusId > 3 && currentStatusId !== 5 ? (
                        <CheckCircle2 size={16} color="#ffffff" />
                      ) : (
                        <Text className={`text-xs font-bold ${currentStatusId >= 3 && currentStatusId !== 5 ? "text-white" : "text-gray-400"}`}>3</Text>
                      )}
                    </View>
                    <Text className={`text-[9px] font-bold mt-1 text-center ${
                      currentStatusId >= 3 && currentStatusId !== 5 ? "text-indigo-700" : "text-gray-400"
                    }`}>
                      تم الشحن
                    </Text>
                  </View>

                  {/* Line 3 */}
                  <View className={`h-0.5 flex-1 ${
                    currentStatusId === 5 ? "bg-rose-500" : currentStatusId === 4 ? "bg-emerald-500" : "bg-gray-200"
                  }`} />

                  {/* Step 4: Final State (Delivered / Cancelled) */}
                  <View className="items-center flex">
                    {currentStatusId === 5 ? (
                      <>
                        <View className="w-8 h-8 rounded-full items-center justify-center bg-rose-500">
                          <XCircle size={16} color="#ffffff" />
                        </View>
                        <Text className="text-[9px] font-bold mt-1 text-rose-700 text-center">
                          ملغى
                        </Text>
                      </>
                    ) : (
                      <>
                        <View className={`w-8 h-8 rounded-full items-center justify-center ${
                          currentStatusId === 4 ? "bg-emerald-500" : "bg-gray-200"
                        }`}>
                          <CheckCircle2 size={16} color={currentStatusId === 4 ? "#ffffff" : "#a0aec0"} />
                        </View>
                        <Text className={`text-[9px] font-bold mt-1 text-center ${
                          currentStatusId === 4 ? "text-emerald-700" : "text-gray-400"
                        }`}>
                          تم التوصيل
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                {/* Items List */}
                <Text className="text-right font-black text-gray-900 text-base mb-4">
                  المنتجات المشتراة
                </Text>

                {orderDetails.items?.map((item, idx) => (
                  <View
                    key={`${item.productId}-${item.productImageId}-${idx}`}
                    className="flex-row-reverse items-center justify-between py-3 border-b border-gray-100"
                  >
                    {/* Item Image */}
                    <View className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-full items-center justify-center">
                          <StyledPackage size={20} className="text-gray-400" />
                        </View>
                      )}
                    </View>

                    {/* Description */}
                    <View className="flex-1 items-end pr-4 pl-2">
                      <Text className="font-bold text-gray-900 text-sm text-right" numberOfLines={1}>
                        {item.productName}
                      </Text>
                      <Text className="text-gray-400 text-[10px] font-semibold mt-0.5">
                        الكمية المطلوبة: {item.quantity}
                      </Text>
                      <Text className="text-[#0F4C92] text-xs font-extrabold mt-1">
                        {item.unitPrice.toLocaleString("en-US")} {item.currencyId === 1 ? "ريال يمني" : "ريال سعودي"}
                      </Text>
                    </View>

                    {/* Total */}
                    <View className="items-start">
                      <Text className="text-gray-900 font-extrabold text-sm">
                        {(item.unitPrice * item.quantity).toLocaleString("en-US")}
                      </Text>
                      <Text className="text-gray-400 text-[9px] font-bold">
                        {item.currencyId === 1 ? "ريال يمني" : "ريال سعودي"}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Amounts Total Summary Box */}
                <View className="bg-gray-50 rounded-2xl p-4 mt-6 border border-gray-100">
                  <Text className="text-right font-black text-gray-800 text-sm mb-3">تفاصيل المجموع</Text>

                  {orderDetails.totalAmountYer > 0 && (
                    <View className="flex-row-reverse justify-between items-center mb-2">
                      <Text className="text-gray-500 font-bold text-xs">المجموع بالريال اليمني:</Text>
                      <Text className="text-gray-900 font-black text-sm">
                        {orderDetails.totalAmountYer.toLocaleString("en-US")} ر.ي
                      </Text>
                    </View>
                  )}

                  {orderDetails.totalAmountSar > 0 && (
                    <View className="flex-row-reverse justify-between items-center mb-2">
                      <Text className="text-gray-500 font-bold text-xs">المجموع بالريال السعودي:</Text>
                      <Text className="text-gray-900 font-black text-sm">
                        {orderDetails.totalAmountSar.toLocaleString("en-US")} ر.س
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* Bottom Actions Footer */}
              <View
                style={{ paddingBottom: safeBottom + 12 }}
                className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pt-3 flex-row-reverse gap-3 items-center"
              >
                {/* Cancel action if not terminal */}
                {!isTerminal && (
                  <TouchableOpacity
                    onPress={() => handleUpdateStatus(5, "ملغى")}
                    disabled={updateMutation.isPending}
                    className="bg-rose-600 rounded-full h-12 px-6 items-center justify-center shadow-xs active:opacity-90 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text className="text-white font-bold text-sm">إلغاء الطلب</Text>
                    )}
                  </TouchableOpacity>
                )}

                {/* Primary Transition flow CTA */}
                {!isTerminal && primaryAction ? (
                  <TouchableOpacity
                    onPress={() => handleUpdateStatus(primaryAction!.id, primaryAction!.label)}
                    disabled={updateMutation.isPending}
                    className="flex-1 bg-[#0F4C92] rounded-full h-12 items-center justify-center shadow-sm active:opacity-90 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text className="text-white font-bold text-sm">{primaryAction.label}</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  // Terminal Status indicator
                  <View className="flex-1 bg-gray-50 border border-gray-200 rounded-full h-12 items-center justify-center">
                    <Text className="text-gray-400 font-bold text-xs">
                      {currentStatusId === 4 ? "تم تسليم هذا الطلب للعميل بنجاح" : "هذا الطلب ملغى بالفعل"}
                    </Text>
                  </View>
                )}
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
