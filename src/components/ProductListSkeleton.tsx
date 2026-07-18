import type { JSX } from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ProductListSkeletonProps = {
  count?: number;
  bottomPadding?: number;
};

export default function ProductListSkeleton({
  count = 6,
  bottomPadding = 90,
}: ProductListSkeletonProps): JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: insets.bottom + bottomPadding,
        gap: 10,
      }}
      accessibilityLabel="Loading products"
    >
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className="bg-white rounded-2xl p-3.5 flex-row-reverse justify-between items-stretch border border-gray-100/80"
        >
          {/* Right Side: Product Image & Details (RTL order) */}
          <View className="flex-row-reverse items-center flex-1">
            {/* Product Image */}
            <View className="w-16 h-16 rounded-xl bg-gray-100" />

            {/* Product Text details */}
            <View className="items-end flex-1 pr-3 pl-1 gap-2">
              {/* Name */}
              <View className="h-4 w-3/4 bg-gray-100 rounded" />
              {/* Category */}
              <View className="h-3.5 w-1/3 bg-gray-50 rounded" />
              {/* Price and status badge */}
              <View className="flex-row-reverse items-center gap-1.5 mt-0.5">
                <View className="h-3.5 w-14 bg-gray-100 rounded" />
                <View className="h-4.5 w-10 bg-gray-50 rounded-full" />
              </View>
            </View>
          </View>

          {/* Left Side: Actions */}
          <View className="justify-between items-start pl-0.5">
            <View className="w-8 h-8 rounded-xl bg-gray-50" />
            <View className="h-3 w-16 bg-gray-50 rounded mt-auto" />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
