import type { JSX } from "react";
import { View } from "react-native";

type OrderListSkeletonProps = {
  count?: number;
  bottomPadding?: number;
};

export default function OrderListSkeleton({
  count = 5,
  bottomPadding = 96,
}: OrderListSkeletonProps): JSX.Element {
  return (
    <View
      className="px-4 pt-3"
      style={{ paddingBottom: bottomPadding }}
      accessibilityLabel="Loading orders"
    >
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm flex-row-reverse items-center justify-between"
        >
          <View className="flex-1 items-end pl-2">
            <View className="flex-row-reverse items-center gap-2 mb-2">
              <View className="h-4 w-16 rounded-full bg-gray-200/80" />
              <View className="h-5 w-24 rounded-full bg-gray-100 border border-gray-100" />
            </View>

            <View className="h-3 w-36 rounded-full bg-gray-100 mb-2" />
            <View className="h-3 w-28 rounded-full bg-gray-100 mb-3" />

            <View className="flex-row-reverse items-center gap-3">
              <View className="h-6 w-24 rounded-md bg-blue-50 border border-blue-100/50" />
              <View className="h-6 w-24 rounded-md bg-emerald-50 border border-emerald-100/50" />
            </View>
          </View>

          <View className="h-5 w-5 rounded-full bg-gray-100" />
        </View>
      ))}
    </View>
  );
}
