import type { JSX } from "react";
import { useEffect, useState } from "react";
import { Animated, Dimensions, Image, View, ActivityIndicator } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { Typography } from "heroui-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface CustomSplashScreenProps {
  isReady: boolean;
  onAnimationComplete: () => void;
}

export default function CustomSplashScreen({
  isReady,
  onAnimationComplete,
}: CustomSplashScreenProps): JSX.Element | null {
  const insets = useSafeAreaInsets();
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [scaleAnim] = useState(() => new Animated.Value(0.85));
  const [containerFadeAnim] = useState(() => new Animated.Value(1));
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);

  useEffect(() => {
    // Start entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 850,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 18,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide native splash screen after short delay to avoid flicker
    const timer = setTimeout(async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn("Failed to hide native splash screen:", e);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    if (isReady) {
      // Let the user see the animation and logo for a short moment before exit
      const exitTimer = setTimeout(() => {
        Animated.timing(containerFadeAnim, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }).start(() => {
          setIsAnimationFinished(true);
          onAnimationComplete();
        });
      }, 1500); // 1.5 seconds visible time

      return () => clearTimeout(exitTimer);
    }
  }, [isReady, containerFadeAnim, onAnimationComplete]);

  if (isAnimationFinished) return null;

  return (
    <Animated.View
      className="absolute inset-0 bg-[#0F4C92] justify-center items-center z-[999999]"
      style={[
        {
          opacity: containerFadeAnim,
        },
      ]}
    >
      <View className="absolute inset-0 bg-[#07162c]" />

      <View className="items-center justify-center flex-1 w-full">
        {/* Animated Card Container for the Logo */}
        <Animated.View
          className="bg-white p-5 rounded-[28px] max-w-[340px] justify-center items-center border-[1.5px] border-white/15"
          style={[
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              width: width * 0.85,
              aspectRatio: 1.8,
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.35,
              shadowRadius: 18,
              elevation: 12,
            },
          ]}
        >
          <Image
            source={require("../../assets/images/logo.jpg")}
            className="w-full h-full"
            resizeMode="contain"
          />
        </Animated.View>

        {/* Loading Spinner and Text */}
        <View className="mt-11 items-center">
          <ActivityIndicator
            size="large"
            color="#ffffff"
            className="mb-3.5"
            style={{ transform: [{ scale: 1.25 }] }}
          />
          <Typography.Paragraph className="text-[#cbd5e1] text-base font-semibold text-center">
            جاري تهيئة التطبيق...
          </Typography.Paragraph>
        </View>
      </View>

      {/* Footer Text */}
      <View className="absolute items-center" style={{ bottom: Math.max(insets.bottom, 24) }}>
        <Typography.Paragraph className="text-white text-sm font-bold tracking-wider opacity-90">
          السعر المناسب © ٢٠٢٦
        </Typography.Paragraph>
        <Typography.Paragraph className="text-[#64748b] text-[11px] mt-1 opacity-80">
          جميع الحقوق محفوظة
        </Typography.Paragraph>
      </View>
    </Animated.View>
  );
}
