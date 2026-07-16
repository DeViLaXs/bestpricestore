import type { JSX } from "react";
import { useState, useEffect } from "react";
import { View, ScrollView, Alert, Animated, Image, Linking } from "react-native";
import { router } from "expo-router";
import { Button, Typography } from "heroui-native";
import {
  Clock,
  Check,
  Ellipsis,
  Lock,
  Loader2,
  RefreshCw,
  MessageSquare,
  LogOut,
} from "lucide-react-native";
import { withUniwind } from "uniwind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../hooks/useAuth";

const StyledClock = withUniwind(Clock);
const StyledCheck = withUniwind(Check);
const StyledEllipsis = withUniwind(Ellipsis);
const StyledLock = withUniwind(Lock);
const StyledLoader2 = withUniwind(Loader2);
const StyledRefreshCw = withUniwind(RefreshCw);
const StyledMessageSquare = withUniwind(MessageSquare);
const StyledLogOut = withUniwind(LogOut);

export default function PendingScreen(): JSX.Element {
  const { user, isAdmin, logoutMutation, meMutation } = useAuth();
  const insets = useSafeAreaInsets();
  const [isChecking, setIsChecking] = useState(false);
  const [pulseAnim] = useState(() => new Animated.Value(1));

  // Route guard: redirect active users or admins
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        router.replace("/admin/representatives");
      } else if (user.isActive) {
        router.replace("/" as any);
      }
    }
  }, [user, isAdmin]);

  // Pulse animation for the status icon
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  /**
   * Checks the account approval status from the backend.
   */
  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      const updatedUser = await meMutation.mutateAsync();
      setIsChecking(false);

      if (updatedUser.isActive) {
        Alert.alert("تم تفعيل الحساب", "تهانينا! لقد تم الموافقة على حسابك وتفعيله بنجاح.", [
          {
            text: "دخول للمتجر",
            onPress: () => {
              router.replace("/" as any);
            },
          },
        ]);
      } else {
        Alert.alert(
          "حالة الحساب",
          "حسابك لا يزال قيد المراجعة والتدقيق من قبل فريق الإدارة. سنقوم بتحديث حالتك بمجرد الموافقة.",
          [{ text: "حسناً" }]
        );
      }
    } catch {
      setIsChecking(false);
      Alert.alert(
        "خطأ في الاتصال",
        "تعذر التحقق من حالة الحساب حالياً. يرجى التأكد من اتصالك بالإنترنت والمحاولة مرة أخرى."
      );
    }
  };

  /**
   * Handles Logging out
   */
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
              console.log("Logout failed:", err);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Handles Support Contact via WhatsApp with the admin
   */
  const handleContactSupport = async () => {
    // const phoneNumber = "+967773124470";
    const phoneNumber = "+967738995845";
    const userStoreName = user?.fullName || "غير محدد";
    const userPhone = user?.phone || "غير محدد";
    const message = `السلام عليكم، لقد قمت بالتسجيل في تطبيق السعر المناسب وأرغب في تفعيل حسابي.\nاسم المتجر: ${userStoreName}\nرقم الجوال: ${userPhone}`;
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    const webUrl = `https://wa.me/${phoneNumber.replace("+", "")}?text=${encodeURIComponent(message)}`;

    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch {
      Alert.alert(
        "خطأ في الاتصال",
        `عذراً، لم نتمكن من فتح تطبيق واتساب. يمكنك إرسال رسالة يدوية إلى الرقم:\n${phoneNumber}`
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 20,
          paddingBottom: Math.max(insets.bottom, 24),
          justifyContent: "space-between",
        }}
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        {/* Top Header Card */}
        <View className="items-center mt-4">
          <View className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 items-center justify-center w-full max-w-[340px] aspect-[2.2] overflow-hidden">
            <Image
              source={require("../../assets/images/logo.jpg")}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Main Status Information Card */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 items-center my-6 relative overflow-hidden">
          {/* Soft yellow/amber background highlight */}
          <View className="absolute right-0 top-0 w-24 h-24 bg-amber-50/60 rounded-full -mr-6 -mt-6" />

          {/* Pulsing Icon */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }} className="mb-6 mt-4">
            <View className="w-20 h-20 bg-amber-50 rounded-full items-center justify-center border border-amber-100 shadow-inner">
              <StyledClock size={40} className="text-amber-500" />
            </View>
          </Animated.View>

          {/* User Welcoming */}
          <Typography.Paragraph className="text-gray-400 text-xs font-bold mb-1">
            مرحباً، {user?.fullName || "شريكنا العزيز"}
          </Typography.Paragraph>

          {/* Heading */}
          <Typography.Heading
            type="h2"
            className="text-2xl font-extrabold text-gray-900 text-center mb-3"
          >
            الحساب قيد المراجعة
          </Typography.Heading>

          {/* Detailed Message */}
          <Typography.Paragraph className="text-gray-500 text-sm text-center leading-6 px-2 mb-6">
            شكراً لتسجيلك معنا. حسابك حالياً بانتظار موافقة الإدارة وتفعيل متجرك. نقوم بمراجعة كافة
            الطلبات والتحقق من صحة البيانات لضمان تقديم أفضل تجربة.
          </Typography.Paragraph>

          {/* Status Step Indicator (Visual touch) */}
          <View className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-100 gap-3">
            <View className="flex-row-reverse items-center justify-between">
              <View className="flex-row-reverse items-center gap-2.5">
                <View className="w-6 h-6 bg-emerald-500 rounded-full items-center justify-center">
                  <StyledCheck size={14} className="text-white" />
                </View>
                <Typography.Paragraph className="text-gray-800 text-sm font-bold">
                  إنشاء الحساب بنجاح
                </Typography.Paragraph>
              </View>
              <Typography.Paragraph className="text-gray-400 text-xs font-semibold">
                اكتمل
              </Typography.Paragraph>
            </View>

            <View className="w-[1.5px] h-4 bg-emerald-300 mr-3" />

            <View className="flex-row-reverse items-center justify-between">
              <View className="flex-row-reverse items-center gap-2.5">
                <View className="w-6 h-6 bg-amber-500 rounded-full items-center justify-center">
                  <StyledEllipsis size={14} className="text-white" />
                </View>
                <Typography.Paragraph className="text-gray-800 text-sm font-bold">
                  مراجعة وتفعيل الحساب
                </Typography.Paragraph>
              </View>
              <Typography.Paragraph className="text-amber-500 text-xs font-bold">
                قيد المعالجة
              </Typography.Paragraph>
            </View>

            <View className="w-[1.5px] h-4 bg-gray-200 mr-3" />

            <View className="flex-row-reverse items-center justify-between">
              <View className="flex-row-reverse items-center gap-2.5">
                <View className="w-6 h-6 bg-gray-200 rounded-full items-center justify-center">
                  <StyledLock size={12} className="text-gray-400" />
                </View>
                <Typography.Paragraph className="text-gray-400 text-sm font-semibold">
                  بدء استخدام المتجر
                </Typography.Paragraph>
              </View>
              <Typography.Paragraph className="text-gray-400 text-xs font-semibold">
                معلق
              </Typography.Paragraph>
            </View>
          </View>
        </View>

        {/* Action Buttons Section */}
        <View className="gap-3 w-full">
          {/* Refresh Status Button */}
          <Button
            onPress={handleCheckStatus}
            className="w-full bg-[#0F4C92] rounded-full py-3 flex-row justify-center items-center"
            isDisabled={isChecking}
          >
            {isChecking ? (
              <View className="flex-row items-center gap-2">
                <StyledLoader2 size={18} className="text-white animate-spin" />
                <Typography.Paragraph className="text-white font-bold text-sm">
                  جاري التحقق...
                </Typography.Paragraph>
              </View>
            ) : (
              <View className="flex-row items-center gap-2">
                <StyledRefreshCw size={18} className="text-white" />
                <Typography.Paragraph className="text-white font-bold text-sm">
                  تحديث الحالة
                </Typography.Paragraph>
              </View>
            )}
          </Button>

          {/* Contact Support Button */}
          <Button
            onPress={handleContactSupport}
            variant="secondary"
            className="w-full bg-white rounded-full py-3 border border-gray-200 flex-row justify-center items-center"
          >
            <View className="flex-row items-center gap-2">
              <StyledMessageSquare size={18} className="text-gray-700" />
              <Typography.Paragraph className="text-gray-700 font-bold text-sm">
                تواصل مع الدعم الفني
              </Typography.Paragraph>
            </View>
          </Button>

          {/* Logout Button */}
          <Button
            onPress={handleLogout}
            variant="danger-soft"
            className="w-full rounded-full py-3 flex-row justify-center items-center mt-2"
          >
            <View className="flex-row items-center gap-2">
              <StyledLogOut size={18} className="text-danger" />
              <Typography.Paragraph className="text-danger font-bold text-sm">
                تسجيل الخروج
              </Typography.Paragraph>
            </View>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
