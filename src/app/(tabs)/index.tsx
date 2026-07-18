import type { JSX } from "react";
import { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image } from "react-native";
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
    <Rect x="3" y="6" width="18" height="13" rx="2" stroke="#0F4C92" strokeWidth={2} />
    <Line x1="3" y1="10" x2="21" y2="10" stroke="#0F4C92" strokeWidth={2} />
    <Line x1="3" y1="13" x2="21" y2="13" stroke="#0F4C92" strokeWidth={2} />
    <Line x1="3" y1="16" x2="21" y2="16" stroke="#0F4C92" strokeWidth={2} />
    {/* Folding corner at the top left */}
    <Path
      d="M3 6L9 12V6H3Z"
      fill="#edf3fa"
      stroke="#0F4C92"
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
      stroke="#0F4C92"
      strokeWidth={2}
      strokeLinejoin="round"
    />
    {/* Inner decorative contour line */}
    <Path
      d="M5 8C8 9.2 16 9.2 19 8C17.8 11 17.8 13 19 16C16 14.8 8 14.8 5 16C6.2 13 6.2 11 5 8Z"
      stroke="#0F4C92"
      strokeWidth={1}
      strokeLinejoin="round"
      opacity={0.65}
    />
  </Svg>
);

const MattressIcon = (): JSX.Element => (
  <Svg width={42} height={42} viewBox="0 0 24 24" fill="none">
    {/* Main mattress frame */}
    <Rect x="2" y="6" width="20" height="12" rx="3" stroke="#0F4C92" strokeWidth={2} />
    {/* Internal quilted frame */}
    <Rect
      x="4"
      y="8"
      width="16"
      height="8"
      rx="1.5"
      stroke="#0F4C92"
      strokeWidth={1.5}
      strokeDasharray="2 2"
    />
    {/* Quilted details / circles */}
    <Circle cx="8" cy="12" r="1" fill="#0F4C92" />
    <Circle cx="12" cy="12" r="1" fill="#0F4C92" />
    <Circle cx="16" cy="12" r="1" fill="#0F4C92" />
  </Svg>
);

export default function HomeScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const safeTop = insets.top > 0 ? insets.top : 47;

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Clean White Header Banner */}
      <View className="bg-white border-b border-gray-100/50" style={{ paddingTop: safeTop }}>
        <View className="flex-row-reverse items-center justify-between px-6 py-2.5">
          <Text className="text-lg font-bold text-gray-900 text-right">الشاشة الرئيسية</Text>
          {/* Notification bell on left */}
          <TouchableOpacity className="relative p-1" activeOpacity={0.7}>
            <Bell size={22} color="#0F4C92" />
            <View
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                backgroundColor: "#e53e3e",
                width: 14,
                height: 14,
                borderRadius: 7,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1.5,
                borderColor: "#ffffff",
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
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: insets.bottom + 90, // Ensure space for the custom tab bar
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-[#f8fafd]"
      >
        {/* Search and Filter Row */}
        <View className="flex-row items-center gap-3.5 mb-6 mt-2">
          {/* Filter Circular Button (Left) */}
          <TouchableOpacity
            className="w-10 h-10 rounded-xl bg-[#0F4C92] items-center justify-center shadow-sm active:opacity-85"
            activeOpacity={0.85}
          >
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
              className="h-10 rounded-xl border-[1.5px] border-gray-200 bg-white pr-10 pl-4 text-xs text-gray-800 font-semibold text-right"
            />
            <Search size={18} color="#a0aec0" style={{ position: "absolute", right: 12 }} />
          </View>
        </View>

        {/* Special Offers Section */}
        <View className="mb-6">
          {/* Section Title */}
          <Text
            className="text-right text-base font-bold text-gray-900 mb-3"
          >
            عروض خاصة
          </Text>

          {/* Carousel Scroll Container */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -20 }}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {/* Card 1: Bed Offer */}
            <View
              style={{ width: 160, height: 160, borderRadius: 20 }}
              className="overflow-hidden bg-white shadow-sm border border-gray-100 relative"
            >
              <Image
                source={require("../../../assets/images/bed_offer.png")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              {/* Red Label Top Left */}
              <View className="absolute left-2.5 top-2.5 bg-[#e53e3e] rounded-lg px-2 py-0.5 shadow-sm">
                <Text
                  className="text-white text-[9px] font-extrabold text-center"
                >
                  عرض خاص
                </Text>
              </View>
            </View>

            {/* Card 2: Armchair Offer */}
            <View
              style={{ width: 160, height: 160, borderRadius: 20 }}
              className="overflow-hidden bg-white shadow-sm border border-gray-100 relative"
            >
              <Image
                source={require("../../../assets/images/chair_offer.png")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              {/* Black/Gray Label Top Right */}
              <View className="absolute right-2.5 top-2.5 bg-black/60 rounded-lg px-2.5 py-0.5 shadow-sm">
                <Text
                  className="text-white text-[9px] font-bold text-center"
                >
                  Kocoe
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Pagination Indicators */}
          <View className="flex-row justify-center items-center gap-1.5 mt-3">
            <View className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <View className="w-2 h-2 rounded-full bg-[#0F4C92]" />
            <View className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <View className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          </View>
        </View>

        {/* Products Section */}
        <View className="mb-6">
          {/* Header Row */}
          <View className="flex-row justify-between items-center mb-3">
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-[#0F4C92] font-extrabold text-xs">
                جديدنا
              </Text>
            </TouchableOpacity>

            <Text className="text-base font-bold text-gray-900">
              المنتجات
            </Text>
          </View>

          {/* Categories Grid (Row of 3 cards) */}
          <View className="flex-row justify-between gap-3">
            {/* Card 1: ألحفة */}
            <View className="flex-1 bg-[#edf3fa]/85 aspect-square rounded-2xl items-center justify-center p-2.5 shadow-sm border border-[#e2ecf7]">
              <DuvetIcon />
              <Text
                className="text-[#0F4C92] font-bold text-xs mt-2 text-center"
              >
                ألحفة
              </Text>
            </View>

            {/* Card 2: وسائد */}
            <View className="flex-1 bg-[#edf3fa]/85 aspect-square rounded-2xl items-center justify-center p-2.5 shadow-sm border border-[#e2ecf7]">
              <PillowIcon />
              <Text
                className="text-[#0F4C92] font-bold text-xs mt-2 text-center"
              >
                وسائد
              </Text>
            </View>

            {/* Card 3: فراش */}
            <View className="flex-1 bg-[#edf3fa]/85 aspect-square rounded-2xl items-center justify-center p-2.5 shadow-sm border border-[#e2ecf7]">
              <MattressIcon />
              <Text
                className="text-[#0F4C92] font-bold text-xs mt-2 text-center"
              >
                فراش
              </Text>
            </View>
          </View>

          {/* Partially Clipped Next Row to match the mockup exactly */}
          <View
            className="flex-row justify-between gap-3 mt-3.5 overflow-hidden"
            style={{ height: 24 }}
          >
            <View className="flex-1 bg-[#edf3fa]/80 rounded-t-2xl border-t border-l border-r border-[#e2ecf7]" />
            <View className="flex-1 bg-[#edf3fa]/80 rounded-t-2xl border-t border-l border-r border-[#e2ecf7]" />
            <View className="flex-1 bg-[#edf3fa]/80 rounded-t-2xl border-t border-l border-r border-[#e2ecf7]" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
