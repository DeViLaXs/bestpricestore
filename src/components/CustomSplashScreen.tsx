import type { JSX } from "react";
import { useEffect, useState } from "react";
import { Animated, Dimensions, Image, StyleSheet, View, ActivityIndicator } from "react-native";
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
      style={[
        styles.container,
        {
          opacity: containerFadeAnim,
        },
      ]}
    >
      <View style={styles.gradientOverlay} />

      <View style={styles.contentContainer}>
        {/* Animated Card Container for the Logo */}
        <Animated.View
          style={[
            styles.logoCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require("../../assets/images/logo.jpg")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Loading Spinner and Text */}
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ffffff" style={styles.spinner} />
          <Typography.Paragraph style={styles.loadingText}>
            جاري تهيئة التطبيق...
          </Typography.Paragraph>
        </View>
      </View>

      {/* Footer Text */}
      <View style={[styles.footer, { bottom: Math.max(insets.bottom, 24) }]}>
        <Typography.Paragraph style={styles.footerText}>السعر المناسب © ٢٠٢٦</Typography.Paragraph>
        <Typography.Paragraph style={styles.footerSubText}>جميع الحقوق محفوظة</Typography.Paragraph>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#0F4C92", // Primary brand fallback background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999999, // Render on top of everything
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#07162c", // Sleek premium dark navy background
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    width: "100%",
  },
  logoCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 28,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
    width: width * 0.85,
    maxWidth: 340,
    aspectRatio: 1.8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  loaderContainer: {
    marginTop: 45,
    alignItems: "center",
  },
  spinner: {
    transform: [{ scale: 1.25 }],
    marginBottom: 14,
  },
  loadingText: {
    color: "#cbd5e1",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 35,
    alignItems: "center",
  },
  footerText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  footerSubText: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 4,
    opacity: 0.8,
  },
});
