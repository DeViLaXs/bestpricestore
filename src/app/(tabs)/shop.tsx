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
import { useFocusEffect, router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { withUniwind } from "uniwind";
import {
  Search,
  SlidersHorizontal,
  Package,
  AlertCircle,
  Tag,
  Plus,
  Star,
} from "lucide-react-native";

import {
  useInfiniteProductsQuery,
  useCurrenciesQuery,
  useGetProductDetails,
  useProductsQuery,
} from "../../hooks/useProducts";
import { useCategoriesQuery } from "../../hooks/useCategories";
import { useCartStore } from "../../store/cartStore";

// Wrap Lucide icons with Uniwind for compatibility with classNames
const StyledSearch = withUniwind(Search);
const StyledSlidersHorizontal = withUniwind(SlidersHorizontal);
const StyledPackage = withUniwind(Package);
const StyledAlertCircle = withUniwind(AlertCircle);
const StyledTag = withUniwind(Tag);

// Loading Skeleton Component for Product Cards (matching 2-column grid layout)
const ProductCardSkeleton = (): JSX.Element => (
  <View className="w-[48%] bg-white rounded-3xl p-3 border border-gray-100 items-end justify-between gap-2 mb-3">
    <View className="w-full h-36 rounded-2xl bg-gray-100" />
    <View className="w-3/4 h-3 bg-gray-100 rounded mt-1" />
    <View className="w-1/2 h-3 bg-gray-100 rounded" />
  </View>
);

export default function ShopScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const getProductDetails = useGetProductDetails();
  const params = useLocalSearchParams<{ categoryId?: string }>();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Sync selectedCategoryId with route param when navigated from Home screen or direct URL
  useEffect(() => {
    if (params.categoryId !== undefined) {
      if (params.categoryId === "" || params.categoryId === null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedCategoryId(null);
      } else {
        const catId = parseInt(params.categoryId, 10);
        if (!isNaN(catId)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSelectedCategoryId(catId);
        }
      }
    }
  }, [params.categoryId]);

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
  const { data: allDetailedProducts = [] } = useProductsQuery();

  // Create lookup map for product category names
  const categoryMap = useMemo(() => {
    const map: Record<number, string> = {};
    allDetailedProducts.forEach((p) => {
      if (p.id && p.categoryName) {
        map[p.id] = p.categoryName;
      }
    });
    return map;
  }, [allDetailedProducts]);

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
      const detailedProduct = await getProductDetails(productItem.id);
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

  // Header & Filters component rendered statically above list to keep it fixed
  const renderFixedHeader = () => (
    <View className="bg-white border-b border-gray-100/50">
      {/* Top Title Bar */}
      <View className="bg-white" style={{ paddingTop: safeTop }}>
        <View className="flex-row-reverse items-center px-6 py-2.5">
          <Text className="text-lg font-bold text-gray-900 text-right">تصفح المنتجات</Text>
        </View>
      </View>

      {/* Search Input Box */}
      <View className="px-6 pt-3 pb-2 bg-white">
        <View className="relative justify-center">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ابحث عن منتج..."
            placeholderTextColor="#a0aec0"
            className="h-10 rounded-xl border-[1.5px] border-gray-200 bg-white pr-10 pl-4 text-xs text-gray-800 font-semibold text-right"
          />
          <StyledSearch size={18} className="text-gray-400 absolute right-4" />
        </View>
      </View>

      {/* Category Horizontal Scrollbar */}
      <View className="border-b border-gray-100 bg-white pb-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { id: null, name: "الكل" },
            ...categories,
          ]}
          keyExtractor={(item) => (item.id === null ? "all" : item.id.toString())}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          inverted
          renderItem={({ item }) => {
            const isSelected = selectedCategoryId === item.id;
            return (
              <TouchableOpacity
                onPress={() => handleCategoryPress(item.id)}
                activeOpacity={0.8}
                className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full border ${
                  isSelected
                    ? "bg-[#0F4C92] border-[#0F4C92]"
                    : "bg-white border-gray-200"
                }`}
              >
                {item.id !== null && (
                  <StyledTag
                    size={12}
                    className={isSelected ? "text-white" : "text-gray-400"}
                  />
                )}
                <Text
                  className={`text-[11px] font-bold ${
                    isSelected ? "text-white" : "text-gray-600"
                  }`}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
          ListHeaderComponent={
            <TouchableOpacity
              onPress={handlePriceSortPress}
              activeOpacity={0.8}
              className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full border mr-2 ${
                priceSort !== "none"
                  ? "bg-[#0F4C92] border-[#0F4C92]"
                  : "bg-white border-gray-200"
              }`}
            >
              <StyledSlidersHorizontal
                size={12}
                className={priceSort !== "none" ? "text-white" : "text-gray-600"}
              />
              <Text
                className={`text-[11px] font-bold ${
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
    </View>
  );

  // Initial loading state
  if (isLoading && !isRefetching) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar style="dark" />
        {renderFixedHeader()}
        <View className="flex-1 bg-white px-4 pt-3">
          <FlatList
            key="grid-skeleton"
            numColumns={2}
            columnWrapperStyle={{ flexDirection: "row-reverse", justifyContent: "space-between" }}
            data={Array.from({ length: 6 })}
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
      <View className="flex-1 bg-white justify-center items-center px-6">
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
          className="bg-[#0F4C92] px-8 py-3.5 rounded-2xl shadow-md active:opacity-90"
        >
          <Text className="text-white font-extrabold text-sm">إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      {renderFixedHeader()}

      <View className="flex-1 bg-white">
        <FlatList
          key="grid-products"
          data={sortedProducts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ flexDirection: "row-reverse", justifyContent: "space-between" }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom + 90, // Spacing for tab-bar
            gap: 12,
          }}
          renderItem={({ item }) => {
            const catName =
              item.categoryName ||
              (item.categoryId
                ? categories.find((c) => c.id === item.categoryId)?.name
                : null) ||
              categoryMap[item.id] ||
              (selectedCategoryId
                ? categories.find((c) => c.id === selectedCategoryId)?.name
                : null);

            return (
              <TouchableOpacity
                onPress={() => router.push(`/product-details?id=${item.id}` as any)}
                activeOpacity={0.92}
                style={{ width: "48%" }}
                className="bg-white rounded-3xl border border-gray-100/90 shadow-sm overflow-hidden justify-between mb-3"
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
                      <StyledPackage size={22} className="text-gray-400" />
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

                    {/* Blue Circular Plus Action Button for Add to Cart */}
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item);
                      }}
                      activeOpacity={0.8}
                      className="w-8 h-8 rounded-full bg-[#0F4C92] items-center justify-center shadow-xs active:opacity-80"
                    >
                      <Plus size={16} color="#ffffff" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
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
              <View className="mt-2">
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={["#0F4C92"]}
            />
          }
        />
      </View>
    </View>
  );
}
