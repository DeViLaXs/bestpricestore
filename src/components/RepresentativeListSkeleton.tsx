import type { JSX } from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type RepresentativeListSkeletonProps = {
  count?: number;
};

export default function RepresentativeListSkeleton({
  count = 5,
}: RepresentativeListSkeletonProps): JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: insets.bottom + 40,
        gap: 10,
      }}
      showsVerticalScrollIndicator={false}
      accessibilityLabel="Loading representatives"
    >
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className="bg-white rounded-2xl p-3.5 flex-row items-center justify-between shadow-sm border border-gray-100/80"
        >
          {/* Left Side Action Button placeholder */}
          <View className="w-24 h-7 rounded-full bg-gray-100 border border-gray-200" />

          {/* Right Side Info & Avatar */}
          <View className="flex-row items-center gap-3 flex-1 justify-end">
            {/* Details */}
            <View className="items-end gap-1.5">
              <View className="h-4 w-28 bg-gray-150 rounded" />
              <View className="flex-row-reverse items-center gap-1.5 mt-0.5">
                <View className="h-3 w-8 bg-gray-100 rounded" />
                <View className="h-3 w-10 bg-gray-100 rounded" />
              </View>
            </View>

            {/* Avatar placeholder */}
            <View className="w-10 h-10 rounded-full bg-gray-100 border border-gray-100" />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
