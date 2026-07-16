import type { JSX } from "react";
import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Pressable,
  Modal,
} from "react-native";
import {
  Menu,
  Search,
  AlertCircle,
  Users,
  LogOut,
  X,
  ShoppingBag,
  Settings,
  Tag,
  SlidersHorizontal,
  Plus,
  Package,
  Check,
  Pencil,
  Trash2,
  User,
  ClipboardList,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { withUniwind } from "uniwind";
import { useAuth } from "../../hooks/useAuth";
import {
  useProductsQuery,
  useActivateProductMutation,
  useDeactivateProductMutation,
} from "../../hooks/useProducts";
import { useCategoriesQuery } from "../../hooks/useCategories";
import { Product } from "../../services/product.service";

// Wrap Lucide icons with Uniwind for tailwind styling compatibility
const StyledMenu = withUniwind(Menu);
const StyledSearch = withUniwind(Search);
const StyledPlus = withUniwind(Plus);
const StyledX = withUniwind(X);
const StyledSlidersHorizontal = withUniwind(SlidersHorizontal);
const StyledShoppingBag = withUniwind(ShoppingBag);
const StyledTag = withUniwind(Tag);
const StyledUsers = withUniwind(Users);
const StyledSettings = withUniwind(Settings);
const StyledLogOut = withUniwind(LogOut);
const StyledPackage = withUniwind(Package);
const StyledCheck = withUniwind(Check);
const StyledAlertCircle = withUniwind(AlertCircle);
const StyledPencil = withUniwind(Pencil);
const StyledTrash2 = withUniwind(Trash2);
const StyledUser = withUniwind(User);
const StyledClipboardList = withUniwind(ClipboardList);


export default function ProductsScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { user, isAdmin, logoutMutation } = useAuth();

  // Sidebar Drawer States and Animation
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [slideAnim] = useState(() => new Animated.Value(-280));

  // Category Filtering States
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  // Search States (Local input & debounced backend query)
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Route guard: only allow users with Admin role or credentials
  useEffect(() => {
    if (user && !isAdmin) {
      Alert.alert("تنبيه", "عذراً، هذه الصفحة مخصصة للمسؤولين فقط.");
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

  // Sidebar Controls
  const toggleSidebar = (open: boolean) => {
    if (open) {
      setIsSidebarOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -280,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        setIsSidebarOpen(false);
      });
    }
  };

  // Logout control
  const handleLogout = () => {
    Alert.alert(
      "تسجيل الخروج",
      "هل أنت متأكد من رغبتك في تسجيل الخروج؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "خروج",
          style: "destructive",
          onPress: async () => {
            try {
              toggleSidebar(false);
              await logoutMutation.mutateAsync();
              router.replace("/login");
            } catch (err) {
              console.log("Logout failed:", err);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Queries & Mutations
  const { data: categories = [] } = useCategoriesQuery();
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useProductsQuery({
    search: debouncedSearch || undefined,
    categoryId: selectedCategoryId || undefined,
  });

  const activateMutation = useActivateProductMutation();
  const deactivateMutation = useDeactivateProductMutation();
  const isActionPending = activateMutation.isPending || deactivateMutation.isPending;

  // Find category name by selected ID
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId) return "";
    return categories.find((cat) => cat.id === selectedCategoryId)?.name || "";
  }, [categories, selectedCategoryId]);

  // Navigate to Edit Product screen
  const handleEditProduct = (product: Product) => {
    router.push(`/admin/edit-product?id=${product.id}` as any);
  };

  const handleDeleteProduct = (product: Product) => {
    if (product.isActive) {
      Alert.alert(
        "تعطيل المنتج",
        `هل أنت متأكد من رغبتك في إيقاف تفعيل المنتج "${product.name}"؟`,
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "تأكيد التعطيل",
            style: "destructive",
            onPress: async () => {
              try {
                await deactivateMutation.mutateAsync(product.id);
                Alert.alert("نجاح", "تم إيقاف تفعيل المنتج بنجاح.");
              } catch (err: any) {
                Alert.alert("خطأ", err.message || "فشلت عملية إيقاف تفعيل المنتج.");
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "تفعيل المنتج",
        `هل أنت متأكد من رغبتك في تفعيل المنتج "${product.name}"؟`,
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "تأكيد التفعيل",
            onPress: async () => {
              try {
                await activateMutation.mutateAsync(product.id);
                Alert.alert("نجاح", "تم تفعيل المنتج بنجاح.");
              } catch (err: any) {
                Alert.alert("خطأ", err.message || "فشلت عملية تفعيل المنتج.");
              }
            },
          },
        ]
      );
    }
  };

  const safeTop = insets.top > 0 ? insets.top : 47;

  return (
    <View className="flex-1 bg-[#f8fafd]">
      <StatusBar style="light" />

      {/* Blue Header Banner */}
      <View className="bg-[#0F4C92] pb-11" style={{ paddingTop: safeTop }}>
        <View className="flex-row-reverse items-center justify-between px-6 py-3">
          {/* Title on Right */}
          <Text className="text-xl font-bold text-white text-right">إدارة المنتجات</Text>

          {/* Hamburger Menu Icon on Left */}
          <TouchableOpacity onPress={() => toggleSidebar(true)} className="p-1" activeOpacity={0.7}>
            <StyledMenu size={28} className="text-white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Container (Rounded White Card overlapping/below) */}
      <View className="flex-1 -mt-6 rounded-t-[28px] bg-[#f8fafd] overflow-hidden">
        {/* Search & Actions Area */}
        <View className="px-6 pt-6 pb-2">
          {/* Search Input Box */}
          <View className="relative justify-center">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="ابحث عن منتج..."
              placeholderTextColor="#a0aec0"
              className="h-12 rounded-2xl border-[1.5px] border-gray-200 bg-white pr-11 pl-4 text-sm text-gray-800 font-semibold text-right"
            />
            <StyledSearch size={20} className="text-gray-400 absolute right-4" />
          </View>

          {/* Add Product Header Row */}
          {/* <View className="flex-row-reverse items-center justify-between mt-4 mb-2">
            <Text className="text-sm font-bold text-gray-800 text-right">إضافة منتج</Text>
            <TouchableOpacity
              onPress={() => router.push("/admin/add-product" as any)}
              className="bg-[#edf5ff] border border-blue-100 flex-row items-center gap-1.5 px-3 py-1.5 rounded-full shadow-xs"
              activeOpacity={0.7}
            >
              <Text className="text-[#0c3f7c] font-black text-xs">إضافة منتج</Text>
              <StyledPlus size={14} className="text-[#0c3f7c]" />
            </TouchableOpacity>
          </View> */}

          {/* Section Divider & Filter Description */}
          <View className="flex-row-reverse items-center gap-1.5 mt-2 mb-1 px-1">
            <Text className="text-xs font-bold text-gray-400 text-right">
              {selectedCategoryName ? `ألمى المنتجات في ${selectedCategoryName}` : "ألمى المنتجات"}
            </Text>
            <TouchableOpacity onPress={() => setIsCategoryModalVisible(true)} activeOpacity={0.7}>
              <StyledSlidersHorizontal size={14} className="text-gray-400" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Products List */}
        {isLoading && !isRefetching ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0F4C92" />
            <Text className="text-gray-500 mt-2 font-semibold">جاري تحميل المنتجات...</Text>
          </View>
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
            <Text className="text-gray-500 text-center text-xs mb-4">{error.message}</Text>
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
        ) : (
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 10,
              paddingBottom: insets.bottom + 90, // extra padding for FAB
              gap: 16,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={["#0F4C92"]} />
            }
          >
            {products.map((product) => {
              // Find primary image URL or fallback to the first image in array
              const primaryImage =
                product.images?.find((img) => img.isPrimary) || product.images?.[0];
              const imageUrl = primaryImage?.imageUrl;

              // Calculate total quantity across all product image/variation slots
              const totalQuantity =
                product.images?.reduce((sum, img) => sum + (img.quantityInStock || 0), 0) || 0;

              // Format currency shortcut: "ريال يمني" -> "ر.ي", "ريال سعودي" -> "ر.س"
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
                  className={`bg-white rounded-3xl p-4 flex-row justify-between items-center shadow-sm border border-gray-50 ${
                    !product.isActive ? "opacity-60" : ""
                  }`}
                >
                  {/* Left Side Actions */}
                  <View className="flex-row items-center gap-2">
                    {/* Edit Button */}
                    <TouchableOpacity
                      onPress={() => handleEditProduct(product)}
                      disabled={isActionPending}
                      className="bg-[#edf5ff] w-9 h-9 items-center justify-center rounded-xl"
                      activeOpacity={0.7}
                    >
                      <StyledPencil size={16} className="text-[#0F4C92]" />
                    </TouchableOpacity>

                    {/* Delete / Reactivate Button */}
                    {product.isActive ? (
                      <TouchableOpacity
                        onPress={() => handleDeleteProduct(product)}
                        disabled={isActionPending}
                        className="bg-[#fff0f0] w-9 h-9 items-center justify-center rounded-xl"
                        activeOpacity={0.7}
                      >
                        <StyledTrash2 size={16} className="text-[#e53e3e]" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleDeleteProduct(product)}
                        disabled={isActionPending}
                        className="bg-[#eafaf1] w-9 h-9 items-center justify-center rounded-xl"
                        activeOpacity={0.7}
                      >
                        <StyledCheck size={16} className="text-[#2e7d32]" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Right Side Info & Image */}
                  <View className="flex-row items-center gap-3.5 flex-1 justify-end">
                    {/* Product Text details */}
                    <View className="items-end flex-1 pl-2">
                      <Text className="font-extrabold text-gray-900 text-sm mb-1.5 text-right">
                        {product.name}
                      </Text>

                      {/* Price */}
                      <Text
                        className="font-extrabold text-[#0c3f7c] text-sm text-right"
                        numberOfLines={1}
                      >
                        {product.price}
                        {"\u00A0"}
                        {currencyShortcut}
                      </Text>

                      {/* Info Row: Quantity & Status Badge */}
                      <View className="flex-row-reverse items-center gap-2 mt-1.5">
                        <Text className="text-gray-400 text-xs text-right font-semibold">
                          الكمية: {totalQuantity}
                        </Text>
                        <View
                          className={`px-2 py-0.5 rounded-full ${
                            product.isActive ? "bg-[#e6f4ea]" : "bg-[#fce8e6]"
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-bold ${
                              product.isActive ? "text-[#137333]" : "text-[#c5221f]"
                            }`}
                          >
                            {product.isActive ? "نشط" : "غير نشط"}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Product Image */}
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        className="w-16 h-16 rounded-2xl bg-gray-50"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-16 h-16 rounded-2xl bg-gray-100 items-center justify-center">
                        <StyledPackage size={24} className="text-gray-400" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Floating Action Button (FAB) at Bottom Right for Adding Products */}
      <View className="absolute bottom-6 right-6 z-40">
        <TouchableOpacity
          onPress={() => router.push("/admin/add-product" as any)}
          className="bg-[#0c3f7c] px-4 py-3.5 rounded-2xl flex-row items-center gap-2 shadow-lg active:opacity-90"
          activeOpacity={0.85}
        >
          {/* <Text className="text-white font-extrabold text-xs">إضافة منتج</Text> */}
          <StyledPlus size={16} className="text-white" />
        </TouchableOpacity>
      </View>

      {/* Sidebar Overlay Drawer */}
      {isSidebarOpen && (
        <View className="absolute inset-0 z-50 flex-row">
          {/* Backdrop (closes sidebar on press) */}
          <Pressable
            className="absolute inset-0 bg-black/40"
            onPress={() => toggleSidebar(false)}
          />

          {/* Animated Sidebar Container (Left side drawer) */}
          <Animated.View
            style={[
              {
                width: 280,
                height: "100%",
                backgroundColor: "#ffffff",
                paddingTop: insets.top,
                paddingBottom: Math.max(insets.bottom, 20),
                transform: [{ translateX: slideAnim }],
                shadowColor: "#000",
                shadowOffset: { width: 4, height: 0 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 8,
              },
            ]}
            className="flex-col justify-between"
          >
            {/* Top Section: Header & Menu Items */}
            <View className="flex-1">
              {/* Sidebar Header */}
              <View className="flex-row-reverse items-center justify-between px-5 py-4 border-b border-gray-100">
                <View className="items-end">
                  <Text className="font-extrabold text-[#0c3f7c] text-base text-right">
                    لوحة التحكم
                  </Text>
                  <Text className="text-gray-400 text-[10px] font-semibold text-right">
                    {user?.fullName || "المسؤول"}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => toggleSidebar(false)} className="p-1">
                  <StyledX size={20} className="text-gray-400" />
                </TouchableOpacity>
              </View>

              {/* Sidebar Links */}
              <View className="p-4 gap-2">
                {/* Link: الملف الشخصي */}
                <TouchableOpacity
                  onPress={() => {
                    toggleSidebar(false);
                    router.push("/admin/profile");
                  }}
                  className="flex-row-reverse items-center gap-3 p-3.5 rounded-2xl active:bg-gray-50"
                  activeOpacity={0.7}
                >
                  <StyledUser size={18} className="text-gray-500" />
                  <Text className="font-bold text-gray-600 text-sm text-right">الملف الشخصي</Text>
                </TouchableOpacity>

                {/* Link: إدارة المندوبين */}
                <TouchableOpacity
                  onPress={() => {
                    toggleSidebar(false);
                    router.replace("/admin/representatives" as any);
                  }}
                  className="flex-row-reverse items-center gap-3 p-3.5 rounded-2xl active:bg-gray-50"
                  activeOpacity={0.7}
                >
                  <StyledUsers size={18} className="text-gray-500" />
                  <Text className="font-bold text-gray-600 text-sm text-right">
                    إدارة المندوبين
                  </Text>
                </TouchableOpacity>

                {/* Link: إدارة الطلبات */}
                <TouchableOpacity
                  onPress={() => {
                    toggleSidebar(false);
                    router.replace("/admin/orders" as any);
                  }}
                  className="flex-row-reverse items-center gap-3 p-3.5 rounded-2xl active:bg-gray-50"
                  activeOpacity={0.7}
                >
                  <StyledClipboardList size={18} className="text-gray-500" />
                  <Text className="font-bold text-gray-600 text-sm text-right">إدارة الطلبات</Text>
                </TouchableOpacity>

                {/* Link: إدارة الفئات */}
                <TouchableOpacity
                  onPress={() => {
                    toggleSidebar(false);
                    router.replace("/admin/categories" as any);
                  }}
                  className="flex-row-reverse items-center gap-3 p-3.5 rounded-2xl active:bg-gray-50"
                  activeOpacity={0.7}
                >
                  <StyledTag size={18} className="text-gray-500" />
                  <Text className="font-bold text-gray-600 text-sm text-right">إدارة الفئات</Text>
                </TouchableOpacity>

                {/* Link: إدارة المنتجات (Active) */}
                <TouchableOpacity
                  className="flex-row-reverse items-center gap-3 bg-blue-50/70 p-3.5 rounded-2xl"
                  activeOpacity={0.9}
                >
                  <StyledPackage size={18} className="text-[#0c3f7c]" />
                  <Text className="font-extrabold text-[#0c3f7c] text-sm text-right">
                    إدارة المنتجات
                  </Text>
                </TouchableOpacity>

                {/* Link: إضافة منتج */}
                <TouchableOpacity
                  onPress={() => {
                    toggleSidebar(false);
                    router.replace("/admin/add-product" as any);
                  }}
                  className="flex-row-reverse items-center gap-3 p-3.5 rounded-2xl active:bg-gray-50"
                  activeOpacity={0.7}
                >
                  <StyledShoppingBag size={18} className="text-gray-500" />
                  <Text className="font-bold text-gray-600 text-sm text-right">إضافة منتج</Text>
                </TouchableOpacity>

                {/* Placeholder Link: إعدادات النظام */}
                <TouchableOpacity
                  onPress={() => Alert.alert("قريباً", "سيتم إضافة صفحة إعدادات النظام قريباً.")}
                  className="flex-row-reverse items-center gap-3 p-3.5 rounded-2xl active:bg-gray-50"
                  activeOpacity={0.7}
                >
                  <StyledSettings size={18} className="text-gray-500" />
                  <Text className="font-bold text-gray-600 text-sm text-right">إعدادات النظام</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Section: Pinned Logout Button */}
            <View className="px-4 pt-4 border-t border-gray-100">
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row-reverse items-center justify-center gap-2 bg-red-50 p-3.5 rounded-2xl active:bg-red-100"
                activeOpacity={0.7}
              >
                <StyledLogOut size={18} className="text-red-500" />
                <Text className="font-bold text-danger text-sm text-center">تسجيل الخروج</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Category Selection Modal */}
      <Modal
        visible={isCategoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setIsCategoryModalVisible(false)}
        >
          <View className="bg-white rounded-t-[28px] px-6 pt-5 pb-8 max-h-[70%]">
            {/* Modal Header */}
            <View className="flex-row-reverse items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <Text className="text-lg font-bold text-gray-800">اختر الفئة للتصفية</Text>
              <TouchableOpacity onPress={() => setIsCategoryModalVisible(false)} className="p-1">
                <StyledX size={20} className="text-gray-400" />
              </TouchableOpacity>
            </View>

            {/* List of Categories */}
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-2.5">
                {/* Option for All Categories */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategoryId(null);
                    setIsCategoryModalVisible(false);
                  }}
                  activeOpacity={0.7}
                  className={`flex-row-reverse items-center justify-between p-4 rounded-2xl border ${
                    selectedCategoryId === null
                      ? "border-[#0F4C92] bg-[#f0f7ff]"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${selectedCategoryId === null ? "text-[#0F4C92]" : "text-gray-700"}`}
                  >
                    كل الفئات (الكل)
                  </Text>
                  {selectedCategoryId === null && (
                    <StyledCheck size={18} className="text-[#0F4C92]" />
                  )}
                </TouchableOpacity>

                {categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => {
                        setSelectedCategoryId(cat.id);
                        setIsCategoryModalVisible(false);
                      }}
                      activeOpacity={0.7}
                      className={`flex-row-reverse items-center justify-between p-4 rounded-2xl border ${
                        isSelected ? "border-[#0F4C92] bg-[#f0f7ff]" : "border-gray-100 bg-white"
                      }`}
                    >
                      <Text
                        className={`text-sm font-bold ${isSelected ? "text-[#0F4C92]" : "text-gray-700"}`}
                      >
                        {cat.name}
                      </Text>
                      {isSelected && <StyledCheck size={18} className="text-[#0F4C92]" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
