import type { JSX } from "react";
import { View } from "react-native";
import { Typography } from "heroui-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CartScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="flex-1 bg-white items-center justify-center"
    >
      <Typography.Heading type="h2" className="text-xl font-bold text-gray-800">
        سلة المشتريات
      </Typography.Heading>
    </View>
  );
}
