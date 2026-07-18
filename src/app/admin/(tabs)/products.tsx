import type { JSX } from "react";
import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  Search,
  AlertCircle,
  Package,
  Check,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { withUniwind } from "uniwind";
import { useAuth } from "../../../hooks/useAuth";
import {
  useProductsQuery,
  useActivateProductMutation,
  useDeactivateProductMutation,
} from "../../../hooks/useProducts";
import { Product } from "../../../types";
import { useAlert } from "../../../contexts/AlertContext";
import { useToast, Toast } from "heroui-native";
import ProductListSkeleton from "../../../components/ProductListSkeleton";

// Wrap Lucide icons with Uniwind for tailwind styling compatibility
const StyledSearch = withUniwind(Search);
const StyledPackage = withUniwind(Package);
const StyledCheck = withUniwind(Check);
const StyledAlertCircle = withUniwind(AlertCircle);
const StyledTrash2 = withUniwind(Trash2);
const StyledEye = withUniwind(Eye);
const StyledEyeOff = withUniwind(EyeOff);

export default function ProductsScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();
  const { showAlert } = useAlert();
  const { toast } = useToast();

  // Search States (Local input & debounced backend query)
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Tab Filtering State
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "outOfStock">("all");

  // Route guard: only allow users with Admin role or credentials
  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/" as any);
    }
  }, [user, isAdmin]);

  // Debounce search query to prevent spamming backend requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Queries & Mutations
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useProductsQuery({
    search: debouncedSearch || undefined,
  });

  const activateMutation = useActivateProductMutation();
  const deactivateMutation = useDeactivateProductMutation();
  const isActionPending = activateMutation.isPending || deactivateMutation.isPending;

  // Navigate to Edit Product screen
  const handleEditProduct = (product: Product) => {
    router.push(`/admin/edit-product?id=${product.id}` as any);
  };

  const handleDeleteProduct = (product: Product) => {
    if (product.isActive) {
      showAlert(
        "إخفاء المنتج",
        `هل أنت متأكد من رغبتك في إخفاء المنتج "${product.name}"؟`,
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "تأكيد الإخفاء",
            style: "destructive",
            onPress: async () => {
              try {
                await deactivateMutation.mutateAsync(product.id);
                toast.show({
                  component: (props) => (
                    <Toast
                      variant="success"
                      {...props}
                      className="bg-white border border-gray-100 p-3.5 rounded-2xl flex-row-reverse items-center shadow-lg"
                    >
                      <View className="w-8 h-8 rounded-full bg-green-50 justify-center items-center ml-3">
                        <Check size={18} color="#16a34a" />
                      </View>
                      <View className="items-end flex-1 pr-1">
                        <Text className="text-gray-900 font-extrabold text-xs text-right">نجاح</Text>
                        <Text className="text-gray-500 font-bold text-[10px] text-right mt-0.5">تم إخفاء المنتج بنجاح.</Text>
                      </View>
                      <Toast.Close className="mr-auto" iconProps={{ size: 14, color: "#94a3b8" }} />
                    </Toast>
                  ),
                });
              } catch (err: any) {
                toast.show({
                  component: (props) => (
                    <Toast
                      variant="danger"
                      {...props}
                      className="bg-white border border-gray-100 p-3.5 rounded-2xl flex-row-reverse items-center shadow-lg"
                    >
                      <View className="w-8 h-8 rounded-full bg-red-50 justify-center items-center ml-3">
                        <AlertCircle size={18} color="#dc2626" />
                      </View>
                      <View className="items-end flex-1 pr-1">
                        <Text className="text-gray-900 font-extrabold text-xs text-right">خطأ</Text>
                        <Text className="text-gray-500 font-bold text-[10px] text-right mt-0.5">{err.message || "فشلت عملية إخفاء المنتج."}</Text>
                      </View>
                      <Toast.Close className="mr-auto" iconProps={{ size: 14, color: "#94a3b8" }} />
                    </Toast>
                  ),
                });
              }
            },
          },
        ]
      );
    } else {
      showAlert(
        "إظهار المنتج",
        `هل أنت متأكد من رغبتك في إظهار المنتج "${product.name}"؟`,
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "تأكيد الإظهار",
            onPress: async () => {
              try {
                await activateMutation.mutateAsync(product.id);
                toast.show({
                  component: (props) => (
                    <Toast
                      variant="success"
                      {...props}
                      className="bg-white border border-gray-100 p-3.5 rounded-2xl flex-row-reverse items-center shadow-lg"
                    >
                      <View className="w-8 h-8 rounded-full bg-green-50 justify-center items-center ml-3">
                        <Check size={18} color="#16a34a" />
                      </View>
                      <View className="items-end flex-1 pr-1">
                        <Text className="text-gray-900 font-extrabold text-xs text-right">نجاح</Text>
                        <Text className="text-gray-500 font-bold text-[10px] text-right mt-0.5">تم إظهار المنتج بنجاح.</Text>
                      </View>
                      <Toast.Close className="mr-auto" iconProps={{ size: 14, color: "#94a3b8" }} />
                    </Toast>
                  ),
                });
              } catch (err: any) {
                toast.show({
                  component: (props) => (
                    <Toast
                      variant="danger"
                      {...props}
                      className="bg-white border border-gray-100 p-3.5 rounded-2xl flex-row-reverse items-center shadow-lg"
                    >
                      <View className="w-8 h-8 rounded-full bg-red-50 justify-center items-center ml-3">
                        <AlertCircle size={18} color="#dc2626" />
                      </View>
                      <View className="items-end flex-1 pr-1">
                        <Text className="text-gray-900 font-extrabold text-xs text-right">خطأ</Text>
                        <Text className="text-gray-500 font-bold text-[10px] text-right mt-0.5">{err.message || "فشلت عملية إظهار المنتج."}</Text>
                      </View>
                      <Toast.Close className="mr-auto" iconProps={{ size: 14, color: "#94a3b8" }} />
                    </Toast>
                  ),
                });
              }
            },
          },
        ]
      );
    }
  };

  // Compute counts for status tabs dynamically
  const counts = useMemo(() => {
    let all = products.length;
    let active = 0;
    let inactive = 0;
    let outOfStock = 0;

    products.forEach((product) => {
      const totalQuantity =
        product.images?.reduce((sum, img) => sum + (img.quantityInStock || 0), 0) || 0;
      if (product.isActive) {
        active++;
      } else {
        inactive++;
      }
      if (totalQuantity === 0) {
        outOfStock++;
      }
    });

    return { all, active, inactive, outOfStock };
  }, [products]);

  // Filter products by status filter tab
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const totalQuantity =
        product.images?.reduce((sum, img) => sum + (img.quantityInStock || 0), 0) || 0;
      if (statusFilter === "active") {
        return product.isActive;
      }
      if (statusFilter === "inactive") {
        return !product.isActive;
      }
      if (statusFilter === "outOfStock") {
        return totalQuantity === 0;
      }
      return true;
    });
  }, [products, statusFilter]);

  const safeTop = insets.top > 0 ? insets.top : 47;

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Clean White Header Banner */}
      <View className="bg-white" style={{ paddingTop: safeTop }}>
        <View className="flex-row-reverse items-center px-6 py-2.5">
          <Text className="text-lg font-bold text-gray-900 text-right">المنتجات</Text>
        </View>
      </View>

      {/* Search Area */}
      <View className="px-6 pt-3 pb-2 bg-[#f8fafd]">
        {/* Search Input Box */}
        <View className="relative justify-center">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ابحث عن منتج..."
            placeholderTextColor="#a0aec0"
            className="h-10 rounded-xl border-[1.5px] border-gray-200 bg-white pr-4 pl-11 text-xs text-gray-800 font-semibold text-right"
          />
          <StyledSearch size={18} className="text-gray-400 absolute left-4" />
        </View>
      </View>

      {/* Status Filter Tabs */}
      <View className="border-b border-gray-100 bg-[#f8fafd]">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 0,
            flexDirection: "row-reverse", // RTL order
            alignItems: "center",
          }}
          className="h-11"
        >
          {/* Tab 1: الكل */}
          <TouchableOpacity
            onPress={() => setStatusFilter("all")}
            activeOpacity={0.7}
            className="px-3.5 h-full justify-center"
          >
            <View className="items-center">
              <Text
                className={`text-xs font-bold ${
                  statusFilter === "all" ? "text-[#0F4C92]" : "text-gray-500"
                }`}
              >
                الكل ({counts.all})
              </Text>
              <View
                className={`h-[2.5px] w-full bg-[#0F4C92] rounded-t-full mt-1.5 ${
                  statusFilter === "all" ? "opacity-100" : "opacity-0"
                }`}
              />
            </View>
          </TouchableOpacity>

          {/* Tab 2: نشط */}
          <TouchableOpacity
            onPress={() => setStatusFilter("active")}
            activeOpacity={0.7}
            className="px-3.5 h-full justify-center"
          >
            <View className="items-center">
              <Text
                className={`text-xs font-bold ${
                  statusFilter === "active" ? "text-[#0F4C92]" : "text-gray-500"
                }`}
              >
                نشط ({counts.active})
              </Text>
              <View
                className={`h-[2.5px] w-full bg-[#0F4C92] rounded-t-full mt-1.5 ${
                  statusFilter === "active" ? "opacity-100" : "opacity-0"
                }`}
              />
            </View>
          </TouchableOpacity>

          {/* Tab 3: غير نشط */}
          <TouchableOpacity
            onPress={() => setStatusFilter("inactive")}
            activeOpacity={0.7}
            className="px-3.5 h-full justify-center"
          >
            <View className="items-center">
              <Text
                className={`text-xs font-bold ${
                  statusFilter === "inactive" ? "text-[#0F4C92]" : "text-gray-500"
                }`}
              >
                غير نشط ({counts.inactive})
              </Text>
              <View
                className={`h-[2.5px] w-full bg-[#0F4C92] rounded-t-full mt-1.5 ${
                  statusFilter === "inactive" ? "opacity-100" : "opacity-0"
                }`}
              />
            </View>
          </TouchableOpacity>

          {/* Tab 4: نفد المخزون */}
          <TouchableOpacity
            onPress={() => setStatusFilter("outOfStock")}
            activeOpacity={0.7}
            className="px-3.5 h-full justify-center"
          >
            <View className="items-center">
              <Text
                className={`text-xs font-bold ${
                  statusFilter === "outOfStock" ? "text-[#0F4C92]" : "text-gray-500"
                }`}
              >
                نفد المخزون ({counts.outOfStock})
              </Text>
              <View
                className={`h-[2.5px] w-full bg-[#0F4C92] rounded-t-full mt-1.5 ${
                  statusFilter === "outOfStock" ? "opacity-100" : "opacity-0"
                }`}
              />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Content Area */}
      <View className="flex-1 bg-[#f8fafd]">
        {isLoading && !isRefetching ? (
          <ProductListSkeleton count={6} bottomPadding={90} />
        ) : error ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            className="px-6"
          >
            <StyledAlertCircle size={48} className="text-red-500 mb-2" />
            <Text className="text-red-500 text-center font-bold text-base mb-2">
              تعذر تحميل بيانات المنتجات
            </Text>
            <Text className="text-gray-500 text-center text-xs mb-4">
              {error.message?.toLowerCase().includes("network")
                ? "خطأ في الاتصال بالشبكة، يرجى التحقق من اتصالك بالإنترنت"
                : error.message}
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="bg-[#0F4C92] px-6 py-2.5 rounded-full"
            >
              <Text className="text-white font-bold">إعادة المحاولة</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : products.length === 0 ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            className="px-6"
          >
            <StyledPackage size={48} className="text-gray-300 mb-2" />
            <Text className="text-gray-500 font-bold text-center">لا توجد منتجات مسجلة حالياً</Text>
          </ScrollView>
        ) : filteredProducts.length === 0 ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            className="px-6"
          >
            <StyledPackage size={48} className="text-gray-300 mb-2" />
            <Text className="text-gray-500 font-bold text-center">لا توجد منتجات مطابقة لهذا القسم</Text>
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: insets.bottom + 90, // extra padding for bottom tabs
              gap: 10,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={["#0F4C92"]} />
            }
          >
            {filteredProducts.map((product) => {
              // Find primary image URL or fallback to the first image in array
              const primaryImage =
                product.images?.find((img) => img.isPrimary) || product.images?.[0];
              const imageUrl = primaryImage?.imageUrl;

              // Calculate total quantity across all product image/variation slots
              const totalQuantity =
                product.images?.reduce((sum, img) => sum + (img.quantityInStock || 0), 0) || 0;

              // Format currency shortcut
              const currencyShortcut =
                product.currencyName === "ريال يمني"
                  ? "ر.ي"
                  : product.currencyName === "ريال سعودي"
                    ? "ر.س"
                    : product.currencyName || "ر.س";

              return (
                <TouchableOpacity
                  key={product.id}
                  onPress={() => handleEditProduct(product)}
                  activeOpacity={0.95}
                  className={`bg-white rounded-2xl p-3.5 flex-row-reverse justify-between items-stretch border border-gray-100/80 ${
                    !product.isActive ? "opacity-75 bg-gray-50/50" : ""
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.03,
                    shadowRadius: 5,
                    elevation: 1,
                  }}
                >
                  {/* Right Side: Product Image & Details (RTL order) */}
                  <View className="flex-row-reverse items-center flex-1">
                    {/* Product Image */}
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        className="w-16 h-16 rounded-xl bg-gray-50"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-16 h-16 rounded-xl bg-gray-100 items-center justify-center">
                        <StyledPackage size={20} className="text-gray-400" />
                      </View>
                    )}

                    {/* Product Text details */}
                    <View className="items-end flex-1 pr-3 pl-1">
                      <Text
                        className="font-extrabold text-gray-900 text-sm mb-0.5 text-right"
                        numberOfLines={1}
                      >
                        {product.name}
                      </Text>

                      {/* Category name */}
                      <Text className="text-[10px] text-[#0F4C92] font-bold mb-0.5 text-right">
                        {product.categoryName}
                      </Text>

                      {/* Price and Status Badge (Inline to save space) */}
                      <View className="flex-row-reverse items-center gap-1.5 mt-0.5">
                        <Text className="font-extrabold text-gray-800 text-xs text-right">
                          {product.price} {currencyShortcut}
                        </Text>
                        <View
                          className={`px-1.5 py-0.5 rounded-full ${
                            product.isActive ? "bg-[#e6f4ea]" : "bg-[#fce8e6]"
                          }`}
                        >
                          <Text
                            className={`text-[8px] font-bold ${
                              product.isActive ? "text-[#137333]" : "text-[#c5221f]"
                            }`}
                          >
                            {product.isActive ? "نشط" : "غير نشط"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Left Side: Actions (Trash/Check) & Stock */}
                  <View className="justify-between items-start pl-0.5">
                    {/* Hide / Show Button */}
                    {product.isActive ? (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(product);
                        }}
                        disabled={isActionPending}
                        className="w-8 h-8 items-center justify-center rounded-xl border border-red-100 bg-red-50/50"
                        activeOpacity={0.7}
                      >
                        <StyledEyeOff size={15} className="text-red-500" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(product);
                        }}
                        disabled={isActionPending}
                        className="w-8 h-8 items-center justify-center rounded-xl border border-green-100 bg-green-50/50"
                        activeOpacity={0.7}
                      >
                        <StyledEye size={15} className="text-green-600" />
                      </TouchableOpacity>
                    )}

                    {/* Stock quantity */}
                    <Text className="text-gray-500 text-[10px] font-bold mt-auto">
                      المخزون: {totalQuantity}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
