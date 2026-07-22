import type { JSX } from "react";
import { useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import {
  TrendingUp,
  Package,
  Users,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../../hooks/useAuth";
import { useAdminDashboardQuery } from "../../../hooks/useAdminDashboard";
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

  // Single Admin Dashboard Query
  const { data: stats, isLoading, refetch, isRefetching } = useAdminDashboardQuery();

  // Auto refetch when page gets focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleRefresh = async () => {
    await refetch();
  };

  const safeTop = insets.top > 0 ? insets.top : 47;

  if (isLoading && !isRefetching) {
    return (
      <View className="flex-1 bg-[#f8fafd]">
        <StatusBar style="light" />
        {/* Clean Blue Header Banner */}
        <View className="bg-[#0F4C92]" style={{ paddingTop: safeTop }}>
          <View className="flex-row-reverse items-center px-6 py-2.5">
            <Text className="text-xl font-bold text-white text-right">الرئيسية</Text>
          </View>
        </View>
        <DashboardSkeleton />
      </View>
    );
  }

  const totalSalesYer = stats?.totalSalesYer ?? 0;
  const totalSalesSar = stats?.totalSalesSar ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const pendingOrdersCount = stats?.pendingOrdersCount ?? 0;
  const processingOrdersCount = stats?.processingOrdersCount ?? 0;
  const shippedOrdersCount = stats?.shippedOrdersCount ?? 0;
  const deliveredOrdersCount = stats?.deliveredOrdersCount ?? 0;
  const cancelledOrdersCount = stats?.cancelledOrdersCount ?? 0;
  const totalActiveProducts = stats?.totalActiveProducts ?? 0;
  const outOfStockProductsCount = stats?.outOfStockProductsCount ?? 0;
  const totalRepresentatives = stats?.totalRepresentatives ?? 0;
  const activeRepresentatives = stats?.activeRepresentatives ?? 0;

  return (
    <View className="flex-1 bg-[#f8fafd]">
      <StatusBar style="light" />

      {/* Clean Blue Header Banner */}
      <View className="bg-[#0F4C92]" style={{ paddingTop: safeTop }}>
        <View className="flex-row-reverse items-center px-6 py-2.5">
          <Text className="text-lg font-bold text-white text-right">الرئيسية</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 90,
          paddingHorizontal: 16,
          paddingTop: 16,
        }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />}
      >
        {/* Refresh button or status */}
        <View className="flex-row-reverse justify-between items-center mb-4">
          <Text className="text-base font-bold text-gray-800">إحصائيات النظام</Text>
        </View>

        {/* Sales Cards Row */}
        <View className="flex-row-reverse gap-3 mb-4">
          {/* YER Sales */}
          <View className="flex-1 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs items-end">
            <View className="w-8 h-8 rounded-xl bg-emerald-50 items-center justify-center mb-2">
              <DollarSign size={16} className="text-emerald-600" />
            </View>
            <Text className="text-[11px] font-bold text-gray-400">إجمالي المبيعات (ريال يمني)</Text>
            <Text className="text-base font-black text-gray-800 mt-1 text-right" numberOfLines={1}>
              {totalSalesYer.toLocaleString("en-US")}
            </Text>
          </View>

          {/* SAR Sales */}
          <View className="flex-1 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs items-end">
            <View className="w-8 h-8 rounded-xl bg-emerald-50 items-center justify-center mb-2">
              <DollarSign size={16} className="text-emerald-600" />
            </View>
            <Text className="text-[11px] font-bold text-gray-400">
              إجمالي المبيعات (ريال سعودي)
            </Text>
            <Text className="text-base font-black text-gray-800 mt-1 text-right" numberOfLines={1}>
              {totalSalesSar.toLocaleString("en-US")}
            </Text>
          </View>
        </View>

        {/* Orders Status Grid Title */}
        <Text className="text-sm font-extrabold text-gray-400 text-right mb-2">ملخص الطلبات</Text>

        {/* Orders Status Grid */}
        <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs gap-3 mb-4">
          <TouchableOpacity
            onPress={() => router.push("/admin/orders" as any)}
            activeOpacity={0.7}
            className="flex-row-reverse items-center justify-between"
          >
            <View className="flex-row-reverse items-center gap-2">
              <View className="w-7 h-7 rounded-lg bg-blue-50 items-center justify-center">
                <ShoppingBag size={14} className="text-[#0F4C92]" />
              </View>
              <Text className="text-sm font-bold text-gray-700">إجمالي الطلبات</Text>
            </View>
            <Text className="text-sm font-extrabold text-gray-900">{totalOrders}</Text>
          </TouchableOpacity>

          <View className="h-[1px] bg-gray-50" />

          {/* Grid list of details */}
          <View className="flex-row-reverse flex-wrap gap-2.5">
            {/* Pending Review */}
            <TouchableOpacity
              onPress={() => router.push("/admin/orders?statusId=1" as any)}
              activeOpacity={0.7}
              className="w-[48%] bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 items-end"
            >
              <Text className="text-[11px] font-bold text-gray-400">قيد المراجعة</Text>
              <Text className="text-base font-black text-amber-600 mt-0.5">{pendingOrdersCount}</Text>
            </TouchableOpacity>

            {/* Processing */}
            <TouchableOpacity
              onPress={() => router.push("/admin/orders?statusId=2" as any)}
              activeOpacity={0.7}
              className="w-[48%] bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 items-end"
            >
              <Text className="text-[11px] font-bold text-gray-400">قيد المعالجة</Text>
              <Text className="text-base font-black text-[#0F4C92] mt-0.5">
                {processingOrdersCount}
              </Text>
            </TouchableOpacity>

            {/* Shipped */}
            <TouchableOpacity
              onPress={() => router.push("/admin/orders?statusId=3" as any)}
              activeOpacity={0.7}
              className="w-[48%] bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 items-end"
            >
              <Text className="text-[11px] font-bold text-gray-400">تم الشحن</Text>
              <Text className="text-base font-black text-blue-500 mt-0.5">{shippedOrdersCount}</Text>
            </TouchableOpacity>

            {/* Delivered */}
            <TouchableOpacity
              onPress={() => router.push("/admin/orders?statusId=4" as any)}
              activeOpacity={0.7}
              className="w-[48%] bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 items-end"
            >
              <Text className="text-[11px] font-bold text-gray-400">تم التوصيل</Text>
              <Text className="text-base font-black text-emerald-600 mt-0.5">
                {deliveredOrdersCount}
              </Text>
            </TouchableOpacity>

            {/* Cancelled */}
            <TouchableOpacity
              onPress={() => router.push("/admin/orders?statusId=5" as any)}
              activeOpacity={0.7}
              className="w-[48%] bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 items-end"
            >
              <Text className="text-[11px] font-bold text-gray-400">ملغى</Text>
              <Text className="text-base font-black text-red-500 mt-0.5">{cancelledOrdersCount}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inventory & Representatives Grid Title */}
        <Text className="text-sm font-extrabold text-gray-400 text-right mb-2">
          المخزون والمندوبين
        </Text>

        {/* Inventory & Representatives Grid */}
        <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs gap-3">
          {/* Total Active Products */}
          <TouchableOpacity
            onPress={() => router.push("/admin/products" as any)}
            activeOpacity={0.7}
            className="flex-row-reverse items-center justify-between"
          >
            <View className="flex-row-reverse items-center gap-2">
              <View className="w-7 h-7 rounded-lg bg-blue-50 items-center justify-center">
                <Package size={14} className="text-[#0F4C92]" />
              </View>
              <Text className="text-sm font-bold text-gray-700">إجمالي المنتجات المعروضة</Text>
            </View>
            <Text className="text-sm font-extrabold text-gray-900">{totalActiveProducts}</Text>
          </TouchableOpacity>

          <View className="h-[1px] bg-gray-50" />

          {/* Out of Stock Products */}
          <TouchableOpacity
            onPress={() => router.push("/admin/products" as any)}
            activeOpacity={0.7}
            className="flex-row-reverse items-center justify-between"
          >
            <View className="flex-row-reverse items-center gap-2">
              <View className="w-7 h-7 rounded-lg bg-amber-50 items-center justify-center">
                <AlertTriangle size={14} className="text-amber-600" />
              </View>
              <Text className="text-sm font-bold text-gray-700">منتجات نفد مخزونها</Text>
            </View>
            <Text className="text-sm font-extrabold text-amber-600">{outOfStockProductsCount}</Text>
          </TouchableOpacity>

          <View className="h-[1px] bg-gray-50" />

          {/* Total & Active Representatives */}
          <TouchableOpacity
            onPress={() => router.push("/admin/representatives" as any)}
            activeOpacity={0.7}
            className="flex-row-reverse items-center justify-between"
          >
            <View className="flex-row-reverse items-center gap-2">
              <View className="w-7 h-7 rounded-lg bg-blue-50 items-center justify-center">
                <Users size={14} className="text-[#0F4C92]" />
              </View>
              <Text className="text-sm font-bold text-gray-700">إجمالي المندوبين</Text>
            </View>
            <Text className="text-sm font-extrabold text-gray-900">
              {totalRepresentatives} ({activeRepresentatives} نشط)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
