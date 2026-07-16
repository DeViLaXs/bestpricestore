import type { JSX } from "react";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { withUniwind } from "uniwind";
import {
  List,
  Search,
  SlidersHorizontal,
  Package,
  AlertCircle,
  Compass,
  Tag,
} from "lucide-react-native";

import { useInfiniteProductsQuery, useCurrenciesQuery } from "../../hooks/useProducts";
import { useCategoriesQuery } from "../../hooks/useCategories";
import { productService } from "../../services/product.service";
import { useCartStore } from "../../store/cartStore";

// Wrap Lucide icons with Uniwind for compatibility with classNames
const StyledList = withUniwind(List);
const StyledSearch = withUniwind(Search);
const StyledSlidersHorizontal = withUniwind(SlidersHorizontal);
const StyledPackage = withUniwind(Package);
const StyledAlertCircle = withUniwind(AlertCircle);
const StyledCompass = withUniwind(Compass);
const StyledTag = withUniwind(Tag);

// Loading Skeleton Component for Product Cards
const ProductCardSkeleton = (): JSX.Element => (
  <View className="flex-1 bg-white rounded-3xl p-3.5 border border-gray-100 shadow-xs m-1.5 justify-between">
    <View className="w-full h-32 rounded-2xl bg-gray-100" />
    <View className="items-center mt-3 mb-2 px-1 gap-1.5">
      <View className="w-3/4 h-4 bg-gray-100 rounded" />
      <View className="w-1/2 h-3.5 bg-gray-100 rounded" />
    </View>
    <View className="w-full h-10 bg-gray-100 rounded-2xl mt-1" />
  </View>
);

export default function ShopScreen(): JSX.Element {
  const insets = useSafeAreaInsets();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Price Sort State: 'none' | 'asc' | 'desc'
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none");

  // Debounce search query to optimize API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // API Queries
  const { data: categories = [] } = useCategoriesQuery();
  const { data: currencies = [] } = useCurrenciesQuery();

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteProductsQuery({
    search: debouncedSearch || undefined,
    categoryId: selectedCategoryId || undefined,
    pageSize: 10,
  });

  // Re-fetch data automatically when the screen receives focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Flatten paginated pages into a single items array
  const allProducts = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data]);

  // Apply client-side price sorting
  const sortedProducts = useMemo(() => {
    if (priceSort === "asc") {
      return [...allProducts].sort((a, b) => a.price - b.price);
    }
    if (priceSort === "desc") {
      return [...allProducts].sort((a, b) => b.price - a.price);
    }
    return allProducts;
  }, [allProducts, priceSort]);

  // Helper to resolve currency abbreviation from lookup mapping
  const getCurrencySymbol = (currencyId: number) => {
    const currency = currencies.find((c) => c.id === currencyId);
    if (!currency) return "ر.س";
    if (currency.name === "ريال يمني") return "ر.ي";
    if (currency.name === "ريال سعودي") return "ر.س";
    return currency.name;
  };

  // Cycle through price sorting options
  const handlePriceSortPress = () => {
    setPriceSort((prev) => {
      if (prev === "none") return "asc";
      if (prev === "asc") return "desc";
      return "none";
    });
  };

  // Add product to cart action
  const handleAddToCart = async (productItem: any) => {
    try {
      const detailedProduct = await productService.getProduct(productItem.id);
      if (!detailedProduct || !detailedProduct.images || detailedProduct.images.length === 0) {
        Alert.alert("خطأ", "عذرًا، لا تتوفر تفاصيل أو صور لهذا المنتج حاليًا.");
        return;
      }

      const primaryImage = detailedProduct.images.find((img) => img.isPrimary) || detailedProduct.images[0];
      if (!primaryImage) {
        Alert.alert("خطأ", "لا توجد تفاصيل المخزن لهذا المنتج.");
        return;
      }

      if (primaryImage.quantityInStock <= 0) {
        Alert.alert("تنبيه", "عذرًا، هذا المنتج غير متوفر في المخزن حاليًا.");
        return;
      }

      const cartStore = useCartStore.getState();
      const result = cartStore.addItem({
        productId: detailedProduct.id,
        productImageId: primaryImage.id,
        name: detailedProduct.name,
        price: detailedProduct.price,
        currencyId: detailedProduct.currencyId,
        currencyName: detailedProduct.currencyName || "ريال سعودي",
        imageUrl: primaryImage.imageUrl,
        quantityInStock: primaryImage.quantityInStock,
      }, 1);

      if (result.success) {
        Alert.alert(
          "تم الإضافة",
          `تم إضافة "${detailedProduct.name}" إلى سلة المشتريات بنجاح.`,
          [{ text: "حسنًا" }]
        );
      } else {
        Alert.alert("تنبيه", result.error || "تعذر إضافة المنتج بالسلة.");
      }
    } catch {
      Alert.alert("خطأ", "فشلت عملية إضافة المنتج للسلة، يرجى المحاولة لاحقًا.");
    }
  };

  // Category selection handler
  const handleCategoryPress = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  };

  // Safe area top calculation
  const safeTop = insets.top > 0 ? insets.top : 47;

  // Header Component
  const renderHeader = () => (
    <View className="bg-[#f8fafd] pb-4">
      {/* Top Title & Menu Bar */}
      <View className="flex-row items-center justify-between px-6 py-4">
        {/* Menu Icon (Left) */}
        <TouchableOpacity
          className="w-11 h-11 rounded-2xl border border-gray-100 bg-white items-center justify-center shadow-xs active:opacity-80"
          activeOpacity={0.8}
        >
          <StyledList size={22} className="text-[#0c3f7c]" />
        </TouchableOpacity>

        {/* Title (Right) */}
        <Text className="text-[26px] font-black text-[#0c3f7c] tracking-tight text-right">
          تصفح المنتجات
        </Text>
      </View>

      {/* Search Input Box */}
      <View className="px-6 mb-5">
        <View className="relative justify-center">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ابحث عن منتج..."
            placeholderTextColor="#a0aec0"
            className="h-12 rounded-2xl border border-gray-200 bg-white pr-11 pl-11 text-sm text-gray-800 font-semibold text-right"
          />
          <StyledSearch size={20} className="text-gray-400 absolute right-4" />
          <StyledCompass size={20} className="text-[#0c3f7c] absolute left-4" />
        </View>
      </View>

      {/* Category Horizontal Scrollbar */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[
          { id: null, name: "الكل" },
          ...categories,
        ]}
        keyExtractor={(item) => (item.id === null ? "all" : item.id.toString())}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
        inverted // Ensures layout flows properly in RTL
        renderItem={({ item }) => {
          const isSelected = selectedCategoryId === item.id;
          return (
            <TouchableOpacity
              onPress={() => handleCategoryPress(item.id)}
              activeOpacity={0.8}
              className={`flex-row items-center gap-1.5 px-4 py-2.5 rounded-full border ${
                isSelected
                  ? "bg-[#0c3f7c] border-[#0c3f7c]"
                  : "bg-white border-gray-200"
              }`}
            >
              {item.id !== null && (
                <StyledTag
                  size={14}
                  className={isSelected ? "text-white" : "text-gray-400"}
                />
              )}
              <Text
                className={`text-xs font-bold ${
                  isSelected ? "text-white" : "text-gray-600"
                }`}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListHeaderComponent={
          // Price filter pill appended at the end/front depending on RTL setup
          <TouchableOpacity
            onPress={handlePriceSortPress}
            activeOpacity={0.8}
            className={`flex-row items-center gap-1.5 px-4 py-2.5 rounded-full border mr-2.5 ${
              priceSort !== "none"
                ? "bg-[#0c3f7c] border-[#0c3f7c]"
                : "bg-white border-gray-200"
            }`}
          >
            <StyledSlidersHorizontal
              size={14}
              className={priceSort !== "none" ? "text-white" : "text-gray-600"}
            />
            <Text
              className={`text-xs font-bold ${
                priceSort !== "none" ? "text-white" : "text-gray-600"
              }`}
            >
              {priceSort === "none"
                ? "فلتر السعر"
                : priceSort === "asc"
                  ? "السعر: تصاعدي"
                  : "السعر: تنازلي"}
            </Text>
          </TouchableOpacity>
        }
      />
    </View>
  );

  // Initial loading state
  if (isLoading && !isRefetching) {
    return (
      <View className="flex-1 bg-[#f8fafd]" style={{ paddingTop: safeTop }}>
        <StatusBar style="dark" />
        {renderHeader()}
        <View className="flex-1 px-4.5 pt-3">
          <FlatList
            data={Array.from({ length: 6 })}
            numColumns={2}
            keyExtractor={(_, index) => index.toString()}
            renderItem={() => <ProductCardSkeleton />}
          />
        </View>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View className="flex-1 bg-[#f8fafd] justify-center items-center px-6">
        <StatusBar style="dark" />
        <StyledAlertCircle size={56} className="text-red-500 mb-4" />
        <Text className="text-red-600 font-black text-lg mb-2 text-center">
          حدث خطأ أثناء تحميل المنتجات
        </Text>
        <Text className="text-gray-500 text-sm mb-6 text-center">
          {error?.message || "يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً."}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="bg-[#0c3f7c] px-8 py-3.5 rounded-2xl shadow-md active:opacity-90"
        >
          <Text className="text-white font-extrabold text-sm">إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8fafd]" style={{ paddingTop: safeTop }}>
      <StatusBar style="dark" />
      <FlatList
        data={sortedProducts}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 10,
          paddingBottom: insets.bottom + 90, // Spacing for tab-bar
        }}
        ListHeaderComponent={renderHeader}
        ListHeaderComponentStyle={{
          marginHorizontal: -18,
          marginBottom: 10,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/product-details?id=${item.id}` as any)}
            activeOpacity={0.95}
            className="flex-1 bg-white rounded-3xl p-3 border border-gray-100 shadow-xs m-1.5 justify-between"
          >
            {/* Image Section */}
            {item.primaryImageUrl ? (
              <Image
                source={{ uri: item.primaryImageUrl }}
                className="w-full h-32 rounded-2xl bg-gray-50"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-32 rounded-2xl bg-gray-50 items-center justify-center">
                <StyledPackage size={32} className="text-gray-300" />
              </View>
            )}

            {/* Product Details Section */}
            <View className="items-center mt-3 mb-2 px-1">
              <Text
                className="font-black text-gray-800 text-xs text-center leading-5"
                numberOfLines={2}
              >
                {item.name}
              </Text>
              <Text className="font-extrabold text-[#0c3f7c] text-xs mt-1">
                {item.price} {getCurrencySymbol(item.currencyId)}
              </Text>
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity
              onPress={() => handleAddToCart(item)}
              activeOpacity={0.85}
              className="bg-[#0c3f7c] w-full py-2.5 rounded-2xl items-center justify-center mt-1 active:opacity-95"
            >
              <Text className="text-white font-extrabold text-xs">أضف للسلة</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20 px-6">
            <StyledPackage size={56} className="text-gray-300 mb-4" />
            <Text className="text-gray-500 font-extrabold text-base text-center">
              لا توجد منتجات مطابقة للبحث
            </Text>
          </View>
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-6 justify-center items-center">
              <ActivityIndicator size="small" color="#0c3f7c" />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={["#0c3f7c"]}
          />
        }
      />
    </View>
  );
}
