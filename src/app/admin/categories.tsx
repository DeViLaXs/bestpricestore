import type { JSX } from "react";
import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Search, AlertCircle, Trash2, Pencil, Plus, ArrowLeft, Tag, Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../hooks/useAuth";
import { useAlert } from "../../contexts/AlertContext";
import { useAppToast } from "../../hooks/useAppToast";
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../hooks/useCategories";
import { Category } from "../../types";
import CategoryListSkeleton from "../../components/CategoryListSkeleton";

export default function CategoriesScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();
  const { showAlert } = useAlert();
  const { showSuccessToast, showErrorToast, showWarningToast } = useAppToast();

  // Route guard: only allow users with Admin role or credentials
  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/" as any);
    }
  }, [user, isAdmin]);

  // Form State
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query to optimize API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // API Query & Mutations
  const { data: categories = [], isLoading, error, refetch, isRefetching } = useCategoriesQuery(debouncedSearch);
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();

  // Handle Add / Edit submit
  const handleSaveCategory = async () => {
    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      showWarningToast("تنبيه", "يرجى إدخال اسم الفئة.");
      return;
    }

    // Client-side uniqueness check
    const nameExistsLocally = categories.some(
      (cat) =>
        cat &&
        cat.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
        (!editingCategory || cat.id !== editingCategory.id)
    );

    if (nameExistsLocally) {
      showWarningToast("تنبيه", "اسم الفئة موجود بالفعل.");
      return;
    }

    try {
      if (editingCategory) {
        // Edit Action
        await updateMutation.mutateAsync({ id: editingCategory.id, name: trimmedName });
        showSuccessToast("نجاح", "تم تحديث الفئة بنجاح.");
        setEditingCategory(null);
      } else {
        // Create Action
        await createMutation.mutateAsync(trimmedName);
        showSuccessToast("نجاح", "تم إضافة الفئة بنجاح.");
      }
      setCategoryName("");
      refetch();
    } catch (err: any) {
      showErrorToast("خطأ", err.message || "فشلت العملية. يرجى المحاولة مرة أخرى.");
    }
  };

  // Start Editing mode
  const handleStartEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
  };

  // Cancel Editing mode
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setCategoryName("");
  };

  // Delete Category
  const handleDeleteCategory = (category: Category) => {
    showAlert(
      "حذف الفئة",
      `هل أنت متأكد من رغبتك في حذف الفئة "${category.name}"؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(category.id);
              showSuccessToast("نجاح", "تم حذف الفئة بنجاح.");
              if (editingCategory?.id === category.id) {
                handleCancelEdit();
              }
              refetch();
            } catch (err: any) {
              const errorMessage = err.message || "";
              const isConstraintError =
                err.response?.status === 500 ||
                errorMessage.includes("500") ||
                errorMessage.includes("foreign key") ||
                errorMessage.includes("constraint");
              
              if (isConstraintError) {
                showErrorToast("خطأ", "لا يمكن حذف هذه الفئة لوجود منتجات مرتبطة بها.");
              } else {
                showErrorToast("خطأ", err.message || "فشلت عملية حذف الفئة.");
              }
            }
          },
        },
      ]
    );
  };

  const safeTop = insets.top > 0 ? insets.top : 47;

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafd" }}>
      <StatusBar style="light" />

      {/* Clean Blue Header Banner */}
      <View className="bg-[#0F4C92]" style={{ paddingTop: safeTop }}>
        <View className="flex-row items-center justify-between px-6 py-2.5">
          {/* Back Button on Left */}
          <TouchableOpacity
            onPress={() => router.replace("/admin/more")}
            className="p-1"
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>

          {/* Title on Right */}
          <Text className="text-lg font-bold text-white text-right">إدارة الفئات</Text>
        </View>
      </View>

      {/* Content Container */}
      <View
        style={{
          flex: 1,
          backgroundColor: "#f8fafd",
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={["#0F4C92"]} />
          }
        >
          {/* Add / Edit Category Card */}
          <View className="bg-white rounded-3xl p-5 mx-6 mt-6 shadow-sm border border-gray-50">
            <Text className="text-base font-bold text-gray-800 text-right mb-3">
              {editingCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}
            </Text>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={handleSaveCategory}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[#0F4C92] h-12 px-5 rounded-2xl flex-row items-center justify-center gap-1.5"
                activeOpacity={0.7}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text className="text-white font-bold text-sm">
                      {editingCategory ? "حفظ" : "إضافة"}
                    </Text>
                    {!editingCategory && <Plus size={16} color="#ffffff" />}
                  </>
                )}
              </TouchableOpacity>

              {editingCategory && (
                <TouchableOpacity
                  onPress={handleCancelEdit}
                  className="bg-gray-100 h-12 px-4 rounded-2xl justify-center items-center"
                  activeOpacity={0.7}
                >
                  <Text className="text-gray-600 font-bold text-sm">إلغاء</Text>
                </TouchableOpacity>
              )}

              <TextInput
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder="اسم الفئة"
                placeholderTextColor="#a0aec0"
                style={{
                  fontFamily: "System",
                  height: 48,
                  flex: 1,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: "#e2e8f0",
                  backgroundColor: "#ffffff",
                  paddingHorizontal: 16,
                  fontSize: 14,
                  color: "#1a202c",
                  fontWeight: "600",
                  textAlign: "right",
                }}
              />
            </View>
          </View>

          {/* Section: Current Categories Header & Local Search */}
          <View className="px-6 pt-6 pb-4">
            <Text className="text-base font-bold text-gray-800 text-right">الفئات الحالية</Text>
            <Text className="text-xs text-gray-400 text-right mt-1 mb-4">
              يمكنك تعديل أو حذف الفئات
            </Text>

            {/* Local Search Input */}
            <View className="relative justify-center">
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="ابحث عن فئة..."
                placeholderTextColor="#a0aec0"
                style={{
                  fontFamily: "System",
                  height: 48,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: "#e2e8f0",
                  backgroundColor: "#ffffff",
                  paddingRight: 44,
                  paddingLeft: 16,
                  fontSize: 14,
                  color: "#1a202c",
                  fontWeight: "600",
                  textAlign: "right",
                }}
              />
              <Search size={20} color="#a0aec0" style={{ position: "absolute", right: 16 }} />
            </View>
          </View>

          {/* Categories List */}
          {isLoading && !isRefetching ? (
            <View className="pt-2">
              <CategoryListSkeleton count={5} />
            </View>
          ) : error ? (
            <View className="justify-center items-center py-10 px-6">
              <AlertCircle size={48} className="text-red-500 mb-2" />
              <Text className="text-red-500 text-center font-bold text-base mb-2">
                تعذر تحميل بيانات الفئات
              </Text>
              <Text className="text-gray-500 text-center text-xs mb-4">{error.message}</Text>
              <TouchableOpacity
                onPress={() => refetch()}
                className="bg-[#0F4C92] px-6 py-2.5 rounded-full"
              >
                <Text className="text-white font-bold">إعادة المحاولة</Text>
              </TouchableOpacity>
            </View>
          ) : categories.length === 0 ? (
            <View className="justify-center items-center py-10">
              <Tag size={48} color="#cbd5e1" className="mb-2" />
              <Text className="text-gray-500 font-bold text-center">
                {searchQuery.trim() ? "لا توجد فئات مطابقة للبحث" : "لا توجد فئات مسجلة حالياً"}
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {categories.map((cat) => (
                <View
                  key={cat.id}
                  className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-sm border border-gray-50 mx-6"
                >
                  {/* Left Side: Actions */}
                  <View className="flex-row items-center gap-3">
                    {/* Delete Button */}
                    <TouchableOpacity
                      onPress={() => handleDeleteCategory(cat)}
                      disabled={deleteMutation.isPending}
                      className="border border-[#fee2e2] bg-white p-2.5 rounded-2xl"
                      activeOpacity={0.7}
                    >
                      <Trash2 size={18} color="#e53e3e" />
                    </TouchableOpacity>

                    {/* Edit Button */}
                    <TouchableOpacity
                      onPress={() => handleStartEdit(cat)}
                      className="border border-[#dbeafe] bg-white p-2.5 rounded-2xl"
                      activeOpacity={0.7}
                    >
                      <Pencil size={18} color="#0F4C92" />
                    </TouchableOpacity>
                  </View>

                  {/* Right Side: Category Name */}
                  <Text className="font-bold text-gray-900 text-sm text-right flex-1 ml-4">
                    {cat.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
