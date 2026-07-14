import type { JSX } from "react";
import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Search, AlertCircle, Trash2, Pencil, Plus, ArrowLeft, Tag } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../hooks/useAuth";
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../hooks/useCategories";
import { Category } from "../../services/category.service";

export default function CategoriesScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Route guard: only allow users with Admin role or credentials
  useEffect(() => {
    const isAdmin =
      user?.role?.toLowerCase() === "admin" ||
      user?.fullName?.toLowerCase() === "admin" ||
      user?.phone === "777777777" ||
      user?.phone === "773124470";

    if (user && !isAdmin) {
      Alert.alert("تنبيه", "عذراً، هذه الصفحة مخصصة للمسؤولين فقط.");
      router.replace("/" as any);
    }
  }, [user]);

  // Form State
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // API Query & Mutations
  const { data: categories = [], isLoading, error, refetch, isRefetching } = useCategoriesQuery();
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();

  // Filter categories list based on local search query (case-insensitive)
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase().trim();
    return categories.filter((cat) => cat.name?.toLowerCase().includes(query));
  }, [categories, searchQuery]);

  // Handle Add / Edit submit
  const handleSaveCategory = async () => {
    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      Alert.alert("تنبيه", "يرجى إدخال اسم الفئة.");
      return;
    }

    try {
      if (editingCategory) {
        // Edit Action
        await updateMutation.mutateAsync({ id: editingCategory.id, name: trimmedName });
        Alert.alert("نجاح", "تم تحديث الفئة بنجاح.");
        setEditingCategory(null);
      } else {
        // Create Action
        await createMutation.mutateAsync(trimmedName);
        Alert.alert("نجاح", "تم إضافة الفئة بنجاح.");
      }
      setCategoryName("");
    } catch (err: any) {
      Alert.alert("خطأ", err.message || "فشلت العملية. يرجى المحاولة مرة أخرى.");
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
    Alert.alert(
      "حذف الفئة",
      `هل أنت متأكد من رغبتك في حذف الفئة "${category.name}"؟\nتنبيه: سيؤدي هذا إلى حذف جميع المنتجات المرتبطة بها.`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(category.id);
              Alert.alert("نجاح", "تم حذف الفئة بنجاح.");
              if (editingCategory?.id === category.id) {
                handleCancelEdit();
              }
            } catch (err: any) {
              Alert.alert("خطأ", err.message || "فشلت عملية حذف الفئة.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const safeTop = insets.top > 0 ? insets.top : 47;

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafd" }}>
      <StatusBar style="light" />

      {/* Blue Header Banner */}
      <View style={{ backgroundColor: "#0F4C92", paddingTop: safeTop, paddingBottom: 44 }}>
        <View className="flex-row items-center justify-between px-6 py-3">
          {/* Back Button on Left */}
          <TouchableOpacity
            onPress={() => router.replace("/admin/representatives")}
            className="p-1"
            activeOpacity={0.7}
          >
            <ArrowLeft size={28} color="#ffffff" />
          </TouchableOpacity>

          {/* Title on Right */}
          <Text style={{ fontFamily: "System" }} className="text-xl font-bold text-white text-right">
            إدارة الفئات
          </Text>
        </View>
      </View>

      {/* Content Container (Rounded White Card overlapping/below) */}
      <View
        style={{
          flex: 1,
          marginTop: -24,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          backgroundColor: "#f8fafd",
          overflow: "hidden",
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={["#0F4C92"]} />
          }
        >
          {/* Add / Edit Category Card */}
          <View className="bg-white rounded-3xl p-5 mx-6 mt-6 shadow-sm border border-gray-50">
            <Text className="text-base font-bold text-gray-800 text-right mb-3">
              {editingCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}
            </Text>

            <TextInput
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="اسم الفئة"
              placeholderTextColor="#a0aec0"
              style={{
                fontFamily: "System",
                height: 48,
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: "#e2e8f0",
                backgroundColor: "#ffffff",
                paddingHorizontal: 16,
                fontSize: 14,
                color: "#1a202c",
                fontWeight: "600",
                textAlign: "right",
                marginBottom: 12,
              }}
            />

            <View className="flex-row items-center justify-between">
              {editingCategory ? (
                <TouchableOpacity
                  onPress={handleCancelEdit}
                  className="bg-gray-100 px-6 py-2.5 rounded-full"
                  activeOpacity={0.7}
                >
                  <Text className="text-gray-600 font-bold text-xs">إلغاء</Text>
                </TouchableOpacity>
              ) : (
                <View />
              )}

              <TouchableOpacity
                onPress={handleSaveCategory}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[#0F4C92] px-6 py-2.5 rounded-full flex-row items-center gap-1.5"
                activeOpacity={0.7}
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text className="text-white font-bold text-xs">
                      {editingCategory ? "حفظ التعديل" : "إضافة الفئة"}
                    </Text>
                    {!editingCategory && <Plus size={16} color="#ffffff" />}
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: Current Categories Header & Local Search */}
          <View className="px-6 pt-6 pb-4">
            <Text className="text-base font-bold text-gray-800 text-right">الفئات الحالية</Text>
            <Text className="text-xs text-gray-400 text-right mt-1 mb-4">يمكنك تعديل أو حذف الفئات</Text>

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
              <Search
                size={20}
                color="#a0aec0"
                style={{ position: "absolute", right: 16 }}
              />
            </View>
          </View>

          {/* Categories List */}
          {isLoading && !isRefetching ? (
            <View className="justify-center items-center py-10">
              <ActivityIndicator size="large" color="#0F4C92" />
              <Text className="text-gray-500 mt-2 font-semibold">جاري تحميل البيانات...</Text>
            </View>
          ) : error ? (
            <View className="justify-center items-center py-10 px-6">
              <AlertCircle size={48} className="text-red-500 mb-2" />
              <Text className="text-red-500 text-center font-bold text-base mb-2">تعذر تحميل بيانات الفئات</Text>
              <Text className="text-gray-500 text-center text-xs mb-4">{error.message}</Text>
              <TouchableOpacity
                onPress={() => refetch()}
                className="bg-[#0F4C92] px-6 py-2.5 rounded-full"
              >
                <Text className="text-white font-bold">إعادة المحاولة</Text>
              </TouchableOpacity>
            </View>
          ) : filteredCategories.length === 0 ? (
            <View className="justify-center items-center py-10">
              <Tag size={48} color="#cbd5e1" className="mb-2" />
              <Text className="text-gray-500 font-bold text-center">لا توجد فئات مطابقة للبحث</Text>
            </View>
          ) : (
            <View className="gap-3">
              {filteredCategories.map((cat) => (
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
