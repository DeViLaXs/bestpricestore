import type { JSX } from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { withUniwind } from "uniwind";
import { ArrowLeft, ChevronDown, Plus, Minus, Trash2, Upload, X, Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../hooks/useAuth";
import { useCategoriesQuery } from "../../hooks/useCategories";
import {
  useCurrenciesQuery,
  useCreateProductMutation,
  useUploadImageMutation,
} from "../../hooks/useProducts";
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

interface ImageSlot {
  id: string;
  localUri?: string;
  uploadedUrl?: string;
  quantity: number;
  isUploading: boolean;
  error?: string;
}

export default function AddProductScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();

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

  // Image slots state (start with one empty slot)
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([
    { id: "1", quantity: 1, isUploading: false },
  ]);

  // Modal State for Category selection
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  // API Queries & Mutations
  const { data: currencies = [] } = useCurrenciesQuery();
  const { data: categories = [], isLoading: isLoadingCategories } = useCategoriesQuery();
  const createProductMutation = useCreateProductMutation();
  const uploadImageMutation = useUploadImageMutation();

  // Set default currency when currencies are loaded
  useEffect(() => {
    if (currencies.length > 0 && selectedCurrencyId === null) {
      // Find Saudi Riyal (usually id 2) or default to first
      const saudi = currencies.find((c) => c.name.includes("سعودي"));
      setSelectedCurrencyId(saudi ? saudi.id : currencies[0].id);
    }
  }, [currencies, selectedCurrencyId]);

  // Handle Pick and Upload Image for a slot
  const handlePickImage = async (slotId: string) => {
    // Request permission if needed
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("تنبيه", "يرجى منح صلاحية الوصول لمعرض الصور لرفع صور المنتج.");
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
      Alert.alert("خطأ", "فشلت عملية رفع الصورة. يرجى المحاولة مرة أخرى.");
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

  // Submit Product Form
  const handleSaveProduct = async () => {
    // 1. Validation
    const trimmedName = productName.trim();
    if (!trimmedName) {
      Alert.alert("تنبيه", "يرجى إدخال اسم المنتج.");
      return;
    }

    const priceNum = parseFloat(price.trim());
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("تنبيه", "يرجى إدخال سعر صالح أكبر من الصفر.");
      return;
    }

    if (!selectedCurrencyId) {
      Alert.alert("تنبيه", "يرجى اختيار العملة.");
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert("تنبيه", "يرجى اختيار فئة المنتج.");
      return;
    }

    // Filter slots that have successfully uploaded images
    const validImages = imageSlots.filter((slot) => slot.uploadedUrl);

    // Check if there are any slots currently uploading
    const currentlyUploading = imageSlots.some((slot) => slot.isUploading);
    if (currentlyUploading) {
      Alert.alert("تنبيه", "يرجى الانتظار حتى يكتمل رفع الصور الجاري.");
      return;
    }

    if (validImages.length === 0) {
      Alert.alert("تنبيه", "يرجى إضافة وصورة واحدة على الأقل بنجاح للمنتج.");
      return;
    }

    // Compile images array for backend, setting first as primary by default
    const imagesPayload = validImages.map((slot, index) => ({
      imageUrl: slot.uploadedUrl!,
      quantityInStock: slot.quantity,
      isPrimary: index === 0,
    }));

    try {
      await createProductMutation.mutateAsync({
        name: trimmedName,
        description: description.trim() || undefined,
        price: priceNum,
        currencyId: selectedCurrencyId,
        categoryId: selectedCategoryId,
        images: imagesPayload,
      });

      Alert.alert("نجاح", "تم إضافة المنتج بنجاح.", [
        {
          text: "موافق",
          onPress: () => {
            // Reset form
            setProductName("");
            setDescription("");
            setPrice("");
            setSelectedCategoryId(null);
            setImageSlots([{ id: "1", quantity: 1, isUploading: false }]);
            router.replace("/admin/products");
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert("خطأ", err.message || "فشلت عملية إضافة المنتج. يرجى المحاولة مرة أخرى.");
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

  return (
    <View className="flex-1 bg-[#f8fafd]">
      <StatusBar style="dark" />

      {/* Clean White Header Banner */}
      <View className="bg-white border-b border-gray-100/50" style={{ paddingTop: safeTop }}>
        <View className="flex-row items-center justify-between px-6 py-2.5">
          {/* Back Button on Left */}
          <TouchableOpacity
            onPress={() => router.replace("/admin/products")}
            className="p-1"
            activeOpacity={0.7}
          >
            <StyledArrowLeft size={24} className="text-gray-900" />
          </TouchableOpacity>

          {/* Title on Right */}
          <Text className="text-lg font-bold text-gray-900 text-right">إضافة منتج</Text>
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
                onChangeText={(text) => {
                  if (text.length <= 500) {
                    setDescription(text);
                  }
                }}
                placeholder="اكتب وصف المنتج بالتفصيل"
                placeholderTextColor="#a0aec0"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={{ fontFamily: "System", height: 120 }}
                className="rounded-2xl border-[1.5px] border-gray-200 bg-white p-4 pb-8 text-sm text-gray-800 font-semibold text-right"
              />
              <Text className="absolute bottom-3 left-4 text-xs font-semibold text-gray-400">
                {description.length}/500
              </Text>
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

          {/* Product Images Section */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-gray-800 text-right mb-0.5">صور المنتج</Text>
            <Text className="text-xs text-gray-400 text-right mb-4 font-semibold">
              أضف صور المنتج مع تحديد الكمية لكل صورة
            </Text>

            {/* List of Image Rows */}
            <View className="gap-3.5 mb-4">
              {imageSlots.map((slot, index) => (
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
                        <StyledMinus size={14} className={slot.quantity <= 1 ? "text-gray-300" : "text-gray-500"} />
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
            disabled={createProductMutation.isPending}
            activeOpacity={0.8}
            className="bg-[#0F4C92] h-13 rounded-2xl items-center justify-center flex-row shadow-sm mt-2"
          >
            {createProductMutation.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-base">حفظ المنتج</Text>
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
