import type { JSX } from "react";
import { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  X,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import OrderListSkeleton from "../../components/OrderListSkeleton";
import OrderDetailSkeleton from "../../components/OrderDetailSkeleton";
import {
  useOrdersQuery,
  useOrderStatusesQuery,
  useOrderDetailsQuery,
  useCancelOrderMutation,
} from "../../hooks/useOrders";

// Arabic status names lookup mapping
const STATUS_ARABIC_MAP: Record<string, string> = {
  Pending: "قيد المراجعة",
  Processing: "قيد المعالجة",
  Shipped: "تم الشحن",
  Delivered: "تم التوصيل",
  Cancelled: "ملغى",
};

// Styling mapping for status badges
const STATUS_STYLE_MAP: Record<
  number,
  { bg: string; text: string; icon: any }
> = {
  1: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: Clock }, // Pending
  2: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", icon: Clock }, // Processing
  3: { bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700", icon: Package }, // Shipped
  4: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: CheckCircle2 }, // Delivered
  5: { bg: "bg-rose-50 border-rose-200", text: "text-rose-700", icon: XCircle }, // Cancelled
};

export default function OrdersScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { data: orders, isLoading: isLoadingOrders, error: ordersError, refetch: refetchOrders } = useOrdersQuery();
  const { data: statuses } = useOrderStatusesQuery();
  const cancelOrderMutation = useCancelOrderMutation();

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const start = Date.now();
    try {
      await refetchOrders();
    } catch (err) {
      console.warn("Refetch error:", err);
    } finally {
      const elapsed = Date.now() - start;
      const delay = Math.max(0, 800 - elapsed);
      setTimeout(() => {
        setIsRefreshing(false);
      }, delay);
    }
  };

  // Filter lists configuration
  const filterStatuses = [
    { id: null, name: "الكل" },
    { id: 1, name: "قيد المراجعة" },
    { id: 2, name: "قيد المعالجة" },
    { id: 3, name: "تم الشحن" },
    { id: 4, name: "تم التوصيل" },
    { id: 5, name: "ملغى" },
  ];

  // Helper to map status ID to string
  const getStatusDetails = (statusId: number) => {
    const statusObj = statuses?.find((s) => s.id === statusId);
    const englishName = statusObj ? statusObj.name : "Pending";
    const arabicName = STATUS_ARABIC_MAP[englishName] || englishName;
    const styles = STATUS_STYLE_MAP[statusId] || STATUS_STYLE_MAP[1];
    return { name: arabicName, ...styles };
  };

  // Helper to format date
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
    setIsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedOrderId(null);
    setIsModalOpen(false);
  };

  // Filter orders locally
  const filteredOrders = orders?.filter(
    (order) => selectedStatusId === null || order.orderStatusId === selectedStatusId
  );

  const safeTop = insets.top > 0 ? insets.top : 47;
  const safeBottom = insets.bottom > 0 ? insets.bottom : 20;

  // Dynamic status count computation matching admin
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

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Clean White Header Banner */}
      <View className="bg-white border-b border-gray-100/50" style={{ paddingTop: safeTop }}>
        <View className="flex-row-reverse items-center px-6 py-2.5">
          <Text className="text-lg font-bold text-gray-900 text-right">طلباتي</Text>
        </View>
      </View>

      {/* Status Filter Tabs (matching admin tabs layout) */}
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

      {/* Main Content Area */}
      <View className="flex-1 bg-[#f8fafd] pt-2">
        {isLoadingOrders ? (
          <OrderListSkeleton bottomPadding={safeBottom + 80} />
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingTop: 12, 
              paddingBottom: safeBottom + 80,
              paddingHorizontal: 16,
              flexGrow: 1,
            }}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              ordersError ? (
                <View className="flex-1 items-center justify-center py-20">
                  <AlertCircle size={48} color="#e53e3e" />
                  <Text className="text-gray-800 font-bold mt-4 text-center">
                    حدث خطأ أثناء تحميل الطلبات
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1 text-center">
                    {ordersError.message || "يرجى التحقق من اتصال الشبكة وإعادة المحاولة."}
                  </Text>
                  <TouchableOpacity
                    onPress={() => refetchOrders()}
                    className="bg-[#0F4C92] px-6 py-2.5 rounded-full mt-6"
                  >
                    <Text className="text-white font-bold">إعادة المحاولة</Text>
                  </TouchableOpacity>
                </View>
              ) : orders?.length === 0 ? (
                <View className="flex-1 items-center justify-center py-20">
                  <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                    <Package size={36} color="#a0aec0" />
                  </View>
                  <Text className="text-gray-800 font-bold text-lg text-center">لا توجد طلبات سابقة</Text>
                  <Text className="text-gray-500 text-sm mt-1 text-center">
                    لم تقم بإجراء أي طلبات حتى الآن.
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/" as any)}
                    className="bg-[#0F4C92] px-8 py-3 rounded-full mt-6 shadow-sm"
                  >
                    <Text className="text-white font-bold">تصفح المنتجات</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="flex-1 items-center justify-center py-20">
                  <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                    <Package size={36} color="#a0aec0" />
                  </View>
                  <Text className="text-gray-800 font-bold text-lg text-center">لا توجد طلبات تطابق التصفية</Text>
                  <Text className="text-gray-500 text-sm mt-1 text-center">
                    حاول اختيار حالة تصفية أخرى.
                  </Text>
                </View>
              )
            }
            renderItem={({ item }) => {
              const statusInfo = getStatusDetails(item.orderStatusId);
              const StatusIcon = statusInfo.icon;
              return (
                <TouchableOpacity
                  onPress={() => handleOpenDetails(item.id)}
                  activeOpacity={0.8}
                  className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm flex-row-reverse items-center justify-between"
                >
                  <View className="flex-1 items-end pl-2">
                    <View className="flex-row-reverse items-center gap-2 mb-1.5">
                      <Text className="font-black text-gray-900 text-base">
                        طلب #{item.id}
                      </Text>
                      <View className={`px-2.5 py-0.5 rounded-full border ${statusInfo.bg} flex-row-reverse items-center gap-1`}>
                        <StatusIcon size={12} className={statusInfo.text} />
                        <Text numberOfLines={1} className={`text-[10px] font-black ${statusInfo.text}`}>
                          {statusInfo.name}
                        </Text>
                      </View>
                    </View>
 
                    {/* Date */}
                    <View className="flex-row-reverse items-center gap-1.5 mb-2.5">
                      <Calendar size={13} color="#718096" />
                      <Text className="text-gray-500 text-xs font-semibold">
                        {formatDate(item.createdAt)}
                      </Text>
                    </View>
 
                    {/* Amounts */}
                    <View className="flex-row-reverse items-center gap-3">
                      {item.totalAmountYer > 0 && (
                        <View className="bg-blue-50/50 px-2 py-0.5 rounded-md border border-blue-100/50">
                          <Text className="text-[#0F4C92] text-xs font-extrabold">
                            {item.totalAmountYer.toLocaleString("en-US")} ريال يمني
                          </Text>
                        </View>
                      )}
                      {item.totalAmountSar > 0 && (
                        <View className="bg-emerald-50/50 px-2 py-0.5 rounded-md border border-emerald-100/50">
                          <Text className="text-emerald-700 text-xs font-extrabold">
                            {item.totalAmountSar.toLocaleString("en-US")} ريال سعودي
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
 
                  <ChevronLeft size={18} color="#a0aec0" />
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
 
      {/* Details Modal */}
      {selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          isOpen={isModalOpen}
          onClose={handleCloseDetails}
          getStatusDetails={getStatusDetails}
          formatDate={formatDate}
          cancelMutation={cancelOrderMutation}
        />
      )}
    </View>
  );
}
 
interface OrderDetailsModalProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
  getStatusDetails: (statusId: number) => { name: string; bg: string; text: string; icon: any };
  formatDate: (dateStr: string) => string;
  cancelMutation: ReturnType<typeof useCancelOrderMutation>;
}
 
function OrderDetailsModal({
  orderId,
  isOpen,
  onClose,
  getStatusDetails,
  formatDate,
  cancelMutation,
}: OrderDetailsModalProps) {
  const { data: orderDetails, isLoading, error } = useOrderDetailsQuery(orderId);
  const insets = useSafeAreaInsets();
 
  const handleCancelOrder = () => {
    Alert.alert(
      "إلغاء الطلب",
      "هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟",
      [
        { text: "تراجع", style: "cancel" },
        {
          text: "تأكيد الإلغاء",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelMutation.mutateAsync(orderId);
              Alert.alert("تم الإلغاء", "تم إلغاء طلبك بنجاح واسترجاع المخزون.");
              onClose();
            } catch (err: any) {
              Alert.alert("فشل الإلغاء", err.message || "حدث خطأ أثناء إلغاء الطلب.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
 
  const statusInfo = orderDetails ? getStatusDetails(orderDetails.orderStatusId) : null;
  const StatusIcon = statusInfo?.icon;
  const isPending = orderDetails?.orderStatusId === 1;
 
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
          {/* Modal Header */}
          <View className="flex-row-reverse items-center justify-between px-6 py-5 border-b border-gray-100">
            <Text className="font-black text-gray-900 text-lg">تفاصيل الطلب #{orderId}</Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            >
              <X size={18} color="#4a5568" />
            </TouchableOpacity>
          </View>
 
          {isLoading ? (
            <OrderDetailSkeleton />
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
                {/* Status and Date Summary Card */}
                <View className="bg-[#f8fafd] rounded-2xl p-4 border border-gray-100 mb-6 items-end">
                  <View className="flex-row-reverse items-center gap-2 mb-2">
                    <Text className="font-bold text-gray-400 text-xs">حالة الطلب:</Text>
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
 
                {/* Items List Title */}
                <Text className="text-right font-black text-gray-900 text-base mb-4">
                  المنتجات المشتراة
                </Text>
 
                {/* Items */}
                {orderDetails.items?.map((item, idx) => (
                  <View
                    key={`${item.productId}-${item.productImageId}-${idx}`}
                    className="flex-row-reverse items-center justify-between py-3 border-b border-gray-100"
                  >
                    {/* Item Thumbnail */}
                    <View className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          className="w-full h-full"
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-full items-center justify-center">
                          <Package size={20} color="#a0aec0" />
                        </View>
                      )}
                    </View>
 
                    {/* Info */}
                    <View className="flex-1 items-end pr-4 pl-2">
                      <Text className="font-bold text-gray-900 text-sm text-right" numberOfLines={1}>
                        {item.productName}
                      </Text>
                      <Text className="text-gray-400 text-[10px] font-semibold mt-0.5">
                        الكمية: {item.quantity}
                      </Text>
                      <Text className="text-[#0F4C92] text-xs font-extrabold mt-1">
                        {item.unitPrice.toLocaleString("en-US")} {item.currencyId === 1 ? "ريال يمني" : "ريال سعودي"}
                      </Text>
                    </View>
 
                    {/* Total Amount */}
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
 
                {/* Summary Calculations */}
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
                {isPending ? (
                  <TouchableOpacity
                    onPress={handleCancelOrder}
                    disabled={cancelMutation.isPending}
                    className="flex-1 bg-rose-600 rounded-full h-12 items-center justify-center shadow-sm active:opacity-90 disabled:opacity-50"
                  >
                    {cancelMutation.isPending ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text className="text-white font-bold text-sm">إلغاء الطلب</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View className="flex-1 bg-gray-50 border border-gray-200 rounded-full h-12 items-center justify-center">
                    <Text className="text-gray-400 font-bold text-xs">
                      {orderDetails.orderStatusId === 5 ? "تم إلغاء الطلب مسبقاً" : "لا يمكن إلغاء هذا الطلب"}
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
