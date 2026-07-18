import type { JSX } from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditProductSkeleton(): JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      className="px-6 pt-6 bg-[#f8fafd]"
      accessibilityLabel="Loading product details form"
    >
      {/* Name Field Skeleton */}
      <View className="mb-5 gap-2 items-end">
        <View className="h-4 w-20 bg-gray-200/80 rounded" />
        <View className="h-12 w-full bg-white border border-gray-150 rounded-2xl" />
      </View>

      {/* Description Field Skeleton */}
      <View className="mb-5 gap-2 items-end">
        <View className="h-4 w-20 bg-gray-200/80 rounded" />
        <View className="h-[120px] w-full bg-white border border-gray-155 rounded-2xl" />
      </View>

      {/* Price Field Skeleton */}
      <View className="mb-5 gap-2 items-end">
        <View className="h-4 w-12 bg-gray-200/80 rounded" />
        <View className="h-12 w-full bg-white border border-gray-150 rounded-2xl" />
      </View>

      {/* Currency Field Skeleton */}
      <View className="mb-5 gap-2 items-end">
        <View className="h-4 w-16 bg-gray-200/80 rounded" />
        <View className="flex-row items-center gap-3 w-full">
          <View className="flex-1 h-12 bg-white border border-gray-150 rounded-2xl" />
          <View className="flex-1 h-12 bg-white border border-gray-150 rounded-2xl" />
        </View>
      </View>

      {/* Category Field Skeleton */}
      <View className="mb-6 gap-2 items-end">
        <View className="h-4 w-12 bg-gray-200/80 rounded" />
        <View className="h-12 w-full bg-white border border-gray-150 rounded-2xl" />
      </View>

      {/* Product Images Section Skeleton */}
      <View className="mb-6 gap-2 items-end">
        <View className="h-4 w-20 bg-gray-200/80 rounded" />
        <View className="h-3 w-48 bg-gray-100 rounded" />

        {/* List of Image Rows */}
        <View className="gap-3.5 mb-4 w-full mt-2">
          {Array.from({ length: 1 }).map((_, idx) => (
            <View
              key={idx}
              className="bg-white rounded-2xl p-3 border border-gray-100 flex-row items-center justify-between shadow-sm"
            >
              {/* Left: Dashed Upload Box / Preview */}
              <View className="w-16 h-16 rounded-xl border border-dashed border-gray-200 bg-gray-50" />

              {/* Center: Quantity adjust block */}
              <View className="items-end gap-1.5 flex-1 mx-4">
                <View className="h-3 w-8 bg-gray-100 rounded" />
                <View className="w-24 h-7 rounded-xl bg-gray-50 border border-gray-200" />
              </View>

              {/* Right: Trash icon */}
              <View className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100" />
            </View>
          ))}
        </View>

        {/* Add another image button */}
        <View className="h-12 w-full bg-white border border-dashed border-gray-200 rounded-2xl" />
      </View>

      {/* Submit Button */}
      <View className="h-13 w-full bg-gray-200 rounded-2xl mt-2" />
    </ScrollView>
  );
}
