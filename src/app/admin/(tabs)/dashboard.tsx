import type { JSX } from "react";
import { useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  TrendingUp,
  Package,
  Users,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../../hooks/useAuth";
import { useAdminOrdersQuery } from "../../../hooks/useAdminOrders";
import { useProductsQuery } from "../../../hooks/useProducts";
import { useRepresentativesQuery } from "../../../hooks/useRepresentatives";
import DashboardSkeleton from "../../../components/DashboardSkeleton";

export default function AdminDashboardScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();

  // Route guard: only allow users with Admin role
  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/" as any);
    }
  }, [user, isAdmin]);

  // Query Hooks
  const { data: orders = [], isLoading: isLoadingOrders, refetch: refetchOrders, isRefetching: isRefetchingOrders } = useAdminOrdersQuery();
  const { data: products = [], isLoading: isLoadingProducts, refetch: refetchProducts, isRefetching: isRefetchingProducts } = useProductsQuery({});
  const { data: representatives = [], isLoading: isLoadingReps, refetch: refetchReps, isRefetching: isRefetchingReps } = useRepresentativesQuery();

  const handleRefresh = async () => {
    await Promise.all([refetchOrders(), refetchProducts(), refetchReps()]);
  };

  const isRefreshing = isRefetchingOrders || isRefetchingProducts || isRefetchingReps;
  const isLoading = isLoadingOrders || isLoadingProducts || isLoadingReps;

  // Calculate Statistics
  const stats = useMemo(() => {
    const ordersList = Array.isArray(orders) ? orders : [];
    const productsList = Array.isArray(products) ? products : [];
    const repsList = Array.isArray(representatives) ? representatives : [];

    // Sales calculations (only for Delivered status - ID: 4)
    let totalSalesYer = 0;
    let totalSalesSar = 0;
    let pendingOrdersCount = 0; // ID: 1 (Review) or ID: 2 (Processing)
    let processingOrdersCount = 0;
    let shippedOrdersCount = 0;
    let deliveredOrdersCount = 0;
    let cancelledOrdersCount = 0;

    ordersList.forEach((order) => {
      if (order.orderStatusId === 4) {
        totalSalesYer += order.totalAmountYer || 0;
        totalSalesSar += order.totalAmountSar || 0;
        deliveredOrdersCount++;
      } else if (order.orderStatusId === 1) {
        pendingOrdersCount++;
      } else if (order.orderStatusId === 2) {
        processingOrdersCount++;
      } else if (order.orderStatusId === 3) {
        shippedOrdersCount++;
      } else if (order.orderStatusId === 5) {
        cancelledOrdersCount++;
      }
    });

    // Products calculations
    const totalProducts = productsList.length;
    let outOfStockCount = 0;
    productsList.forEach((product) => {
      const totalQty = product.images?.reduce((sum, img) => sum + (img.quantityInStock || 0), 0) || 0;
      if (totalQty === 0) {
        outOfStockCount++;
      }
    });

    // Representatives calculations
    const totalReps = repsList.length;
    const activeReps = repsList.filter((r) => r.isActive).length;

    return {
      totalSalesYer,
      totalSalesSar,
      totalOrders: ordersList.length,
      pendingOrders: pendingOrdersCount,
      processingOrders: processingOrdersCount,
      shippedOrders: shippedOrdersCount,
      deliveredOrders: deliveredOrdersCount,
      cancelledOrders: cancelledOrdersCount,
      totalProducts,
      outOfStock: outOfStockCount,
      totalReps,
      activeReps,
    };
  }, [orders, products, representatives]);

  const safeTop = insets.top > 0 ? insets.top : 47;

  if (isLoading && !isRefreshing) {
    return (
      <View className="flex-1 bg-[#f8fafd]">
        <StatusBar style="dark" />
        {/* Clean White Header Banner */}
        <View className="bg-white border-b border-gray-100/50" style={{ paddingTop: safeTop }}>
          <View className="flex-row-reverse items-center px-6 py-2.5">
            <Text className="text-lg font-bold text-gray-900 text-right">الرئيسية</Text>
          </View>
        </View>
        <DashboardSkeleton />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8fafd]">
      <StatusBar style="dark" />

      {/* Clean White Header Banner */}
      <View className="bg-white border-b border-gray-100/50" style={{ paddingTop: safeTop }}>
        <View className="flex-row-reverse items-center px-6 py-2.5">
          <Text className="text-lg font-bold text-gray-900 text-right">الرئيسية</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 90,
          paddingHorizontal: 16,
          paddingTop: 16,
        }}
      >
        {/* Refresh button or status */}
        <View className="flex-row-reverse justify-between items-center mb-4">
          <Text className="text-sm font-bold text-gray-800">إحصائيات النظام</Text>
          <TouchableOpacity onPress={handleRefresh} disabled={isRefreshing}>
            <Text className="text-xs font-bold text-[#0F4C92]">
              {isRefreshing ? "جاري التحديث..." : "تحديث البيانات"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sales Cards Row */}
        <View className="flex-row-reverse gap-3 mb-4">
          {/* YER Sales */}
          <View className="flex-1 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs items-end">
            <View className="w-8 h-8 rounded-xl bg-emerald-50 items-center justify-center mb-2">
              <TrendingUp size={16} className="text-emerald-600" />
            </View>
            <Text className="text-[10px] font-bold text-gray-400">إجمالي المبيعات (ريال يمني)</Text>
            <Text className="text-sm font-black text-gray-800 mt-1 text-right" numberOfLines={1}>
              {stats.totalSalesYer.toLocaleString("en-US")}
            </Text>
          </View>

          {/* SAR Sales */}
          <View className="flex-1 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs items-end">
            <View className="w-8 h-8 rounded-xl bg-emerald-50 items-center justify-center mb-2">
              <DollarSign size={16} className="text-emerald-600" />
            </View>
            <Text className="text-[10px] font-bold text-gray-400">إجمالي المبيعات (ريال سعودي)</Text>
            <Text className="text-sm font-black text-gray-800 mt-1 text-right" numberOfLines={1}>
              {stats.totalSalesSar.toLocaleString("en-US")}
            </Text>
          </View>
        </View>

        {/* Orders Status Grid Title */}
        <Text className="text-xs font-extrabold text-gray-400 text-right mb-2">ملخص الطلبات</Text>

        {/* Orders Status Grid */}
        <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs gap-3 mb-4">
          <View className="flex-row-reverse items-center justify-between">
            <View className="flex-row-reverse items-center gap-2">
              <View className="w-7 h-7 rounded-lg bg-blue-50 items-center justify-center">
                <ShoppingBag size={14} className="text-[#0F4C92]" />
              </View>
              <Text className="text-xs font-bold text-gray-700">إجمالي الطلبات</Text>
            </View>
            <Text className="text-xs font-extrabold text-gray-900">{stats.totalOrders}</Text>
          </View>

          <View className="h-[1px] bg-gray-50" />

          {/* Grid list of details */}
          <View className="flex-row-reverse flex-wrap gap-2.5">
            {/* Pending Review */}
            <View className="w-[48%] bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 items-end">
              <Text className="text-[9px] font-bold text-gray-400">قيد المراجعة</Text>
              <Text className="text-sm font-black text-amber-600 mt-0.5">{stats.pendingOrders}</Text>
            </View>

            {/* Processing */}
            <View className="w-[48%] bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 items-end">
              <Text className="text-[9px] font-bold text-gray-400">قيد المعالجة</Text>
              <Text className="text-sm font-black text-[#0F4C92] mt-0.5">{stats.processingOrders}</Text>
            </View>

            {/* Shipped */}
            <View className="w-[48%] bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 items-end">
              <Text className="text-[9px] font-bold text-gray-400">تم الشحن</Text>
              <Text className="text-sm font-black text-blue-500 mt-0.5">{stats.shippedOrders}</Text>
            </View>

            {/* Delivered */}
            <View className="w-[48%] bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 items-end">
              <Text className="text-[9px] font-bold text-gray-400">تم التوصيل</Text>
              <Text className="text-sm font-black text-emerald-600 mt-0.5">{stats.deliveredOrders}</Text>
            </View>

            {/* Cancelled */}
            <View className="w-[48%] bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 items-end">
              <Text className="text-[9px] font-bold text-gray-400">ملغى</Text>
              <Text className="text-sm font-black text-red-500 mt-0.5">{stats.cancelledOrders}</Text>
            </View>
          </View>
        </View>

        {/* Inventory & Representatives Grid Title */}
        <Text className="text-xs font-extrabold text-gray-400 text-right mb-2">المخزون والمندوبين</Text>

        {/* Inventory & Representatives Grid */}
        <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs gap-3">
          {/* Total Products */}
          <View className="flex-row-reverse items-center justify-between">
            <View className="flex-row-reverse items-center gap-2">
              <View className="w-7 h-7 rounded-lg bg-blue-50 items-center justify-center">
                <Package size={14} className="text-[#0F4C92]" />
              </View>
              <Text className="text-xs font-bold text-gray-700">إجمالي المنتجات المعروضة</Text>
            </View>
            <Text className="text-xs font-extrabold text-gray-900">{stats.totalProducts}</Text>
          </View>

          <View className="h-[1px] bg-gray-50" />

          {/* Out of Stock */}
          <View className="flex-row-reverse items-center justify-between">
            <View className="flex-row-reverse items-center gap-2">
              <View className="w-7 h-7 rounded-lg bg-amber-50 items-center justify-center">
                <AlertTriangle size={14} className="text-amber-600" />
              </View>
              <Text className="text-xs font-bold text-gray-700">منتجات نفد مخزونها</Text>
            </View>
            <Text className="text-xs font-extrabold text-amber-600">{stats.outOfStock}</Text>
          </View>

          <View className="h-[1px] bg-gray-50" />

          {/* Total Representatives */}
          <View className="flex-row-reverse items-center justify-between">
            <View className="flex-row-reverse items-center gap-2">
              <View className="w-7 h-7 rounded-lg bg-blue-50 items-center justify-center">
                <Users size={14} className="text-[#0F4C92]" />
              </View>
              <Text className="text-xs font-bold text-gray-700">إجمالي المندوبين</Text>
            </View>
            <Text className="text-xs font-extrabold text-gray-900">
              {stats.totalReps} ({stats.activeReps} نشط)
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
