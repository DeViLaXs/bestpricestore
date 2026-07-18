import type { JSX } from "react";
import { View, ScrollView } from "react-native";

type OrderDetailSkeletonProps = {
  showTimeline?: boolean;
};

export default function OrderDetailSkeleton({
  showTimeline = false,
}: OrderDetailSkeletonProps): JSX.Element {
  return (
    <ScrollView
      className="flex-1 px-6 pt-4"
      showsVerticalScrollIndicator={false}
      accessibilityLabel="Loading order details"
    >
      {/* Status & Date Summary Card Skeleton */}
      <View className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6 items-end gap-3">
        <View className="flex-row-reverse items-center gap-2">
          <View className="h-4 w-20 bg-gray-200/80 rounded" />
          <View className="h-5 w-24 bg-gray-100 rounded-full border border-gray-200" />
        </View>
        <View className="flex-row-reverse items-center gap-2">
          <View className="h-4 w-16 bg-gray-200/80 rounded" />
          <View className="h-4 w-32 bg-gray-100 rounded" />
        </View>
      </View>

      {/* Progress Visual Timeline Tracker (For Admin view) */}
      {showTimeline && (
        <View className="gap-3 mb-6">
          <View className="flex-row-reverse justify-between items-center">
            <View className="h-5 w-28 bg-gray-200/80 rounded" />
          </View>
          <View className="flex-row-reverse items-center justify-between bg-gray-50/50 p-4 border border-gray-100 rounded-2xl">
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} className="flex-1 flex-row-reverse items-center justify-between">
                <View className="items-center flex-1">
                  <View className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200" />
                  <View className="h-3 w-12 bg-gray-100 rounded mt-1.5" />
                </View>
                {index < 3 && <View className="h-0.5 flex-1 bg-gray-200/60 mx-1" />}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Items List Title */}
      <View className="flex-row-reverse justify-between items-center mb-4">
        <View className="h-5 w-28 bg-gray-200/80 rounded" />
      </View>

      {/* Items List */}
      <View className="gap-1 mb-6">
        {Array.from({ length: 2 }).map((_, idx) => (
          <View
            key={idx}
            className="flex-row-reverse items-center justify-between py-3 border-b border-gray-100"
          >
            {/* Image placeholder */}
            <View className="w-16 h-16 bg-gray-100 rounded-xl border border-gray-100" />

            {/* Info details */}
            <View className="flex-1 items-end pr-4 pl-2 gap-2">
              <View className="h-4 w-36 bg-gray-100 rounded" />
              <View className="h-3.5 w-16 bg-gray-100 rounded" />
              <View className="h-3.5 w-24 bg-gray-50 rounded border border-gray-100/50" />
            </View>

            {/* Price details */}
            <View className="items-start gap-1.5">
              <View className="h-4.5 w-14 bg-gray-100 rounded" />
              <View className="h-3 w-16 bg-gray-50 rounded" />
            </View>
          </View>
        ))}
      </View>

      {/* Summary calculations box */}
      <View className="bg-gray-50 rounded-2xl p-4 mt-2 border border-gray-100 gap-3">
        <View className="flex-row-reverse justify-between items-center">
          <View className="h-4.5 w-24 bg-gray-200/80 rounded" />
        </View>
        <View className="flex-row-reverse justify-between items-center">
          <View className="h-4 w-28 bg-gray-100/80 rounded" />
          <View className="h-4 w-20 bg-gray-100/80 rounded" />
        </View>
      </View>
    </ScrollView>
  );
}
