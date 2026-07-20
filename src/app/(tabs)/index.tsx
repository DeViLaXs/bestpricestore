import type { JSX } from "react";
import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { Bell, Search, Flame, Sparkles, Package, ChevronLeft, Plus, Star, Tag } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Rect, Path, Circle, Line } from "react-native-svg";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useLatestProductsQuery,
  useTopSellingProductsQuery,
  useCurrenciesQuery,
} from "../../hooks/useProducts";
import { useCategoriesQuery } from "../../hooks/useCategories";

// SVG Category Icons matching the mockup designs
const DuvetIcon = (): JSX.Element => (
  <Svg width={42} height={42} viewBox="0 0 24 24" fill="none">
    {/* Folder/Blanket folded body */}
    <Rect x="3" y="6" width="18" height="13" rx="2" stroke="#0F4C92" strokeWidth={2} />
    <Line x1="3" y1="10" x2="21" y2="10" stroke="#0F4C92" strokeWidth={2} />
    <Line x1="3" y1="13" x2="21" y2="13" stroke="#0F4C92" strokeWidth={2} />
    <Line x1="3" y1="16" x2="21" y2="16" stroke="#0F4C92" strokeWidth={2} />
    {/* Folding corner at the top left */}
    <Path
      d="M3 6L9 12V6H3Z"
      fill="#edf3fa"
      stroke="#0F4C92"
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  </Svg>
);

const PillowIcon = (): JSX.Element => (
  <Svg width={42} height={42} viewBox="0 0 24 24" fill="none">
    {/* Outer pillow contour */}
    <Path
      d="M3 6C7 7.5 17 7.5 21 6C19.5 10 19.5 14 21 18C17 16.5 7 16.5 3 18C4.5 14 4.5 10 3 6Z"
      stroke="#0F4C92"
      strokeWidth={2}
      strokeLinejoin="round"
    />
    {/* Inner decorative contour line */}
    <Path
      d="M5 8C8 9.2 16 9.2 19 8C17.8 11 17.8 13 19 16C16 14.8 8 14.8 5 16C6.2 13 6.2 11 5 8Z"
      stroke="#0F4C92"
      strokeWidth={1}
      strokeLinejoin="round"
      opacity={0.65}
    />
  </Svg>
);

const MattressIcon = (): JSX.Element => (
  <Svg width={42} height={42} viewBox="0 0 24 24" fill="none">
    {/* Main mattress frame */}
    <Rect x="2" y="6" width="20" height="12" rx="3" stroke="#0F4C92" strokeWidth={2} />
    {/* Internal quilted frame */}
    <Rect
      x="4"
      y="8"
      width="16"
      height="8"
      rx="1.5"
      stroke="#0F4C92"
      strokeWidth={1.5}
      strokeDasharray="2 2"
    />
    {/* Quilted details / circles */}
    <Circle cx="8" cy="12" r="1" fill="#0F4C92" />
    <Circle cx="12" cy="12" r="1" fill="#0F4C92" />
    <Circle cx="16" cy="12" r="1" fill="#0F4C92" />
  </Svg>
);

// Horizontal Card Skeleton Loader for Widgets
const ProductWidgetSkeleton = (): JSX.Element => (
  <View className="w-36 bg-white rounded-2xl p-2.5 border border-gray-100 items-end justify-between gap-2 mr-3">
    <View className="w-full h-24 rounded-xl bg-gray-100" />
    <View className="w-3/4 h-3 bg-gray-100 rounded mt-1" />
    <View className="w-1/2 h-3 bg-gray-100 rounded" />
  </View>
);

export default function HomeScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const safeTop = insets.top > 0 ? insets.top : 47;

  // API Queries for Product Widgets & Currency lookup
  const {
    data: latestProducts = [],
    isLoading: isLoadingLatest,
    refetch: refetchLatest,
    isRefetching: isRefetchingLatest,
  } = useLatestProductsQuery();

  const {
    data: topSellingProducts = [],
    isLoading: isLoadingTopSelling,
    refetch: refetchTopSelling,
    isRefetching: isRefetchingTopSelling,
  } = useTopSellingProductsQuery();

  const { data: currencies = [] } = useCurrenciesQuery();
  const { data: categories = [] } = useCategoriesQuery();

  // Navigation handler to direct user to Shop page filtered by category
  const handleCategoryPress = (categoryId?: number | null) => {
    if (categoryId) {
      router.push({ pathname: "/shop", params: { categoryId: categoryId.toString() } } as any);
    } else {
      router.push({ pathname: "/shop", params: { categoryId: "" } } as any);
    }
  };

  // Refresh widgets when home screen receives focus
  useFocusEffect(
    useCallback(() => {
      refetchLatest();
      refetchTopSelling();
    }, [refetchLatest, refetchTopSelling])
  );

  const isRefreshing = isRefetchingLatest || isRefetchingTopSelling;

  const handleRefresh = () => {
    refetchLatest();
    refetchTopSelling();
  };

  // Helper to resolve currency symbol
  const getCurrencySymbol = (currencyId: number) => {
    const currency = currencies.find((c) => c.id === currencyId);
    if (!currency) return "ر.س";
    if (currency.name === "ريال يمني") return "ر.ي";
    if (currency.name === "ريال سعودي") return "ر.س";
    return currency.name;
  };

  const handleSearchSubmit = () => {
    router.push("/shop");
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Clean White Header Banner */}
      <View className="bg-white border-b border-gray-100/50" style={{ paddingTop: safeTop }}>
        <View className="flex-row-reverse items-center justify-between px-6 py-2.5">
          <Text className="text-lg font-bold text-gray-900 text-right">الشاشة الرئيسية</Text>
          {/* Notification bell on left */}
          <TouchableOpacity className="relative p-1" activeOpacity={0.7}>
            <Bell size={22} color="#0F4C92" />
            <View
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                backgroundColor: "#e53e3e",
                width: 14,
                height: 14,
                borderRadius: 7,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1.5,
                borderColor: "#ffffff",
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 8,
                  fontWeight: "900",
                  lineHeight: 10,
                }}
              >
                1
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: insets.bottom + 90, // Ensure space for the custom tab bar
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-white"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#0F4C92"]}
          />
        }
      >
        {/* Search and Filter Row */}
        <View className="flex-row items-center gap-3.5 mb-6 mt-2">
          {/* Filter Circular Button (Left) */}
          <TouchableOpacity
            onPress={() => router.push("/shop")}
            className="w-10 h-10 rounded-xl bg-[#0F4C92] items-center justify-center shadow-sm active:opacity-85"
            activeOpacity={0.85}
          >
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path d="M4 6H20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <Path d="M6 12H18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <Path d="M9 18H15" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>

          {/* Search Input Box (Right) */}
          <View className="flex-1 relative justify-center">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              placeholder="ابحث عن منتج..."
              placeholderTextColor="#a0aec0"
              className="h-10 rounded-xl border-[1.5px] border-gray-200 bg-white pr-10 pl-4 text-xs text-gray-800 font-semibold text-right"
            />
            <Search size={18} color="#a0aec0" style={{ position: "absolute", right: 12 }} />
          </View>
        </View>

        {/* 1. Top Selling Products Widget ("الأكثر مبيعاً") */}
        <View className="mb-6">
          <View className="flex-row-reverse justify-between items-center mb-3">
            <View className="flex-row-reverse items-center gap-1.5">
              <Flame size={18} color="#e53e3e" />
              <Text className="text-base font-bold text-gray-900 text-right">
                الأكثر مبيعاً
              </Text>
            </View>

            <TouchableOpacity onPress={() => router.push("/shop")} activeOpacity={0.7}>
              <Text className="text-[#0F4C92] font-extrabold text-xs">
                عرض الكل
              </Text>
            </TouchableOpacity>
          </View>

          {isLoadingTopSelling ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -20, transform: [{ scaleX: -1 }] }}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              <View style={{ transform: [{ scaleX: -1 }], flexDirection: "row", gap: 14 }}>
                <ProductWidgetSkeleton />
                <ProductWidgetSkeleton />
                <ProductWidgetSkeleton />
              </View>
            </ScrollView>
          ) : topSellingProducts.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -20, transform: [{ scaleX: -1 }] }}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              <View style={{ transform: [{ scaleX: -1 }], flexDirection: "row", gap: 14 }}>
                {topSellingProducts.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push(`/product-details?id=${item.id}` as any)}
                    activeOpacity={0.92}
                    style={{ width: 165 }}
                    className="bg-white rounded-3xl border border-gray-100/90 shadow-sm overflow-hidden justify-between"
                  >
                    {/* Full-width Image Bleed */}
                    <View className="w-full h-36 bg-gray-100 relative">
                      {item.primaryImageUrl ? (
                        <Image
                          source={{ uri: item.primaryImageUrl }}
                          className="w-full h-full"
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-full items-center justify-center">
                          <Package size={24} color="#a0aec0" />
                        </View>
                      )}
                    </View>

                    {/* Card Content */}
                    <View className="p-3">
                      {/* Details & Action button row */}
                      <View className="flex-row-reverse justify-between items-end w-full">
                        <View className="items-end flex-1 pl-1">
                          <Text
                            className="font-extrabold text-gray-900 text-xs text-right mb-0.5 w-full"
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          <Text className="font-black text-[#0F4C92] text-xs text-right">
                            {item.price} {getCurrencySymbol(item.currencyId)}
                          </Text>
                        </View>

                        {/* Blue Circular Plus Action Button */}
                        <View className="w-8 h-8 rounded-full bg-[#0F4C92] items-center justify-center shadow-xs">
                          <Plus size={16} color="#ffffff" strokeWidth={2.5} />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View className="bg-white rounded-2xl p-4 border border-gray-100 items-center justify-center">
              <Text className="text-gray-400 text-xs font-bold text-center">
                لا تتوفر منتجات أكثر مبيعاً حالياً.
              </Text>
            </View>
          )}
        </View>

        {/* Categories Section (Horizontal Scrollable) */}
        <View className="mb-6">
          <View className="flex-row-reverse justify-between items-center mb-3">
            <Text className="text-base font-bold text-gray-900 text-right">
              التصنيفات
            </Text>
            <TouchableOpacity onPress={() => handleCategoryPress(null)} activeOpacity={0.7}>
              <Text className="text-[#0F4C92] font-extrabold text-xs">
                تصفح الكل
              </Text>
            </TouchableOpacity>
          </View>

          {/* Categories Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -20, transform: [{ scaleX: -1 }] }}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            <View style={{ transform: [{ scaleX: -1 }], flexDirection: "row", gap: 12 }}>
              {categories.length > 0 ? (
                categories.map((cat, idx) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => handleCategoryPress(cat.id)}
                    activeOpacity={0.85}
                    style={{ width: 100, height: 100 }}
                    className="bg-[#edf3fa]/85 rounded-2xl items-center justify-center p-2 shadow-sm border border-[#e2ecf7]"
                  >
                    {idx % 3 === 0 ? <DuvetIcon /> : idx % 3 === 1 ? <PillowIcon /> : <MattressIcon />}
                    <Text className="text-[#0F4C92] font-bold text-xs mt-2 text-center" numberOfLines={1}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                [
                  { name: "مفروشات", icon: <DuvetIcon /> },
                  { name: "وسائد", icon: <PillowIcon /> },
                  { name: "بطانيات", icon: <MattressIcon /> },
                  { name: "ألحفة", icon: <DuvetIcon /> },
                  { name: "ملايات", icon: <PillowIcon /> },
                  { name: "إكسسوارات", icon: <MattressIcon /> },
                ].map((fallback, idx) => {
                  const found = categories.find((c) => c.name.includes(fallback.name));
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleCategoryPress(found?.id)}
                      activeOpacity={0.85}
                      style={{ width: 100, height: 100 }}
                      className="bg-[#edf3fa]/85 rounded-2xl items-center justify-center p-2 shadow-sm border border-[#e2ecf7]"
                    >
                      {fallback.icon}
                      <Text className="text-[#0F4C92] font-bold text-xs mt-2 text-center" numberOfLines={1}>
                        {fallback.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>

        {/* 2. Latest Products Widget ("أحدث المنتجات") */}
        <View className="mb-6">
          <View className="flex-row-reverse justify-between items-center mb-3">
            <View className="flex-row-reverse items-center gap-1.5">
              <Sparkles size={18} color="#0F4C92" />
              <Text className="text-base font-bold text-gray-900 text-right">
                أحدث المنتجات
              </Text>
            </View>

            <TouchableOpacity onPress={() => router.push("/shop")} activeOpacity={0.7}>
              <Text className="text-[#0F4C92] font-extrabold text-xs">
                عرض الكل
              </Text>
            </TouchableOpacity>
          </View>

          {isLoadingLatest ? (
            <View className="flex-row-reverse flex-wrap justify-between gap-y-4">
              <View className="w-[48%] bg-white rounded-2xl p-2.5 border border-gray-100 items-end justify-between gap-2">
                <View className="w-full h-32 rounded-xl bg-gray-100" />
                <View className="w-3/4 h-3 bg-gray-100 rounded mt-1" />
                <View className="w-1/2 h-3 bg-gray-100 rounded" />
              </View>
              <View className="w-[48%] bg-white rounded-2xl p-2.5 border border-gray-100 items-end justify-between gap-2">
                <View className="w-full h-32 rounded-xl bg-gray-100" />
                <View className="w-3/4 h-3 bg-gray-100 rounded mt-1" />
                <View className="w-1/2 h-3 bg-gray-100 rounded" />
              </View>
            </View>
          ) : latestProducts.length > 0 ? (
            <View className="flex-row-reverse flex-wrap justify-between gap-y-4">
              {latestProducts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push(`/product-details?id=${item.id}` as any)}
                  activeOpacity={0.92}
                  style={{ width: "48%" }}
                  className="bg-white rounded-3xl border border-gray-100/90 shadow-sm overflow-hidden justify-between mb-1"
                >
                  {/* Full-width Image Bleed */}
                  <View className="w-full h-36 bg-gray-100 relative">
                    {item.primaryImageUrl ? (
                      <Image
                        source={{ uri: item.primaryImageUrl }}
                        className="w-full h-full"
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <Package size={22} color="#a0aec0" />
                      </View>
                    )}
                  </View>

                  {/* Card Content */}
                  <View className="p-3">
                    {/* Details & Action button row */}
                    <View className="flex-row-reverse justify-between items-end w-full">
                      <View className="items-end flex-1 pl-1">
                        <Text
                          className="font-extrabold text-gray-900 text-xs text-right mb-0.5 w-full"
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <Text className="font-black text-[#0F4C92] text-xs text-right">
                          {item.price} {getCurrencySymbol(item.currencyId)}
                        </Text>
                      </View>

                      {/* Blue Circular Plus Action Button */}
                      <View className="w-8 h-8 rounded-full bg-[#0F4C92] items-center justify-center shadow-xs">
                        <Plus size={16} color="#ffffff" strokeWidth={2.5} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-2xl p-4 border border-gray-100 items-center justify-center">
              <Text className="text-gray-400 text-xs font-bold text-center">
                لا تتوفر أحدث منتجات حالياً.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
