import type { JSX } from "react";
import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { withUniwind } from "uniwind";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Check,
} from "lucide-react-native";

import { useCartStore } from "../../store/cartStore";
import { productService } from "../../services/product.service";
import { useAuth } from "../../hooks/useAuth";
import { orderService, OrderResponseData } from "../../services/order.service";

// Wrap Lucide Icons with Uniwind
const StyledShoppingCart = withUniwind(ShoppingCart);
const StyledX = withUniwind(X);
const StyledPlus = withUniwind(Plus);
const StyledMinus = withUniwind(Minus);
const StyledCheck = withUniwind(Check);

export default function CartScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { items, updateQuantity, removeItem, toggleSelect, setItems } = useCartStore();

  const { isAuthenticated } = useAuth();
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isValidatingPrices, setIsValidatingPrices] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState<OrderResponseData | null>(null);

  const [isValidating, setIsValidating] = useState(false);

  // Validate stock on screen focus
  const validateCartStock = useCallback(async () => {
    const currentItems = useCartStore.getState().items;
    if (currentItems.length === 0) return;

    setIsValidating(true);
    let changesFound = false;
    const updatedItems = [...currentItems];
    const messages: string[] = [];

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      try {
        const product = await productService.getProduct(item.productId);
        if (!product || !product.isActive) {
          // Product is inactive or deleted
          updatedItems.splice(i, 1);
          i--;
          changesFound = true;
          messages.push(`تمت إزالة "${item.name}" لأنه لم يعد متوفرًا.`);
          continue;
        }

        const variation = product.images.find((img) => img.id === item.productImageId);
        if (!variation) {
          // Variation not found
          updatedItems.splice(i, 1);
          i--;
          changesFound = true;
          messages.push(`تمت إزالة خيار المنتج لـ "${item.name}" لأنه غير متوفر.`);
          continue;
        }

        // Update stock level info
        if (item.quantityInStock !== variation.quantityInStock) {
          updatedItems[i] = {
            ...item,
            quantityInStock: variation.quantityInStock,
          };
          changesFound = true;
        }

        // Check if quantity exceeds stock
        if (item.quantity > variation.quantityInStock) {
          if (variation.quantityInStock <= 0) {
            updatedItems.splice(i, 1);
            i--;
            messages.push(`نفدت كمية "${item.name}" وتمت إزالته من السلة.`);
          } else {
            updatedItems[i] = {
              ...updatedItems[i],
              quantity: variation.quantityInStock,
            };
            messages.push(
              `تم تعديل كمية "${item.name}" إلى الحد الأقصى المتاح (${variation.quantityInStock} قطع).`
            );
          }
          changesFound = true;
        }

        // Update price if changed
        if (item.price !== product.price) {
          updatedItems[i] = {
            ...updatedItems[i],
            price: product.price,
          };
          changesFound = true;
        }
      } catch (error) {
        console.error("Error validating item stock:", item.productId, error);
      }
    }

    if (changesFound) {
      setItems(updatedItems);
      if (messages.length > 0) {
        Alert.alert("تحديث المخزن للسلة", messages.join("\n"), [{ text: "حسنًا" }]);
      }
    }
    setIsValidating(false);
  }, [setItems]);

  useFocusEffect(
    useCallback(() => {
      validateCartStock();
    }, [validateCartStock])
  );





  // Format currency symbol
  const getCurrencySymbol = (name: string) => {
    if (name === "ريال يمني") return "ر.ي";
    if (name === "ريال سعودي") return "ر.س";
    return name;
  };

  // Calculate totals grouped explicitly by Saudi Riyal and Yemeni Riyal
  const totals = useMemo(() => {
    const selectedItems = items.filter((i) => i.selected);
    let saudiTotal = 0;
    let yemeniTotal = 0;
    const otherTotals: { [key: string]: number } = {};

    selectedItems.forEach((item) => {
      const name = item.currencyName || "";
      if (name.includes("سعودي") || item.currencyId === 2 || name === "SAR" || name === "ر.س") {
        saudiTotal += item.price * item.quantity;
      } else if (name.includes("يمني") || item.currencyId === 1 || name === "YER" || name === "ر.ي") {
        yemeniTotal += item.price * item.quantity;
      } else {
        otherTotals[name] = (otherTotals[name] || 0) + item.price * item.quantity;
      }
    });

    return { saudiTotal, yemeniTotal, otherTotals };
  }, [items]);

  // Plus button handler in cart
  const handleIncreaseQuantity = (item: any) => {
    if (item.quantity >= item.quantityInStock) {
      Alert.alert(
        "الحد الأقصى للمخزن",
        `عذرًا، المتوفر في المخزن هو (${item.quantityInStock}) قطع فقط لهذا الخيار.`
      );
      return;
    }
    updateQuantity(item.productId, item.productImageId, item.quantity + 1);
  };

  // Minus button handler in cart
  const handleDecreaseQuantity = (item: any) => {
    if (item.quantity <= 1) return;
    updateQuantity(item.productId, item.productImageId, item.quantity - 1);
  };

  // Checkout order placement handler — validates latest prices before opening confirm modal
  const handleCheckout = async () => {
    const selectedItems = items.filter((i) => i.selected);
    if (selectedItems.length === 0) {
      Alert.alert("تنبيه", "يرجى تحديد منتجات على الأقل لإتمام الطلب.");
      return;
    }

    if (!isAuthenticated) {
      Alert.alert(
        "تنبيه",
        "يرجى تسجيل الدخول أولاً لإتمام الطلب.",
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "تسجيل الدخول",
            onPress: () => {
              router.push("/login");
            },
          },
        ]
      );
      return;
    }

    // --- Pre-checkout price validation ---
    setIsValidatingPrices(true);
    try {
      const currentItems = useCartStore.getState().items;
      const updatedItems = [...currentItems];
      const priceChanges: { name: string; oldPrice: number; newPrice: number }[] = [];

      for (let i = 0; i < updatedItems.length; i++) {
        const item = updatedItems[i];
        if (!item.selected) continue; // Only validate selected items
        try {
          const product = await productService.getProduct(item.productId);
          if (product && product.price !== item.price) {
            priceChanges.push({
              name: item.name,
              oldPrice: item.price,
              newPrice: product.price,
            });
            updatedItems[i] = { ...item, price: product.price };
          }
        } catch (error) {
          console.error("Price validation error for item:", item.productId, error);
        }
      }

      if (priceChanges.length > 0) {
        // Update cart with new prices
        setItems(updatedItems);

        const changesSummary = priceChanges
          .map((c) => `• ${c.name}\n  السعر القديم: ${c.oldPrice} — السعر الجديد: ${c.newPrice}`)
          .join("\n\n");

        Alert.alert(
          "⚠️ تغيّرت أسعار بعض المنتجات",
          `تم تحديث الأسعار التالية من قِبل الإدارة:\n\n${changesSummary}\n\nهل تريد المتابعة بالأسعار الجديدة؟`,
          [
            { text: "إلغاء", style: "cancel" },
            {
              text: "متابعة بالأسعار الجديدة",
              onPress: () => setIsConfirmModalVisible(true),
            },
          ]
        );
      } else {
        // No price changes — open modal directly
        setIsConfirmModalVisible(true);
      }
    } catch (error) {
      console.error("Checkout price validation failed:", error);
      // If validation itself fails, still allow proceeding
      setIsConfirmModalVisible(true);
    } finally {
      setIsValidatingPrices(false);
    }
  };

  const handlePlaceOrder = async () => {
    const selectedItems = items.filter((i) => i.selected);
    if (selectedItems.length === 0) return;

    setIsSubmittingOrder(true);
    try {
      // --- Second price check: re-validate prices RIGHT before placing order ---
      const currentItems = useCartStore.getState().items;
      const updatedItems = [...currentItems];
      const priceChanges: { name: string; oldPrice: number; newPrice: number }[] = [];

      for (let i = 0; i < updatedItems.length; i++) {
        const item = updatedItems[i];
        if (!item.selected) continue;
        try {
          const product = await productService.getProduct(item.productId);
          if (product && product.price !== item.price) {
            priceChanges.push({
              name: item.name,
              oldPrice: item.price,
              newPrice: product.price,
            });
            updatedItems[i] = { ...item, price: product.price };
          }
        } catch (error) {
          console.error("Pre-order price check error:", item.productId, error);
        }
      }

      if (priceChanges.length > 0) {
        // Update cart with latest prices and ABORT the order
        setItems(updatedItems);
        setIsConfirmModalVisible(false);

        const changesSummary = priceChanges
          .map((c) => `• ${c.name}\n  السعر القديم: ${c.oldPrice} — السعر الجديد: ${c.newPrice}`)
          .join("\n\n");

        Alert.alert(
          "⚠️ تغيّرت الأسعار قبل إتمام الطلب",
          `قامت الإدارة بتغيير الأسعار أثناء مراجعتك للطلب:\n\n${changesSummary}\n\nتم تحديث سلتك بالأسعار الجديدة. يرجى مراجعة الطلب والتأكيد من جديد.`,
          [{ text: "حسنًا", style: "default" }]
        );
        return; // Abort — do not place order
      }

      // All prices are confirmed fresh — place the order
      const orderItems = selectedItems.map((item) => ({
        productImageId: item.productImageId,
        quantity: item.quantity,
      }));

      const result = await orderService.placeOrder({ items: orderItems });

      setCreatedOrderData(result);
      setIsConfirmModalVisible(false);
      setIsSuccessModalVisible(true);

      // Remove checked-out items from cart
      const remainingItems = items.filter((i) => !i.selected);
      setItems(remainingItems);
    } catch (error: any) {
      console.error("Order placement failed:", error);
      let errorMsg = "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.";
      if (error.response?.data?.errors) {
        if (Array.isArray(error.response.data.errors)) {
          errorMsg = error.response.data.errors.join("\n");
        } else {
          errorMsg = String(error.response.data.errors);
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      Alert.alert("خطأ في إرسال الطلب", errorMsg, [{ text: "حسنًا" }]);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const safeTop = insets.top > 0 ? insets.top : 36;
  const safeBottom = insets.bottom > 0 ? insets.bottom + 12 : 28;
  const tabHeight = 64 + (insets.bottom > 0 ? insets.bottom : 28);

  return (
    <View className="flex-1 bg-[#f8fafd]">
      <StatusBar style="dark" />
      
      {/* Header bar */}
      <View
        className="bg-white border-b border-gray-100 flex-row-reverse items-center justify-between px-6 py-4 shadow-xs"
        style={{ paddingTop: safeTop }}
      >
        {/* Title */}
        <Text className="text-[22px] font-black text-[#0c3f7c] text-right">
          سلة التسوق
        </Text>

        
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: safeBottom + 120 }}
        className="flex-1"
      >


        {/* Stock Validation indicator */}
        {isValidating && (
          <View className="flex-row justify-center items-center py-3 gap-2 bg-[#f0f7ff] border-y border-blue-50 mt-3">
            <ActivityIndicator size="small" color="#0c3f7c" />
            <Text className="text-xs text-[#0c3f7c] font-bold">
              جاري التحقق من توفر الكميات في المخزن...
            </Text>
          </View>
        )}

        {/* Empty state */}
        {items.length === 0 ? (
          <View className="items-center justify-center py-20 px-8">
            <StyledShoppingCart size={64} className="text-slate-300 mb-4" />
            <Text className="text-slate-500 font-black text-base text-center">
              سلة المشتريات فارغة حاليًا
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/shop")}
              className="mt-6 bg-[#0c3f7c] px-6 py-3 rounded-2xl active:opacity-90 shadow-sm"
            >
              <Text className="text-white font-extrabold text-xs">تصفح المتجر الآن</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-5 mt-4 gap-4">
            {/* List of Cart Items */}
            {items.map((item) => {
              const currencySymbol = getCurrencySymbol(item.currencyName);

              return (
                <View
                  key={`${item.productId}-${item.productImageId}`}
                  className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-xs flex-row-reverse items-center justify-between"
                >
                  {/* Right side: Checkbox + Image */}
                  <View className="flex-row-reverse items-center gap-3">
                    {/* Circle Checkbox Selection Button */}
                    <TouchableOpacity
                      onPress={() => toggleSelect(item.productId, item.productImageId)}
                      activeOpacity={0.8}
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        item.selected
                          ? "border-[#0c3f7c] bg-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {item.selected && (
                        <View className="w-3 h-3 rounded-full bg-[#0c3f7c]" />
                      )}
                    </TouchableOpacity>

                    {/* Product Image */}
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-16 h-16 rounded-2xl bg-slate-100 items-center justify-center border border-slate-200">
                        <StyledShoppingCart size={20} className="text-slate-300" />
                      </View>
                    )}
                  </View>

                  {/* Center Content: Product name, unit price */}
                  <View className="flex-1 items-end px-3 gap-0.5 justify-center">
                    <Text
                      className="font-black text-slate-800 text-xs text-right leading-5"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text className="text-xs font-black text-[#0c3f7c] text-right mt-1">
                      {item.price} {currencySymbol}
                    </Text>
                  </View>

                  {/* Left side: Remove button (top) + Quantity selector (bottom) */}
                  <View className="items-start justify-between h-16 w-24">
                    {/* Remove item button */}
                    <TouchableOpacity
                      onPress={() => removeItem(item.productId, item.productImageId)}
                      activeOpacity={0.7}
                      className="w-6 h-6 rounded-full bg-slate-50 items-center justify-center border border-slate-100"
                    >
                      <StyledX size={12} className="text-slate-500" />
                    </TouchableOpacity>

                    {/* Quantity selectors */}
                    <View className="flex-row items-center bg-slate-50 border border-slate-200/80 rounded-xl px-1.5 h-8 flex-row-reverse w-full justify-between">
                      {/* Plus button */}
                      <TouchableOpacity
                        onPress={() => handleIncreaseQuantity(item)}
                        disabled={item.quantity >= item.quantityInStock}
                        className={`w-6 h-6 rounded-lg items-center justify-center ${
                          item.quantity >= item.quantityInStock
                            ? "bg-slate-200/50"
                            : "bg-[#0c3f7c]"
                        }`}
                        activeOpacity={0.7}
                      >
                        <StyledPlus
                          size={10}
                          className={
                            item.quantity >= item.quantityInStock
                              ? "text-slate-400"
                              : "text-white"
                          }
                        />
                      </TouchableOpacity>

                      {/* Quantity text */}
                      <Text className="font-extrabold text-[11px] text-slate-800 text-center px-1">
                        {item.quantity}
                      </Text>

                      {/* Minus button */}
                      <TouchableOpacity
                        onPress={() => handleDecreaseQuantity(item)}
                        disabled={item.quantity <= 1}
                        className={`w-6 h-6 rounded-lg items-center justify-center ${
                          item.quantity <= 1 ? "bg-slate-200/50" : "bg-[#0c3f7c]"
                        }`}
                        activeOpacity={0.7}
                      >
                        <StyledMinus
                          size={10}
                          className={item.quantity <= 1 ? "text-slate-400" : "text-white"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}



            {/* Order totals summary */}
            <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs mt-4 gap-3.5">
              {/* Saudi Riyal Total */}
              {(totals.saudiTotal > 0 || (totals.saudiTotal === 0 && totals.yemeniTotal === 0)) && (
                <View className="flex-row-reverse justify-between items-center">
                  <Text className="text-sm font-black text-slate-800">إجمالي بالريال السعودي</Text>
                  <Text className="text-base font-black text-[#0c3f7c]">
                    {totals.saudiTotal} ر.س
                  </Text>
                </View>
              )}

              {/* Yemeni Riyal Total */}
              {totals.yemeniTotal > 0 && (
                <View className="flex-row-reverse justify-between items-center">
                  <Text className="text-sm font-black text-slate-800">إجمالي بالريال اليمني</Text>
                  <Text className="text-base font-black text-[#0c3f7c]">
                    {totals.yemeniTotal} ر.ي
                  </Text>
                </View>
              )}

              {/* Other Currencies Totals */}
              {Object.entries(totals.otherTotals).map(([name, total]) => (
                <View key={name} className="flex-row-reverse justify-between items-center">
                  <Text className="text-sm font-black text-slate-800">الإجمالي ({name})</Text>
                  <Text className="text-base font-black text-[#0c3f7c]">
                    {total} {name}
                  </Text>
                </View>
              ))}


            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Actions Bar */}
      {items.length > 0 && (
        <View
          className="absolute left-0 right-0 bg-white border-t border-slate-100 px-5 pt-3.5"
          style={{
            bottom: tabHeight,
            paddingBottom: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          <TouchableOpacity
            onPress={handleCheckout}
            disabled={isValidatingPrices}
            activeOpacity={0.85}
            className="w-full h-12.5 bg-[#0c3f7c] rounded-2xl items-center justify-center shadow-md active:opacity-95 flex-row gap-2"
          >
            {isValidatingPrices ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-extrabold text-sm text-center">جاري التحقق من الأسعار...</Text>
              </>
            ) : (
              <Text className="text-white font-extrabold text-sm text-center">إتمام الطلب</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* 1. Order Confirmation Bottom Sheet Modal */}
      <Modal
        visible={isConfirmModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!isSubmittingOrder) setIsConfirmModalVisible(false);
        }}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => {
            if (!isSubmittingOrder) setIsConfirmModalVisible(false);
          }}
        >
          <Pressable
            className="bg-white rounded-t-[28px] px-6 pt-5 pb-8 max-h-[85%] w-full"
            onPress={() => {}}
          >
            {/* Modal Header */}
            <View className="flex-row-reverse items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <Text className="text-lg font-black text-[#0c3f7c]">مراجعة وتأكيد الطلب</Text>
              <TouchableOpacity
                onPress={() => setIsConfirmModalVisible(false)}
                disabled={isSubmittingOrder}
                className="p-1"
              >
                <StyledX size={20} className="text-gray-400" />
              </TouchableOpacity>
            </View>

            {/* Scrollable list of items to confirm */}
            <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
              <Text className="text-xs font-bold text-gray-400 text-right mb-3">
                المنتجات التي سيتم طلبها وحجزها:
              </Text>

              <View className="gap-3">
                {items
                  .filter((item) => item.selected)
                  .map((item) => {
                    const currencySymbol = getCurrencySymbol(item.currencyName);
                    return (
                      <View
                        key={`${item.productId}-${item.productImageId}`}
                        className="bg-slate-50 rounded-2xl p-3 border border-slate-100/80 flex-row-reverse items-center justify-between"
                      >
                        {/* Right: image + details */}
                        <View className="flex-row-reverse items-center gap-3 flex-1 pl-2">
                          {item.imageUrl ? (
                            <Image
                              source={{ uri: item.imageUrl }}
                              className="w-12 h-12 rounded-xl bg-white border border-slate-100"
                              resizeMode="cover"
                            />
                          ) : (
                            <View className="w-12 h-12 rounded-xl bg-slate-200 items-center justify-center">
                              <StyledShoppingCart size={16} className="text-slate-400" />
                            </View>
                          )}
                          <View className="items-end flex-1">
                            <Text
                              className="font-black text-slate-800 text-xs text-right leading-5"
                              numberOfLines={1}
                            >
                              {item.name}
                            </Text>
                            <Text className="text-[10px] font-bold text-slate-400 mt-0.5">
                              الكمية: {item.quantity}
                            </Text>
                          </View>
                        </View>

                        {/* Left: item total price */}
                        <View className="items-start">
                          <Text className="text-xs font-black text-[#0c3f7c]">
                            {item.price * item.quantity} {currencySymbol}
                          </Text>
                          <Text className="text-[10px] text-gray-400 font-bold mt-0.5">
                            ({item.price} للمفرد)
                          </Text>
                        </View>
                      </View>
                    );
                  })}
              </View>

              {/* Order total summary inside modal */}
              <View className="mt-5 bg-slate-50 rounded-2xl p-4 border border-slate-100 gap-2.5">
                <Text className="text-xs font-bold text-slate-700 text-right mb-1">ملخص الإجمالي:</Text>
                
                {totals.saudiTotal > 0 && (
                  <View className="flex-row-reverse justify-between items-center">
                    <Text className="text-xs font-bold text-slate-500">إجمالي بالريال السعودي</Text>
                    <Text className="text-sm font-black text-[#0c3f7c]">
                      {totals.saudiTotal} ر.س
                    </Text>
                  </View>
                )}

                {totals.yemeniTotal > 0 && (
                  <View className="flex-row-reverse justify-between items-center">
                    <Text className="text-xs font-bold text-slate-500">إجمالي بالريال اليمني</Text>
                    <Text className="text-sm font-black text-[#0c3f7c]">
                      {totals.yemeniTotal} ر.ي
                    </Text>
                  </View>
                )}
              </View>

              {/* Warnings/Stock Reservation Note */}
              <View className="mt-4 bg-blue-50/50 rounded-2xl p-3.5 border border-blue-50 flex-row-reverse gap-2 items-center">
                <View className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <Text className="flex-1 text-[11px] font-semibold text-blue-600 text-right leading-5">
                  سيتم مراجعة وتأكيد طلبك وتحديث حالة المخزون فور تأكيد الإرسال.
                </Text>
              </View>
            </ScrollView>

            {/* Actions */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={handlePlaceOrder}
                disabled={isSubmittingOrder}
                activeOpacity={0.85}
                className="w-full h-12 bg-[#0c3f7c] rounded-2xl items-center justify-center shadow-md active:opacity-95 flex-row gap-2"
              >
                {isSubmittingOrder ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-extrabold text-sm text-center">تأكيد إرسال الطلب</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsConfirmModalVisible(false)}
                disabled={isSubmittingOrder}
                activeOpacity={0.8}
                className="w-full h-12 bg-slate-50 border border-slate-200/80 rounded-2xl items-center justify-center active:opacity-90"
              >
                <Text className="text-slate-600 font-extrabold text-sm text-center">إلغاء</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 2. Order Success Modal */}
      <Modal
        visible={isSuccessModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setIsSuccessModalVisible(false);
          setCreatedOrderData(null);
        }}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center px-6"
          onPress={() => {
            setIsSuccessModalVisible(false);
            setCreatedOrderData(null);
          }}
        >
          <Pressable
            className="bg-white rounded-3xl p-6 w-full max-w-[340px] items-center shadow-2xl"
            onPress={() => {}}
          >
            {/* Green animated/pulsing circle with checkmark */}
            <View className="w-20 h-20 bg-emerald-50 rounded-full items-center justify-center border border-emerald-100 shadow-sm mb-4">
              <View className="w-14 h-14 bg-emerald-500 rounded-full items-center justify-center">
                <StyledCheck size={28} className="text-white" />
              </View>
            </View>

            {/* Title */}
            <Text className="text-lg font-black text-slate-800 text-center mb-1">
              تم إرسال الطلب بنجاح!
            </Text>

            {/* Subtext */}
            <Text className="text-xs font-semibold text-slate-400 text-center mb-5 leading-5">
              تم تسجيل وحجز طلبك من المخزن بنجاح وهو قيد المراجعة الآن.
            </Text>

            {/* Order Details box */}
            {createdOrderData && (
              <View className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 gap-2">
                <View className="flex-row-reverse justify-between items-center border-b border-slate-200/40 pb-2 mb-1">
                  <Text className="text-[11px] font-bold text-slate-500">رقم الطلب</Text>
                  <Text className="text-xs font-black text-slate-800">#{createdOrderData.id}</Text>
                </View>

                {createdOrderData.totalAmountSar > 0 && (
                  <View className="flex-row-reverse justify-between items-center">
                    <Text className="text-[11px] font-bold text-slate-500">الإجمالي بالريال السعودي</Text>
                    <Text className="text-xs font-black text-[#0c3f7c]">
                      {createdOrderData.totalAmountSar} ر.س
                    </Text>
                  </View>
                )}

                {createdOrderData.totalAmountYer > 0 && (
                  <View className="flex-row-reverse justify-between items-center">
                    <Text className="text-[11px] font-bold text-slate-500">الإجمالي بالريال اليمني</Text>
                    <Text className="text-xs font-black text-[#0c3f7c]">
                      {createdOrderData.totalAmountYer} ر.ي
                    </Text>
                  </View>
                )}

                <View className="flex-row-reverse justify-between items-center border-t border-slate-200/40 pt-2 mt-1">
                  <Text className="text-[11px] font-bold text-slate-500">تاريخ الطلب</Text>
                  <Text className="text-[10px] font-semibold text-slate-600">
                    {new Date(createdOrderData.createdAt).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </View>
              </View>
            )}


            {/* Close Button */}
            <TouchableOpacity
              onPress={() => {
                setIsSuccessModalVisible(false);
                setCreatedOrderData(null);
              }}
              activeOpacity={0.8}
              className="w-full h-11 bg-[#0c3f7c] rounded-xl items-center justify-center active:opacity-90 shadow-sm"
            >
              <Text className="text-white font-extrabold text-xs">حسنًا</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
