import type { JSX } from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DashboardSkeleton(): JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: insets.bottom + 90,
        paddingHorizontal: 16,
        paddingTop: 16,
      }}
      accessibilityLabel="Loading dashboard"
    >
      {/* Title & Refresh Button Skeleton */}
      <View className="flex-row-reverse justify-between items-center mb-4">
        <View className="h-5 w-28 bg-gray-200/85 rounded" />
        <View className="h-4 w-20 bg-gray-150 rounded" />
      </View>

      {/* Sales Cards Row Skeleton */}
      <View className="flex-row-reverse gap-3 mb-4">
        {/* YER Sales Card */}
        <View className="flex-1 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs items-end gap-2">
          <View className="w-8 h-8 rounded-xl bg-gray-100" />
          <View className="w-2/3 h-3 bg-gray-100 rounded" />
          <View className="w-1/2 h-5 bg-gray-150 rounded mt-1" />
        </View>

        {/* SAR Sales Card */}
        <View className="flex-1 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs items-end gap-2">
          <View className="w-8 h-8 rounded-xl bg-gray-100" />
          <View className="w-2/3 h-3 bg-gray-100 rounded" />
          <View className="w-1/2 h-5 bg-gray-150 rounded mt-1" />
        </View>
      </View>

      {/* Orders Status Grid Title */}
      <View className="flex-row-reverse mb-2">
        <View className="h-4 w-24 bg-gray-200/80 rounded" />
      </View>

      {/* Orders Status Grid Card Skeleton */}
      <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs gap-3 mb-4">
        {/* Total Orders header row */}
        <View className="flex-row-reverse items-center justify-between">
          <View className="flex-row-reverse items-center gap-2">
            <View className="w-7 h-7 rounded-lg bg-gray-100" />
            <View className="h-4 w-24 bg-gray-100 rounded" />
          </View>
          <View className="h-4.5 w-8 bg-gray-150 rounded" />
        </View>

        <View className="h-[1px] bg-gray-50" />

        {/* Grid items */}
        <View className="flex-row-reverse flex-wrap gap-2.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <View
              key={index}
              className="w-[48%] bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 items-end gap-1.5"
            >
              <View className="w-16 h-3 bg-gray-200/80 rounded" />
              <View className="w-8 h-4.5 bg-gray-150 rounded" />
            </View>
          ))}
        </View>
      </View>

      {/* Inventory & Representatives Grid Title */}
      <View className="flex-row-reverse mb-2">
        <View className="h-4 w-32 bg-gray-200/80 rounded" />
      </View>

      {/* Inventory & Representatives Card Skeleton */}
      <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs gap-3">
        {/* Total Products */}
        <View className="flex-row-reverse items-center justify-between">
          <View className="flex-row-reverse items-center gap-2">
            <View className="w-7 h-7 rounded-lg bg-gray-100" />
            <View className="h-4 w-36 bg-gray-100 rounded" />
          </View>
          <View className="h-4 w-8 bg-gray-150 rounded" />
        </View>

        <View className="h-[1px] bg-gray-50" />

        {/* Out of Stock */}
        <View className="flex-row-reverse items-center justify-between">
          <View className="flex-row-reverse items-center gap-2">
            <View className="w-7 h-7 rounded-lg bg-gray-100" />
            <View className="h-4 w-28 bg-gray-100 rounded" />
          </View>
          <View className="h-4 w-8 bg-gray-150 rounded" />
        </View>

        <View className="h-[1px] bg-gray-50" />

        {/* Total Representatives */}
        <View className="flex-row-reverse items-center justify-between">
          <View className="flex-row-reverse items-center gap-2">
            <View className="w-7 h-7 rounded-lg bg-gray-100" />
            <View className="h-4 w-24 bg-gray-100 rounded" />
          </View>
          <View className="h-4 w-16 bg-gray-150 rounded" />
        </View>
      </View>
    </ScrollView>
  );
}
