import type { JSX } from "react";
import { View } from "react-native";

type CategoryListSkeletonProps = {
  count?: number;
  marginHorizontal?: number;
};

export default function CategoryListSkeleton({
  count = 5,
  marginHorizontal = 24,
}: CategoryListSkeletonProps): JSX.Element {
  return (
    <View className="gap-3" accessibilityLabel="Loading categories">
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={{ marginHorizontal }}
          className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-sm border border-gray-50"
        >
          {/* Left Side: Actions */}
          <View className="flex-row items-center gap-3">
            {/* Delete button skeleton */}
            <View className="w-9 h-9 rounded-2xl bg-gray-50 border border-gray-100" />
            {/* Edit button skeleton */}
            <View className="w-9 h-9 rounded-2xl bg-gray-50 border border-gray-100" />
          </View>

          {/* Right Side: Category Name */}
          <View className="flex-1 items-end ml-4">
            <View className="h-4.5 w-1/3 bg-gray-150 rounded" />
          </View>
        </View>
      ))}
    </View>
  );
}
