import type { JSX } from "react";
import { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import { Bell, Search } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Rect, Path, Circle, Line } from "react-native-svg";
import { useAuth } from "../../hooks/useAuth";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

// SVG Category Icons matching the mockup designs
const DuvetIcon = (): JSX.Element => (
  <Svg width={42} height={42} viewBox="0 0 24 24" fill="none">
    {/* Folder/Blanket folded body */}
    <Rect x="3" y="6" width="18" height="13" rx="2" stroke="#0c3f7c" strokeWidth={2} />
    <Line x1="3" y1="10" x2="21" y2="10" stroke="#0c3f7c" strokeWidth={2} />
    <Line x1="3" y1="13" x2="21" y2="13" stroke="#0c3f7c" strokeWidth={2} />
    <Line x1="3" y1="16" x2="21" y2="16" stroke="#0c3f7c" strokeWidth={2} />
    {/* Folding corner at the top left */}
    <Path
      d="M3 6L9 12V6H3Z"
      fill="#f0f5fc"
      stroke="#0c3f7c"
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  </Svg>
);

const PillowIcon = (): JSX.Element => (
  <Svg width={42} height={42} viewBox="0 0 24 24" fill="none">
    {/* Outer pillow contour */}
    <Path
      d="M3 6C7 7.5 17 7.5 21 6C19.5 10 19.5 14 21 18C17 16.5 7 16.5 3 18C4.5 14 4.5 10 3 6Z"
      stroke="#0c3f7c"
      strokeWidth={2}
      strokeLinejoin="round"
    />
    {/* Inner decorative contour line */}
    <Path
      d="M5 8C8 9.2 16 9.2 19 8C17.8 11 17.8 13 19 16C16 14.8 8 14.8 5 16C6.2 13 6.2 11 5 8Z"
      stroke="#0c3f7c"
      strokeWidth={1}
      strokeLinejoin="round"
      opacity={0.65}
    />
  </Svg>
);

const MattressIcon = (): JSX.Element => (
  <Svg width={42} height={42} viewBox="0 0 24 24" fill="none">
    {/* Main mattress frame */}
    <Rect x="2" y="6" width="20" height="12" rx="3" stroke="#0c3f7c" strokeWidth={2} />
    {/* Internal quilted frame */}
    <Rect
      x="4"
      y="8"
      width="16"
      height="8"
      rx="1.5"
      stroke="#0c3f7c"
      strokeWidth={1.5}
      strokeDasharray="2 2"
    />
    {/* Quilted details / circles */}
    <Circle cx="8" cy="12" r="1" fill="#0c3f7c" />
    <Circle cx="12" cy="12" r="1" fill="#0c3f7c" />
    <Circle cx="16" cy="12" r="1" fill="#0c3f7c" />
  </Svg>
);

export default function HomeScreen(): JSX.Element {
  const { logoutMutation } = useAuth();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const safeTop = insets.top > 0 ? insets.top : 47;

  const handleLogout = async () => {
    Alert.alert(
      "تسجيل الخروج",
      "هل أنت متأكد من رغبتك في تسجيل الخروج؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "خروج",
          style: "destructive",
          onPress: async () => {
            try {
              await logoutMutation.mutateAsync();
              router.replace("/login");
            } catch (err) {
              console.error("Logout failed:", err);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="flex-1 bg-[#f8fafd]">
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: safeTop + 16,
          paddingBottom: 110, // Ensure space for the custom tab bar
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="flex-row items-center justify-between mb-6">
          {/* Notification Bells Group (Left) */}
          <View className="flex-row items-center gap-2">
            {/* Plain notification bell - Triggers Logout for Utility */}
            <TouchableOpacity onPress={handleLogout} className="p-1" activeOpacity={0.7}>
              <Bell size={24} color="#0c3f7c" />
            </TouchableOpacity>

            {/* Badged notification bell */}
            <TouchableOpacity className="relative p-1" activeOpacity={0.7}>
              <Bell size={24} color="#0c3f7c" />
              <View
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  backgroundColor: "#e53e3e",
                  width: 15,
                  height: 15,
                  borderRadius: 7.5,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1.5,
                  borderColor: "#f8fafd",
                }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 8,
                    fontWeight: "900",
                    lineHeight: 10,
                  }}
                >
                  1
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Titles Group (Right) */}
          <View className="items-end flex-1 pl-4">
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{ fontFamily: "System" }}
              className="text-[26px] font-black text-[#0c3f7c] tracking-tight text-right w-full"
            >
              الشاشة الرئيسية
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{ fontFamily: "System" }}
              className="text-xs font-semibold text-gray-500 mt-1 text-right w-full"
            >
              كل ما تحتاجه لخدمتك هو هنا
            </Text>
          </View>
        </View>

        {/* Search and Filter Row */}
        <View className="flex-row items-center gap-3.5 mb-8">
          {/* Filter Circular Button (Left) */}
          <TouchableOpacity
            className="w-12 h-12 rounded-full bg-[#0c3f7c] items-center justify-center shadow-md active:opacity-85"
            activeOpacity={0.85}
          >
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M4 6H20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <Path d="M6 12H18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <Path d="M9 18H15" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>

          {/* Search Input Box (Right) */}
          <View className="flex-1 relative justify-center">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="ابحث عن منتج..."
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

        {/* Special Offers Section */}
        <View className="mb-8">
          {/* Section Title */}
          <Text
            style={{ fontFamily: "System" }}
            className="text-right text-xl font-bold text-gray-800 mb-4"
          >
            عروض خاصة
          </Text>

          {/* Carousel Scroll Container */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -20 }}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
          >
            {/* Card 1: Bed Offer */}
            <View
              style={{ width: 175, height: 175, borderRadius: 24 }}
              className="overflow-hidden bg-white shadow-sm border border-gray-100 relative"
            >
              <Image
                source={require("../../../assets/images/bed_offer.png")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              {/* Red Label Top Left */}
              <View className="absolute left-3 top-3 bg-[#e53e3e] rounded-xl px-2.5 py-1 shadow-sm">
                <Text
                  style={{ fontFamily: "System" }}
                  className="text-white text-[10px] font-extrabold text-center"
                >
                  عرض خاص
                </Text>
              </View>
            </View>

            {/* Card 2: Armchair Offer */}
            <View
              style={{ width: 175, height: 175, borderRadius: 24 }}
              className="overflow-hidden bg-white shadow-sm border border-gray-100 relative"
            >
              <Image
                source={require("../../../assets/images/chair_offer.png")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              {/* Black/Gray Label Top Right */}
              <View className="absolute right-3 top-3 bg-black/60 rounded-xl px-3 py-1 shadow-sm">
                <Text
                  style={{ fontFamily: "System" }}
                  className="text-white text-[10px] font-bold text-center"
                >
                  Kocoe
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Pagination Indicators */}
          <View className="flex-row justify-center items-center gap-2 mt-4">
            <View className="w-2 h-2 rounded-full bg-gray-300" />
            <View className="w-2.5 h-2.5 rounded-full bg-[#0c3f7c]" />
            <View className="w-2 h-2 rounded-full bg-gray-300" />
            <View className="w-2 h-2 rounded-full bg-gray-300" />
          </View>
        </View>

        {/* Products Section */}
        <View className="mb-6">
          {/* Header Row */}
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={{ fontFamily: "System" }} className="text-[#0c3f7c] font-black text-sm">
                جديدنا
              </Text>
            </TouchableOpacity>

            <Text style={{ fontFamily: "System" }} className="text-xl font-bold text-gray-800">
              المنتجات
            </Text>
          </View>

          {/* Categories Grid (Row of 3 cards) */}
          <View className="flex-row justify-between gap-3">
            {/* Card 1: ألحفة */}
            <View className="flex-1 bg-[#edf3fa]/85 aspect-square rounded-3xl items-center justify-center p-3 shadow-sm border border-[#e2ecf7]">
              <DuvetIcon />
              <Text
                style={{ fontFamily: "System" }}
                className="text-[#0c3f7c] font-bold text-sm mt-3 text-center"
              >
                ألحفة
              </Text>
            </View>

            {/* Card 2: وسائد */}
            <View className="flex-1 bg-[#edf3fa]/85 aspect-square rounded-3xl items-center justify-center p-3 shadow-sm border border-[#e2ecf7]">
              <PillowIcon />
              <Text
                style={{ fontFamily: "System" }}
                className="text-[#0c3f7c] font-bold text-sm mt-3 text-center"
              >
                وسائد
              </Text>
            </View>

            {/* Card 3: فراش */}
            <View className="flex-1 bg-[#edf3fa]/85 aspect-square rounded-3xl items-center justify-center p-3 shadow-sm border border-[#e2ecf7]">
              <MattressIcon />
              <Text
                style={{ fontFamily: "System" }}
                className="text-[#0c3f7c] font-bold text-sm mt-3 text-center"
              >
                فراش
              </Text>
            </View>
          </View>

          {/* Partially Clipped Next Row to match the mockup exactly */}
          <View
            className="flex-row justify-between gap-3 mt-4 overflow-hidden"
            style={{ height: 35 }}
          >
            <View className="flex-1 bg-[#edf3fa]/80 rounded-t-3xl border-t border-l border-r border-[#e2ecf7]" />
            <View className="flex-1 bg-[#edf3fa]/80 rounded-t-3xl border-t border-l border-r border-[#e2ecf7]" />
            <View className="flex-1 bg-[#edf3fa]/80 rounded-t-3xl border-t border-l border-r border-[#e2ecf7]" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
