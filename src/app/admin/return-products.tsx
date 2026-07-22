import type { JSX } from "react";
import { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { withUniwind } from "uniwind";
import { ArrowLeft, Plus, Minus, AlertCircle, Package, CheckCircle2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import {
  useAdminOrderDetailsQuery,
  useAdminEditOrderItemsMutation,
} from "../../hooks/useAdminOrders";
import { useAlert } from "../../contexts/AlertContext";
import { useAppToast } from "../../hooks/useAppToast";
import OrderDetailSkeleton from "../../components/OrderDetailSkeleton";

// Wrap Lucide icons with Uniwind for Tailwind CSS layout compatibility
const StyledArrowLeft = withUniwind(ArrowLeft);
const StyledPlus = withUniwind(Plus);
const StyledMinus = withUniwind(Minus);
const StyledAlertCircle = withUniwind(AlertCircle);
const StyledPackage = withUniwind(Package);
const StyledCheckCircle2 = withUniwind(CheckCircle2);

export default function ReturnProductsScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const { showAlert } = useAlert();
  const { showSuccessToast, showErrorToast } = useAppToast();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const parsedOrderId = orderId ? parseInt(orderId, 10) : 0;

  // Route guard: only allow users with Admin role
  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/" as any);
    }
  }, [user, isAdmin]);

  // Queries & Mutations
  const {
    data: orderDetails,
    isLoading: isLoadingOrder,
    error: orderError,
    refetch: refetchOrder,
  } = useAdminOrderDetailsQuery(parsedOrderId);

  const editOrderItemsMutation = useAdminEditOrderItemsMutation();

  // Local state to track modified quantities (productImageId -> quantity)
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    if (orderDetails && orderDetails.items) {
      const initialQtys: Record<number, number> = {};
      orderDetails.items.forEach((item) => {
        initialQtys[item.productImageId] = item.quantity;
      });
      setQuantities(initialQtys);
    }
  }, [orderDetails]);

  // Stepper increment/decrement handlers
  const handleDecrease = (productImageId: number) => {
    setQuantities((prev) => {
      const currentQty = prev[productImageId] ?? 0;
      return {
        ...prev,
        [productImageId]: Math.max(0, currentQty - 1),
      };
    });
  };

  const handleIncrease = (productImageId: number, originalQty: number) => {
    setQuantities((prev) => {
      const currentQty = prev[productImageId] ?? 0;
      return {
        ...prev,
        [productImageId]: Math.min(originalQty, currentQty + 1),
      };
    });
  };

  // Preview totals calculation
  const previewYer = useMemo(() => {
    if (!orderDetails || !orderDetails.items) return 0;
    return orderDetails.items.reduce((sum, item) => {
      if (item.currencyId === 1) {
        const qty = quantities[item.productImageId] ?? item.quantity;
        return sum + item.unitPrice * qty;
      }
      return sum;
    }, 0);
  }, [orderDetails, quantities]);

  const previewSar = useMemo(() => {
    if (!orderDetails || !orderDetails.items) return 0;
    return orderDetails.items.reduce((sum, item) => {
      if (item.currencyId === 2) {
        const qty = quantities[item.productImageId] ?? item.quantity;
        return sum + item.unitPrice * qty;
      }
      return sum;
    }, 0);
  }, [orderDetails, quantities]);

  // Detect changes compared to the original quantities
  const hasChanges = useMemo(() => {
    if (!orderDetails || !orderDetails.items) return false;
    return orderDetails.items.some((item) => {
      const qty = quantities[item.productImageId];
      return qty !== undefined && qty !== item.quantity;
    });
  }, [orderDetails, quantities]);

  const handleSave = () => {
    if (!hasChanges) return;

    showAlert(
      "تأكيد إرجاع المنتج",
      "هل أنت متأكد من رغبتك في إرجاع المنتجات المحددة؟",
      [
        { text: "تراجع", style: "cancel" },
        {
          text: "تأكيد ",
          style: "destructive",
          onPress: async () => {
            try {
              // Map state back to backend format (EditOrderItemInput: productImageId, quantity)
              const itemsPayload = Object.entries(quantities).map(([productImageId, qty]) => ({
                productImageId: parseInt(productImageId, 10),
                quantity: qty,
              }));

              const isReturningAll = itemsPayload.every(item => item.quantity === 0);

              try {
                await editOrderItemsMutation.mutateAsync({
                  id: parsedOrderId,
                  items: itemsPayload,
                });
              } catch (err: any) {
                // If returning all items, backend might delete the empty order and return 404.
                // In this case, we treat it as success since the order is successfully cleared.
                if (isReturningAll && err.response?.status === 404) {
                  // Revalidate orders list and dashboard queries since mutation failed callback was bypassed
                  queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
                  queryClient.invalidateQueries({ queryKey: ["admin-order", parsedOrderId] });
                  queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
                  queryClient.invalidateQueries({ queryKey: ["orders"] });
                  queryClient.invalidateQueries({ queryKey: ["order", parsedOrderId] });
                } else {
                  throw err;
                }
              }

              showSuccessToast(
                "تم الإسترجاع بنجاح",
                "تم تحديث كميات الطلب واسترجاع المنتجات المحددة إلى المخزون بنجاح."
              );
              router.back();
            } catch (err: any) {
              showErrorToast("فشل الإرجاع", err.response?.data?.errors?.join("\n") || err.message || "حدث خطأ أثناء تعديل عناصر الطلب.");
              console.log(err);
            }
          },
        },
      ]
    );
  };

  const safeTop = insets.top > 0 ? insets.top : 47;
  const safeBottom = insets.bottom > 0 ? insets.bottom : 20;

  if (isLoadingOrder) {
    return (
      <View className="flex-1 bg-[#f8fafd]">
        <StatusBar style="light" />
        <View className="bg-[#0F4C92]" style={{ paddingTop: safeTop }}>
          <View className="flex-row items-center justify-between px-6 py-2.5">
            <TouchableOpacity onPress={() => router.back()} className="p-1" activeOpacity={0.7}>
              <StyledArrowLeft size={24} className="text-white" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-white text-right">إرجاع المنتجات</Text>
          </View>
        </View>
        <OrderDetailSkeleton />
      </View>
    );
  }

  if (orderError || !orderDetails) {
    return (
      <View className="flex-1 bg-[#f8fafd]">
        <StatusBar style="light" />
        <View className="bg-[#0F4C92]" style={{ paddingTop: safeTop }}>
          <View className="flex-row items-center justify-between px-6 py-2.5">
            <TouchableOpacity onPress={() => router.back()} className="p-1" activeOpacity={0.7}>
              <StyledArrowLeft size={24} className="text-white" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-white text-right">إرجاع المنتجات</Text>
          </View>
        </View>
        <View className="flex-1 bg-[#f8fafd] px-6 justify-center items-center">
          <StyledAlertCircle size={48} className="text-red-500 mb-3" />
          <Text className="text-red-500 text-center font-bold text-base mb-2">
            تعذر تحميل تفاصيل الطلب
          </Text>
          <Text className="text-gray-500 text-center text-xs mb-4">
            {orderError?.message || "الطلب غير موجود"}
          </Text>
          <TouchableOpacity
            onPress={() => refetchOrder()}
            className="bg-[#0F4C92] px-6 py-2.5 rounded-full"
          >
            <Text className="text-white font-bold">إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8fafd]">
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-[#0F4C92]" style={{ paddingTop: safeTop }}>
        <View className="flex-row items-center justify-between px-6 py-2.5">
          <TouchableOpacity onPress={() => router.back()} className="p-1" activeOpacity={0.7}>
            <StyledArrowLeft size={24} className="text-white" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-white text-right">
            إرجاع المنتجات للطلب #{parsedOrderId}
          </Text>
        </View>
      </View>

      {/* Main Container */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: safeBottom + 160 }}
        className="px-6 pt-5"
      >
        {/* Info Banner */}
        <View className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-5 items-end">
          <Text className="text-amber-800 font-extrabold text-xs text-right mb-1">
            تعليمات الإرجاع
          </Text>
          <Text className="text-amber-700/80 text-[11px] font-bold text-right leading-5">
            يمكنك تقليل الكميات المطلوبة أو إزالتها بالكامل من خلال تعيين الكمية إلى صفر. لا يمكن
            زيادة الكمية عن الكمية الأصلية المطلوبة مسبقاً.
          </Text>
        </View>

        {/* Ordered Items List */}
        <Text className="text-right font-black text-gray-900 text-sm mb-3">
          المنتجات القابلة للإرجاع
        </Text>
        <View className="gap-3.5 mb-6">
          {orderDetails.items?.map((item) => {
            const currentQty = quantities[item.productImageId] ?? item.quantity;
            const originalQty = item.quantity;
            const isRemoved = currentQty === 0;

            return (
              <View
                key={item.productImageId}
                className={`bg-white rounded-2xl p-3.5 border flex-row-reverse items-center justify-between shadow-sm ${
                  isRemoved ? "border-red-100 bg-red-50/10" : "border-gray-100"
                }`}
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
                      <StyledPackage size={20} className="text-gray-400" />
                    </View>
                  )}
                </View>

                {/* Info */}
                <View className="flex-1 items-end pr-3.5 pl-2">
                  <Text
                    className="font-bold text-gray-900 text-sm text-right mb-0.5"
                    numberOfLines={1}
                  >
                    {item.productName}
                  </Text>

                  <View className="flex-row-reverse items-center gap-1.5 mb-1">
                    <Text className="text-gray-400 text-[10px] font-semibold">
                      الكمية الأصلية: {originalQty}
                    </Text>
                    {currentQty !== originalQty && (
                      <Text className="text-amber-600 text-[10px] font-bold">
                        (إرجاع {originalQty - currentQty})
                      </Text>
                    )}
                  </View>

                  <Text className="text-[#0F4C92] text-xs font-extrabold">
                    {item.unitPrice.toLocaleString("en-US")}{" "}
                    {item.currencyId === 1 ? "ريال يمني" : "ريال سعودي"}
                  </Text>
                </View>

                {/* Stepper controls */}
                <View className="items-center">
                  <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50/50">
                    <TouchableOpacity
                      onPress={() => handleDecrease(item.productImageId)}
                      disabled={currentQty === 0}
                      className="px-2.5 py-1.5"
                      activeOpacity={0.7}
                    >
                      <StyledMinus
                        size={13}
                        className={currentQty === 0 ? "text-gray-300" : "text-gray-500"}
                      />
                    </TouchableOpacity>

                    <Text
                      style={{ fontFamily: "System" }}
                      className={`px-2.5 text-xs font-bold min-w-[24px] text-center ${
                        isRemoved ? "text-red-500 font-extrabold" : "text-gray-800"
                      }`}
                    >
                      {currentQty}
                    </Text>

                    <TouchableOpacity
                      onPress={() => handleIncrease(item.productImageId, originalQty)}
                      disabled={currentQty === originalQty}
                      className="px-2.5 py-1.5"
                      activeOpacity={0.7}
                    >
                      <StyledPlus
                        size={13}
                        className={currentQty === originalQty ? "text-gray-300" : "text-gray-500"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Live Preview Totals Comparison */}
        {hasChanges && (
          <View className="bg-[#f0f7ff]/70 rounded-2xl p-4 border border-blue-100 items-end mb-6">
            <View className="flex-row-reverse items-center gap-1.5 mb-3">
              <StyledCheckCircle2 size={15} className="text-[#0F4C92]" />
              <Text className="text-[#0F4C92] font-black text-xs">
                معاينة الإجمالي الجديد بعد الإرجاع
              </Text>
            </View>

            {orderDetails.totalAmountYer > 0 && (
              <View className="flex-row-reverse justify-between w-full items-center mb-1.5">
                <Text className="text-gray-500 font-semibold text-[11px]">
                  المجموع بالريال اليمني:
                </Text>
                <View className="flex-row-reverse items-center gap-2">
                  <Text className="line-through text-gray-400 text-xs">
                    {orderDetails.totalAmountYer.toLocaleString("en-US")} ر.ي
                  </Text>
                  <Text className="text-[#0F4C92] font-black text-sm">
                    {previewYer.toLocaleString("en-US")} ر.ي
                  </Text>
                </View>
              </View>
            )}

            {orderDetails.totalAmountSar > 0 && (
              <View className="flex-row-reverse justify-between w-full items-center">
                <Text className="text-gray-500 font-semibold text-[11px]">
                  المجموع بالريال السعودي:
                </Text>
                <View className="flex-row-reverse items-center gap-2">
                  <Text className="line-through text-gray-400 text-xs">
                    {orderDetails.totalAmountSar.toLocaleString("en-US")} ر.س
                  </Text>
                  <Text className="text-emerald-700 font-black text-sm">
                    {previewSar.toLocaleString("en-US")} ر.س
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Fixed bottom action footer */}
      <View
        style={{ paddingBottom: safeBottom + 12 }}
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pt-4 flex-row-reverse gap-3 items-center"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={editOrderItemsMutation.isPending}
          className="bg-gray-100 rounded-2xl h-12 px-6 items-center justify-center border border-gray-200 active:bg-gray-200"
          activeOpacity={0.7}
        >
          <Text className="text-gray-700 font-bold text-sm">إلغاء</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSave}
          disabled={editOrderItemsMutation.isPending || !hasChanges}
          className={`flex-1 rounded-2xl h-12 items-center justify-center shadow-sm flex-row gap-2 ${
            !hasChanges ? "bg-gray-300 opacity-60" : "bg-amber-600 active:bg-amber-700"
          }`}
          activeOpacity={0.8}
        >
          {editOrderItemsMutation.isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text className="text-white font-bold text-sm">حفظ وإرجاع المنتجات</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
