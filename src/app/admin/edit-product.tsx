import type { JSX } from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { withUniwind } from "uniwind";
import {
  ArrowLeft,
  ChevronDown,
  Plus,
  Minus,
  Trash2,
  Upload,
  X,
  Check,
  AlertCircle,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../hooks/useAuth";
import { useAlert } from "../../contexts/AlertContext";
import { useAppToast } from "../../hooks/useAppToast";
import { useCategoriesQuery } from "../../hooks/useCategories";
import {
  useCurrenciesQuery,
  useProductQuery,
  useUpdateProductMutation,
  useUploadImageMutation,
  useDeleteProductMutation,
  useActivateProductMutation,
  useDeactivateProductMutation,
} from "../../hooks/useProducts";
import EditProductSkeleton from "../../components/EditProductSkeleton";
import CategoryListSkeleton from "../../components/CategoryListSkeleton";

// Wrap Lucide icons with Uniwind for tailwind compatibility
const StyledArrowLeft = withUniwind(ArrowLeft);
const StyledChevronDown = withUniwind(ChevronDown);
const StyledPlus = withUniwind(Plus);
const StyledMinus = withUniwind(Minus);
const StyledTrash2 = withUniwind(Trash2);
const StyledUpload = withUniwind(Upload);
const StyledX = withUniwind(X);
const StyledCheck = withUniwind(Check);
const StyledAlertCircle = withUniwind(AlertCircle);

interface ImageSlot {
  id: string; // React-native key
  dbId?: number; // Database ID for existing images
  localUri?: string; // Local URI for newly picked images
  uploadedUrl?: string; // URL sent to backend (existing or newly uploaded)
  quantity: number;
  isUploading: boolean;
  error?: string;
}

export default function EditProductScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();
  const { showAlert } = useAlert();
  const { showSuccessToast, showErrorToast } = useAppToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = id ? parseInt(id, 10) : 0;

  // Route guard: only allow users with Admin role or credentials
  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/" as any);
    }
  }, [user, isAdmin]);

  // Form State
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([]);

  // Modal State for Category selection
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  // API Queries & Mutations
  const { data: currencies = [] } = useCurrenciesQuery();
  const { data: categories = [], isLoading: isLoadingCategories } = useCategoriesQuery();
  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
    refetch: refetchProduct,
  } = useProductQuery(productId);
  const updateProductMutation = useUpdateProductMutation();
  const uploadImageMutation = useUploadImageMutation();
  const deleteProductMutation = useDeleteProductMutation();
  const activateMutation = useActivateProductMutation();
  const deactivateMutation = useDeactivateProductMutation();

  // Populate form with existing product details
  useEffect(() => {
    if (product) {
      setProductName(product.name);
      setDescription(product.description || "");
      setPrice(String(product.price));
      setSelectedCurrencyId(product.currencyId);
      setSelectedCategoryId(product.categoryId);

      if (product.images && product.images.length > 0) {
        setImageSlots(
          product.images.map((img) => ({
            id: String(img.id),
            dbId: img.id,
            uploadedUrl: img.imageUrl,
            quantity: img.quantityInStock,
            isUploading: false,
          }))
        );
      } else {
        setImageSlots([{ id: String(Date.now()), quantity: 1, isUploading: false }]);
      }
    }
  }, [product]);

  // Handle Pick and Upload Image for a slot
  const handlePickImage = async (slotId: string) => {
    // Request permission if needed
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showAlert("تنبيه", "يرجى منح صلاحية الوصول لمعرض الصور لرفع صور المنتج.");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const fileUri = result.assets[0].uri;

      // Update slot state to loading and store localUri
      setImageSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                localUri: fileUri,
                isUploading: true,
                error: undefined,
                uploadedUrl: undefined,
              }
            : slot
        )
      );

      // Trigger immediate upload
      const uploadedUrl = await uploadImageMutation.mutateAsync(fileUri);

      // Update slot state with uploaded URL
      setImageSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId ? { ...slot, uploadedUrl, isUploading: false } : slot
        )
      );
    } catch (err: any) {
      console.log("Image pick or upload failed:", err);
      setImageSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId
            ? { ...slot, isUploading: false, error: err.message || "فشل الرفع" }
            : slot
        )
      );
      showAlert("خطأ", "فشلت عملية رفع الصورة. يرجى المحاولة مرة أخرى.");
    }
  };

  // Add another empty image slot
  const handleAddImageSlot = () => {
    const newSlot: ImageSlot = {
      id: String(Date.now()),
      quantity: 1,
      isUploading: false,
    };
    setImageSlots((prev) => [...prev, newSlot]);
  };

  // Remove an image slot
  const handleRemoveImageSlot = (slotId: string) => {
    setImageSlots((prev) => prev.filter((slot) => slot.id !== slotId));
  };

  // Adjust quantity for a slot
  const handleAdjustQuantity = (slotId: string, amount: number) => {
    setImageSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, quantity: Math.max(1, slot.quantity + amount) } : slot
      )
    );
  };

  // Find category name by ID
  const selectedCategoryName = categories.find((cat) => cat.id === selectedCategoryId)?.name || "";

  // Delete Product
  const handleDeleteProduct = () => {
    showAlert("حذف المنتج", `هل أنت متأكد من رغبتك في حذف المنتج "${productName}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تأكيد الحذف",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProductMutation.mutateAsync(productId);
            showAlert("نجاح", "تم حذف المنتج بنجاح.", [
              {
                text: "موافق",
                onPress: () => {
                  router.replace("/admin/products");
                },
              },
            ]);
          } catch (err: any) {
            showAlert("خطأ", err.message || "فشلت عملية حذف المنتج. يرجى المحاولة مرة أخرى.");
          }
        },
      },
    ]);
  };
  const productIsActive = product?.isActive ?? true;

  const handleToggleStatus = async () => {
    if (!product) return;
    try {
      if (productIsActive) {
        await deactivateMutation.mutateAsync(product.id);
        showSuccessToast("نجاح", "تم إخفاء المنتج بنجاح.");
      } else {
        await activateMutation.mutateAsync(product.id);
        showSuccessToast("نجاح", "تم إظهار المنتج بنجاح.");
      }
    } catch (err: any) {
      showErrorToast("خطأ", err.message || "فشلت عملية تغيير حالة المنتج.");
    }
  };

  // Submit Product Form
  const handleSaveProduct = async () => {
    // 1. Validation
    const trimmedName = productName.trim();
    if (!trimmedName) {
      showAlert("تنبيه", "يرجى إدخال اسم المنتج.");
      return;
    }

    const priceNum = parseFloat(price.trim());
    if (isNaN(priceNum) || priceNum <= 0) {
      showAlert("تنبيه", "يرجى إدخال سعر صالح أكبر من الصفر.");
      return;
    }

    if (!selectedCurrencyId) {
      showAlert("تنبيه", "يرجى اختيار العملة.");
      return;
    }

    if (!selectedCategoryId) {
      showAlert("تنبيه", "يرجى اختيار فئة المنتج.");
      return;
    }

    // Filter slots that have successfully uploaded/existing images
    const validImages = imageSlots.filter((slot) => slot.uploadedUrl);

    // Check if there are any slots currently uploading
    const currentlyUploading = imageSlots.some((slot) => slot.isUploading);
    if (currentlyUploading) {
      showAlert("تنبيه", "يرجى الانتظار حتى يكتمل رفع الصور الجاري.");
      return;
    }

    if (validImages.length === 0) {
      showAlert("تنبيه", "يرجى إضافة صورة واحدة على الأقل بنجاح للمنتج.");
      return;
    }

    // Compile images array for backend, setting first as primary by default
    const imagesPayload = validImages.map((slot, index) => ({
      id: slot.dbId, // Include existing image ID (omitted for new ones)
      imageUrl: slot.uploadedUrl!,
      quantityInStock: slot.quantity,
      isPrimary: index === 0,
    }));

    try {
      await updateProductMutation.mutateAsync({
        id: productId,
        data: {
          name: trimmedName,
          description: description.trim() || undefined,
          price: priceNum,
          currencyId: selectedCurrencyId,
          categoryId: selectedCategoryId,
          images: imagesPayload,
        },
      });

      showSuccessToast("نجاح", "تم تحديث المنتج بنجاح.");
      router.replace("/admin/products");
    } catch (err: any) {
      showErrorToast("خطأ", err.message || "فشلت عملية تحديث المنتج. يرجى المحاولة مرة أخرى.");
    }
  };

  const safeTop = insets.top > 0 ? insets.top : 47;

  // Render currencies fallback if API is loading or empty
  const currencyOptions =
    currencies.length > 0
      ? currencies
      : [
          { id: 1, name: "ريال يمني" },
          { id: 2, name: "ريال سعودي" },
        ];

  if (isLoadingProduct) {
    return (
      <View className="flex-1 bg-[#f8fafd]">
        <StatusBar style="light" />
        <View className="bg-[#0F4C92]" style={{ paddingTop: safeTop }}>
          <View className="flex-row items-center justify-between px-6 py-2.5">
            <TouchableOpacity
              onPress={() => router.replace("/admin/products")}
              className="p-1"
              activeOpacity={0.7}
            >
              <StyledArrowLeft size={24} className="text-white" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-white text-right">تعديل المنتج</Text>
          </View>
        </View>
        <EditProductSkeleton />
      </View>
    );
  }

  if (productError) {
    return (
      <View className="flex-1 bg-[#f8fafd]">
        <StatusBar style="light" />
        <View className="bg-[#0F4C92]" style={{ paddingTop: safeTop }}>
          <View className="flex-row items-center justify-between px-6 py-2.5">
            <TouchableOpacity
              onPress={() => router.replace("/admin/products")}
              className="p-1"
              activeOpacity={0.7}
            >
              <StyledArrowLeft size={24} className="text-white" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-white text-right">تعديل المنتج</Text>
          </View>
        </View>
        <View className="flex-1 bg-[#f8fafd] px-6 justify-center items-center">
          <StyledAlertCircle size={48} className="text-red-500 mb-3" />
          <Text className="text-red-500 text-center font-bold text-base mb-2">
            تعذر تحميل تفاصيل المنتج
          </Text>
          <Text className="text-gray-500 text-center text-xs mb-4">{productError.message}</Text>
          <TouchableOpacity
            onPress={() => refetchProduct()}
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

      {/* Clean Blue Header Banner */}
      <View className="bg-[#0F4C92]" style={{ paddingTop: safeTop }}>
        <View className="flex-row items-center justify-between px-6 py-2.5">
          {/* Back Button on Left */}
          <TouchableOpacity
            onPress={() => router.replace("/admin/products")}
            className="p-1"
            activeOpacity={0.7}
          >
            <StyledArrowLeft size={24} className="text-white" />
          </TouchableOpacity>

          {/* Title on Right */}
          <Text className="text-lg font-bold text-white text-right">تعديل المنتج</Text>
        </View>
      </View>

      {/* Main Content Container */}
      <View
        style={{
          flex: 1,
          backgroundColor: "#f8fafd",
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          className="px-6 pt-6"
        >
          {/* Name Field */}
          <View className="mb-5">
            <Text className="text-sm font-bold text-gray-800 text-right mb-2">اسم المنتج</Text>
            <TextInput
              value={productName}
              onChangeText={setProductName}
              placeholder="ادخل اسم المنتج"
              placeholderTextColor="#a0aec0"
              style={{ fontFamily: "System" }}
              className="h-12 rounded-2xl border-[1.5px] border-gray-200 bg-white px-4 text-sm text-gray-800 font-semibold text-right"
            />
          </View>

          {/* Description Field */}
          <View className="mb-5">
            <Text className="text-sm font-bold text-gray-800 text-right mb-2">وصف المنتج</Text>
            <View className="relative">
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="اكتب وصف المنتج بالتفصيل"
                placeholderTextColor="#a0aec0"
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                style={{ fontFamily: "System", height: 200 }}
                className="rounded-2xl border-[1.5px] border-gray-200 bg-white p-4 text-sm text-gray-800 font-semibold text-right"
              />
            </View>
          </View>

          {/* Price Field */}
          <View className="mb-5">
            <Text className="text-sm font-bold text-gray-800 text-right mb-2">السعر</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="ادخل سعر المنتج"
              placeholderTextColor="#a0aec0"
              keyboardType="numeric"
              style={{ fontFamily: "System" }}
              className="h-12 rounded-2xl border-[1.5px] border-gray-200 bg-white px-4 text-sm text-gray-800 font-semibold text-right"
            />
          </View>

          {/* Currency Field */}
          <View className="mb-5">
            <Text className="text-sm font-bold text-gray-800 text-right mb-2">العملة</Text>
            <View className="flex-row items-center gap-3">
              {currencyOptions.map((curr) => {
                const isSelected = selectedCurrencyId === curr.id;
                return (
                  <TouchableOpacity
                    key={curr.id}
                    onPress={() => setSelectedCurrencyId(curr.id)}
                    activeOpacity={0.7}
                    className={`flex-1 flex-row items-center justify-between px-4 py-3 rounded-2xl border-[1.5px] ${
                      isSelected ? "border-[#0F4C92] bg-[#f0f7ff]" : "border-gray-200 bg-white"
                    }`}
                  >
                    <View className="w-5 h-5 rounded-full border border-gray-300 items-center justify-center">
                      {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-[#0F4C92]" />}
                    </View>
                    <Text
                      className={`text-sm font-bold ${isSelected ? "text-[#0F4C92]" : "text-gray-600"}`}
                    >
                      {curr.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Category Field */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-gray-800 text-right mb-2">الفئة</Text>
            <TouchableOpacity
              onPress={() => setIsCategoryModalVisible(true)}
              activeOpacity={0.7}
              className="h-12 rounded-2xl border-[1.5px] border-gray-200 bg-white px-4 flex-row items-center justify-between"
            >
              <StyledChevronDown size={20} className="text-gray-400" />
              <Text
                className={`text-sm font-semibold ${selectedCategoryName ? "text-gray-800" : "text-gray-400"}`}
              >
                {selectedCategoryName || "اختر الفئة"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Status (Active / Inactive) Toggle */}
          <View className="mb-5 bg-white p-4 rounded-2xl border border-gray-100 flex-row-reverse items-center justify-between shadow-sm">
            <View className="items-end">
              <Text className="text-sm font-bold text-gray-800 text-right mb-1">حالة ظهور المنتج</Text>
              <View className="flex-row-reverse items-center gap-2">
                <View className={`px-2.5 py-0.5 rounded-full ${productIsActive ? 'bg-[#e6f4ea]' : 'bg-[#fce8e6]'}`}>
                  <Text className={`text-[10px] font-bold ${productIsActive ? 'text-[#137333]' : 'text-[#c5221f]'}`}>
                    {productIsActive ? "نشط (يظهر للجميع)" : "غير نشط (مخفي)"}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleToggleStatus}
              disabled={activateMutation.isPending || deactivateMutation.isPending}
              className={`px-4 py-2 rounded-xl border ${
                productIsActive ? "border-gray-200 bg-gray-50" : "border-green-200 bg-green-50/50"
              }`}
              activeOpacity={0.7}
            >
              {activateMutation.isPending || deactivateMutation.isPending ? (
                <ActivityIndicator size="small" color="#0F4C92" />
              ) : (
                <Text className={`text-xs font-bold ${productIsActive ? "text-gray-600" : "text-green-700"}`}>
                  {productIsActive ? "إخفاء المنتج" : "إظهار المنتج"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Product Images Section */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-gray-800 text-right mb-0.5">صور المنتج</Text>
            <Text className="text-xs text-gray-400 text-right mb-4 font-semibold">
              أضف أو عدل صور المنتج مع تحديد الكمية لكل صورة
            </Text>

            {/* List of Image Rows */}
            <View className="gap-3.5 mb-4">
              {imageSlots.map((slot) => (
                <View
                  key={slot.id}
                  className="bg-white rounded-2xl p-3 border border-gray-100 flex-row items-center justify-between shadow-sm"
                >
                  {/* Left: Dashed Upload Box / Preview */}
                  <TouchableOpacity
                    onPress={() => !slot.isUploading && handlePickImage(slot.id)}
                    activeOpacity={0.7}
                    className="w-16 h-16 rounded-xl border border-dashed border-gray-300 bg-gray-50 items-center justify-center overflow-hidden"
                  >
                    {slot.isUploading ? (
                      <ActivityIndicator size="small" color="#0F4C92" />
                    ) : slot.uploadedUrl ? (
                      <Image source={{ uri: slot.uploadedUrl }} className="w-full h-full" />
                    ) : slot.localUri ? (
                      <Image source={{ uri: slot.localUri }} className="w-full h-full opacity-60" />
                    ) : (
                      <StyledUpload size={20} className="text-gray-400" />
                    )}
                  </TouchableOpacity>

                  {/* Center: Quantity adjust block */}
                  <View className="items-end gap-1.5 flex-1 mx-4">
                    <Text className="text-xs font-bold text-gray-400">الكمية</Text>
                    <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50/50">
                      <TouchableOpacity
                        onPress={() => handleAdjustQuantity(slot.id, -1)}
                        disabled={slot.quantity <= 1}
                        className="px-3 py-1.5"
                        activeOpacity={0.7}
                      >
                        <StyledMinus
                          size={14}
                          className={slot.quantity <= 1 ? "text-gray-300" : "text-gray-500"}
                        />
                      </TouchableOpacity>

                      <Text
                        style={{ fontFamily: "System" }}
                        className="px-3 text-sm font-bold text-gray-800 min-w-[28px] text-center"
                      >
                        {slot.quantity}
                      </Text>

                      <TouchableOpacity
                        onPress={() => handleAdjustQuantity(slot.id, 1)}
                        className="px-3 py-1.5"
                        activeOpacity={0.7}
                      >
                        <StyledPlus size={14} className="text-gray-500" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Right: Trash icon */}
                  <TouchableOpacity
                    onPress={() => handleRemoveImageSlot(slot.id)}
                    className="p-2.5 rounded-xl border border-red-50 bg-red-50/30"
                    activeOpacity={0.7}
                  >
                    <StyledTrash2 size={18} className="text-red-500" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Add another image button */}
            <TouchableOpacity
              onPress={handleAddImageSlot}
              activeOpacity={0.7}
              className="h-12 rounded-2xl border border-dashed border-blue-200 bg-white flex-row items-center justify-center gap-2"
            >
              <Text className="text-[#0F4C92] font-bold text-sm">إضافة صورة أخرى</Text>
              <StyledPlus size={16} className="text-[#0F4C92]" />
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSaveProduct}
            disabled={updateProductMutation.isPending || deleteProductMutation.isPending}
            activeOpacity={0.8}
            className="bg-[#0F4C92] h-13 rounded-2xl items-center justify-center flex-row shadow-sm mt-2"
          >
            {updateProductMutation.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-base">حفظ التعديلات</Text>
            )}
          </TouchableOpacity>

          {/* Delete Product Button */}
          <TouchableOpacity
            onPress={handleDeleteProduct}
            disabled={updateProductMutation.isPending || deleteProductMutation.isPending}
            activeOpacity={0.8}
            className="border border-red-200 bg-red-50 h-13 rounded-2xl items-center justify-center flex-row shadow-sm mt-3"
          >
            {deleteProductMutation.isPending ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Text className="text-red-600 font-bold text-base">حذف المنتج نهائياً</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Category Selection Slide-up Bottom Sheet Modal */}
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
              <Text className="text-lg font-bold text-gray-800">اختر الفئة</Text>
              <TouchableOpacity onPress={() => setIsCategoryModalVisible(false)} className="p-1">
                <StyledX size={20} className="text-gray-400" />
              </TouchableOpacity>
            </View>

            {/* List of Categories */}
            {isLoadingCategories ? (
              <View className="py-4">
                <CategoryListSkeleton count={4} marginHorizontal={0} />
              </View>
            ) : categories.length === 0 ? (
              <View className="py-10 items-center justify-center">
                <Text className="text-gray-500 font-semibold">لا توجد فئات متاحة.</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="gap-2.5">
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
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
