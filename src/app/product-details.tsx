import type { JSX } from "react";
import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { withUniwind } from "uniwind";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Package,
  AlertCircle,
  Sparkles,
  Plus,
  Minus,
} from "lucide-react-native";

import { useProductQuery, useProductsQuery, useCurrenciesQuery } from "../hooks/useProducts";
import { useCartStore } from "../store/cartStore";

// Wrap Lucide icons with Uniwind
const StyledChevronLeft = withUniwind(ChevronLeft);
const StyledChevronRight = withUniwind(ChevronRight);
const StyledShare2 = withUniwind(Share2);
const StyledPackage = withUniwind(Package);
const StyledAlertCircle = withUniwind(AlertCircle);
const StyledSparkles = withUniwind(Sparkles);
const StyledPlus = withUniwind(Plus);
const StyledMinus = withUniwind(Minus);

// Detail Screen Loading Skeleton
const ProductDetailsSkeleton = (): JSX.Element => {
  const insets = useSafeAreaInsets();
  const safeTop = insets.top > 0 ? insets.top + 12 : 36;

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      {/* Top Slider Skeleton */}
      <View className="w-full h-[380px] bg-gray-100 relative">
        {/* Float Header Skeleton */}
        <View className="absolute flex-row justify-between w-full px-5 z-20" style={{ top: safeTop }}>
          <View className="w-11 h-11 rounded-full bg-white/80" />
          <View className="w-11 h-11 rounded-full bg-white/80" />
        </View>
        <View className="absolute bottom-6 w-full flex-row justify-center gap-1.5 z-20">
          <View className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          <View className="w-2.5 h-2.5 rounded-full bg-gray-200" />
          <View className="w-2.5 h-2.5 rounded-full bg-gray-200" />
        </View>
      </View>

      {/* Info Card Skeleton */}
      <View className="flex-1 -mt-8 rounded-t-[32px] bg-white p-6 justify-between">
        <View className="gap-5">
          {/* Title row */}
          <View className="flex-row-reverse justify-between items-center">
            <View className="w-1/2 h-6 bg-gray-100 rounded" />
            <View className="w-1/4 h-5 bg-gray-100 rounded" />
          </View>

          {/* Description Block */}
          <View className="gap-2 items-end">
            <View className="w-1/3 h-4.5 bg-gray-100 rounded" />
            <View className="w-full h-4 bg-gray-100 rounded" />
            <View className="w-full h-4 bg-gray-100 rounded" />
            <View className="w-4/5 h-4 bg-gray-100 rounded" />
          </View>

          {/* Swatches Skeleton */}
          <View className="gap-2.5 items-end">
            <View className="w-1/4 h-4.5 bg-gray-100 rounded" />
            <View className="flex-row-reverse gap-3.5 mt-1">
              <View className="w-14 h-14 rounded-full bg-gray-100" />
              <View className="w-14 h-14 rounded-full bg-gray-100" />
              <View className="w-14 h-14 rounded-full bg-gray-100" />
            </View>
          </View>
        </View>

        {/* Sticky Button Skeleton */}
        <View className="w-full h-14 bg-gray-100 rounded-3xl mt-6" />
      </View>
    </View>
  );
};

export default function ProductDetailsScreen(): JSX.Element {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const productId = Number(id);

  // Fetch product data
  const {
    data: product,
    isLoading: isLoadingProduct,
    isError,
    error,
    refetch,
  } = useProductQuery(productId);

  // Fetch dynamic currencies list for price resolution
  const { data: currencies = [] } = useCurrenciesQuery();

  // Fetch similar products in the same category
  const { data: similarProducts = [] } = useProductsQuery({
    categoryId: product?.categoryId,
  });

  // Filter out current product from similar recommendations
  const filteredSimilar = useMemo(() => {
    return similarProducts.filter((p) => p.id !== productId && p.isActive);
  }, [similarProducts, productId]);

  // Main active preview image state
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  // Derive active image URL from state, falling back to the primary/first image
  const activeImageUrl = useMemo(() => {
    if (selectedImageUrl) return selectedImageUrl;
    if (!product || !product.images) return null;
    const primary = product.images.find((img) => img.isPrimary) || product.images[0];
    return primary?.imageUrl || null;
  }, [selectedImageUrl, product]);

  // Get active image variation details
  const activeImage = useMemo(() => {
    if (!product || !product.images) return null;
    return product.images.find((img) => img.imageUrl === activeImageUrl) || null;
  }, [product, activeImageUrl]);

  // Stock available for the current active image variation
  const stockAvailable = useMemo(() => {
    return activeImage ? (activeImage.quantityInStock ?? 0) : 0;
  }, [activeImage]);

  // Quantity selection state
  const [quantity, setQuantity] = useState(1);
  const [prevActiveImageUrl, setPrevActiveImageUrl] = useState<string | null>(null);

  // Sync / reset quantity state during render when active image updates
  if (activeImageUrl !== prevActiveImageUrl) {
    setPrevActiveImageUrl(activeImageUrl);
    setQuantity(stockAvailable === 0 ? 0 : 1);
  }

  // Resolve currency abbreviation
  const getCurrencySymbol = (currencyId: number) => {
    const currency = currencies.find((c) => c.id === currencyId);
    if (!currency) return "ر.س";
    if (currency.name === "ريال يمني") return "ر.ي";
    if (currency.name === "ريال سعودي") return "ر.س";
    return currency.name;
  };

  // Image index calculation for pagination dots
  const activeImageIndex = useMemo(() => {
    if (!product || !product.images) return 0;
    return product.images.findIndex((img) => img.imageUrl === activeImageUrl);
  }, [product, activeImageUrl]);

  // Slide to next/previous image
  const handleSlideImage = (direction: "next" | "prev") => {
    if (!product || !product.images || product.images.length === 0) return;
    const currentIndex = activeImageIndex >= 0 ? activeImageIndex : 0;
    let nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

    // Boundary wrapping
    if (nextIndex >= product.images.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = product.images.length - 1;

    setSelectedImageUrl(product.images[nextIndex].imageUrl);
  };

  // Add to cart action
  const handleAddToCart = () => {
    if (!product) return;
    if (!activeImage) {
      Alert.alert("خطأ", "عذرًا، لا يوجد صورة أو فئة محددة لهذا المنتج.");
      return;
    }

    const cartStore = useCartStore.getState();
    const result = cartStore.addItem(
      {
        productId: product.id,
        productImageId: activeImage.id,
        name: product.name,
        price: product.price,
        currencyId: product.currencyId,
        currencyName: product.currencyName || "ريال سعودي",
        imageUrl: activeImage.imageUrl,
        quantityInStock: activeImage.quantityInStock,
      },
      quantity
    );

    if (result.success) {
      Alert.alert(
        "تم الإضافة",
        `تم إضافة عدد (${quantity}) من "${product.name}" إلى سلة المشتريات بنجاح.`,
        [{ text: "حسنًا" }]
      );
    } else {
      Alert.alert("تنبيه", result.error || "تعذر إضافة المنتج بالسلة.");
    }
  };

  // Share action
  const handleShare = () => {
    if (!product) return;
    Alert.alert(
      "مشاركة المنتج",
      `رابط مشاركة منتج "${product.name}":\nhttps://bestpricestore.local/product/${product.id}`,
      [{ text: "حسنًا" }]
    );
  };

  const safeTop = insets.top > 0 ? insets.top + 12 : 36;
  const safeBottom = insets.bottom > 0 ? insets.bottom + 12 : 28;

  // Initial loading state
  if (isLoadingProduct) {
    return <ProductDetailsSkeleton />;
  }

  // Error state
  if (isError || !product) {
    return (
      <View className="flex-1 bg-[#f8fafd] justify-center items-center px-6">
        <StatusBar style="dark" />
        <StyledAlertCircle size={56} className="text-red-500 mb-4" />
        <Text className="text-red-600 font-black text-lg mb-2 text-center">
          خطأ في تحميل تفاصيل المنتج
        </Text>
        <Text className="text-gray-500 text-sm mb-6 text-center">
          {error?.message || "تعذر العثور على هذا المنتج أو تم حذفه."}
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="border border-gray-300 bg-white px-6 py-3.5 rounded-2xl active:opacity-80"
          >
            <Text className="text-gray-700 font-bold text-sm">رجوع</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-[#0c3f7c] px-6 py-3.5 rounded-2xl active:opacity-90"
          >
            <Text className="text-white font-bold text-sm">إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: safeBottom + 90 }}
      >
        {/* Top Image Slider Section */}
        <View className="w-full h-[380px] bg-gray-50 relative">
          {/* Main Display Image */}
          {activeImageUrl ? (
            <Image
              source={{ uri: activeImageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-gray-100">
              <StyledPackage size={64} className="text-gray-300" />
            </View>
          )}

          {/* Floating Translucent Header Circles */}
          <View className="absolute flex-row justify-between w-full px-5 z-20" style={{ top: safeTop }}>
            {/* Back button (Left) */}
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              className="w-11 h-11 rounded-full bg-white/85 items-center justify-center shadow-md border border-gray-100"
            >
              <StyledChevronLeft size={24} className="text-gray-800 -ml-0.5" />
            </TouchableOpacity>

            {/* Share button (Right) */}
            <TouchableOpacity
              onPress={handleShare}
              activeOpacity={0.8}
              className="w-11 h-11 rounded-full bg-white/85 items-center justify-center shadow-md border border-gray-100"
            >
              <StyledShare2 size={20} className="text-gray-800" />
            </TouchableOpacity>
          </View>

          {/* Slider Chevron Left Arrow */}
          {product.images && product.images.length > 1 && (
            <TouchableOpacity
              onPress={() => handleSlideImage("prev")}
              activeOpacity={0.7}
              className="absolute left-4 top-[50%] -mt-5 w-10 h-10 rounded-full bg-black/20 items-center justify-center z-20"
            >
              <StyledChevronLeft size={20} className="text-white" />
            </TouchableOpacity>
          )}

          {/* Slider Chevron Right Arrow */}
          {product.images && product.images.length > 1 && (
            <TouchableOpacity
              onPress={() => handleSlideImage("next")}
              activeOpacity={0.7}
              className="absolute right-4 top-[50%] -mt-5 w-10 h-10 rounded-full bg-black/20 items-center justify-center z-20"
            >
              <StyledChevronRight size={20} className="text-white" />
            </TouchableOpacity>
          )}

          {/* Slider Dots Indicator */}
          {product.images && product.images.length > 1 && (
            <View className="absolute bottom-6 w-full flex-row justify-center gap-1.5 z-20">
              {product.images.map((_, index) => {
                const isActive = index === activeImageIndex;
                return (
                  <View
                    key={index}
                    className={`rounded-full transition-all ${
                      isActive ? "w-5 h-2.5 bg-white shadow-xs" : "w-2 h-2 bg-white/60"
                    }`}
                  />
                );
              })}
            </View>
          )}
        </View>

        {/* Content Overlap Card Section */}
        <View className="flex-1 -mt-8 rounded-t-[32px] bg-white pt-7 pb-6 px-6">
          {/* Header Row: Title on right, price/currency on left */}
          <View className="flex-row-reverse justify-between items-center gap-4 mb-6">
            <View className="items-end flex-1">
              <Text className="text-xl font-extrabold text-slate-900 text-right leading-7">
                {product.name}
              </Text>
              <View className="flex-row-reverse items-center gap-1.5 mt-1.5">
                <View className="bg-slate-100 px-2 py-0.5 rounded-md">
                  <Text className="text-[10px] font-bold text-slate-500 text-right">
                    الفئة: {product.categoryName}
                  </Text>
                </View>
              </View>
            </View>
            <View className="bg-[#f0f7ff] border border-blue-50 px-4 py-2.5 rounded-2xl">
              <Text className="text-lg font-black text-[#0c3f7c]">
                {product.price} {getCurrencySymbol(product.currencyId)}
              </Text>
            </View>
          </View>

          {/* Product Description Box */}
          <View className="mb-6 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
            <Text className="text-sm font-black text-slate-800 text-right mb-2">
              تفاصيل المنتج
            </Text>
            <Text className="text-slate-600 text-[13px] text-right leading-6 font-medium">
              {product.description || "لا يوجد وصف متوفر لهذا المنتج حالياً."}
            </Text>
          </View>

          {/* Colors Swatches Place -> Replaced with Gallery Images Thumbnails */}
          {product.images && product.images.length > 0 && (
            <View className="mb-6">
              <Text className="text-sm font-black text-slate-800 text-right mb-3">
                اللون / مقاس
              </Text>
              <View className="flex-row-reverse flex-wrap gap-3.5">
                {product.images.map((img, index) => {
                  const isSelected = activeImageUrl === img.imageUrl;
                  return (
                    <TouchableOpacity
                      key={img.id || index}
                      onPress={() => setSelectedImageUrl(img.imageUrl)}
                      activeOpacity={0.8}
                      className={`w-16 h-16 rounded-full overflow-hidden border-2 p-0.5 justify-center items-center ${
                        isSelected ? "border-[#0c3f7c] bg-[#f0f7ff]" : "border-slate-200 bg-white"
                      }`}
                    >
                      <Image
                        source={{ uri: img.imageUrl }}
                        className="w-full h-full rounded-full bg-slate-50"
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Exact Stock Quantity Label (Explicit Indicator) */}
              <View className={`mt-4 flex-row-reverse items-center justify-between rounded-2xl px-4 py-3 border ${
                stockAvailable === 0 
                  ? "bg-red-50/50 border-red-100" 
                  : stockAvailable < 5 
                    ? "bg-amber-50/50 border-amber-100" 
                    : "bg-emerald-50/40 border-emerald-100/60"
              }`}>
                <Text className="text-xs font-bold text-gray-600">الكمية المتوفرة في المخزن</Text>
                {stockAvailable === 0 ? (
                  <Text className="text-red-600 font-extrabold text-xs">نفدت الكمية</Text>
                ) : stockAvailable < 5 ? (
                  <Text className="text-amber-700 font-extrabold text-xs">{stockAvailable} قطعة فقط (متبقي قليل!)</Text>
                ) : (
                  <Text className="text-emerald-700 font-extrabold text-xs">{stockAvailable} قطعة</Text>
                )}
              </View>
            </View>
          )}

          {/* Similar Products Recommendation ("منتجات إضافية") */}
          {filteredSimilar.length > 0 && (
            <View className="mt-2">
              <Text className="text-sm font-black text-slate-800 text-right mb-4">
                منتجات إضافية
              </Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={filteredSimilar}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ gap: 14 }}
                inverted // RTL flow helper
                renderItem={({ item }) => {
                  const primaryImg = item.images?.find((img) => img.isPrimary) || item.images?.[0];
                  return (
                    <TouchableOpacity
                      onPress={() => router.push(`/product-details?id=${item.id}` as any)}
                      activeOpacity={0.9}
                      className="w-36 bg-white border border-slate-100 rounded-3xl p-2.5 shadow-sm items-center justify-between"
                    >
                      {primaryImg?.imageUrl ? (
                        <Image
                          source={{ uri: primaryImg.imageUrl }}
                          className="w-full h-24 rounded-2xl bg-slate-50 mb-2"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-24 rounded-2xl bg-slate-50 items-center justify-center mb-2">
                          <StyledPackage size={24} className="text-slate-300" />
                        </View>
                      )}
                      <Text
                        className="font-extrabold text-slate-800 text-xs text-center w-full px-1"
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text className="font-black text-[#0c3f7c] text-xs mt-1 text-center">
                        {item.price} {getCurrencySymbol(item.currencyId)}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions Bar with Quantity Selector Side-by-Side */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 pt-3.5"
        style={{
          paddingBottom: safeBottom,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        {stockAvailable > 0 ? (
          <View className="flex-row items-center gap-3">
            {/* Add to Cart Button (Takes remaining flex space) */}
            <TouchableOpacity
              onPress={handleAddToCart}
              activeOpacity={0.85}
              className="flex-1 h-13 bg-[#0c3f7c] rounded-2xl flex-row-reverse items-center justify-center gap-2 shadow-md active:opacity-95"
            >
              <StyledSparkles size={16} className="text-white/90" />
              <Text className="text-white font-extrabold text-base text-center">أضف إلى السلة</Text>
            </TouchableOpacity>

            {/* Quantity Selector Selector Container (Compact Side-by-Side) */}
            <View className="flex-row items-center bg-slate-50/60 border border-slate-200/60 rounded-2xl px-2 h-13 flex-row-reverse">
              {/* Plus Button */}
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.min(stockAvailable, q + 1))}
                disabled={quantity >= stockAvailable}
                className={`w-9 h-9 rounded-xl items-center justify-center border ${
                  quantity >= stockAvailable 
                    ? "bg-slate-50 border-slate-300" 
                    : "bg-[#0c3f7c] border-[#0c3f7c]"
                }`}
                activeOpacity={0.7}
              >
                <StyledPlus size={16} className={quantity >= stockAvailable ? "text-slate-600" : "text-white"} />
              </TouchableOpacity>

              {/* Counter Text */}
              <Text className="font-extrabold text-sm text-slate-800 w-9 text-center">
                {quantity}
              </Text>

              {/* Minus Button */}
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className={`w-9 h-9 rounded-xl items-center justify-center border ${
                  quantity <= 1 
                    ? "bg-slate-50 border-slate-300" 
                    : "bg-[#0c3f7c] border-[#0c3f7c]"
                }`}
                activeOpacity={0.7}
              >
                <StyledMinus size={16} className={quantity <= 1 ? "text-slate-600" : "text-white"} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Full-width Out-of-Stock Button */
          <View className="w-full h-13 bg-slate-200 rounded-2xl items-center justify-center shadow-xs">
            <Text className="text-slate-400 font-extrabold text-sm text-center">نفدت الكمية</Text>
          </View>
        )}
      </View>
    </View>
  );
}
