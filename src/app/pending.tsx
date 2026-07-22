import type { JSX } from "react";
import { useState, useEffect } from "react";
import { View, ScrollView, Animated, Image, Linking } from "react-native";
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
import { useAlert } from "../contexts/AlertContext";

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
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const [isChecking, setIsChecking] = useState(false);
  const [pulseAnim] = useState(() => new Animated.Value(1));

  // Route guard: redirect active users or admins
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        router.replace("/admin/dashboard");
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
        showAlert("تم تفعيل الحساب", "تهانينا! لقد تم الموافقة على حسابك وتفعيله بنجاح.", [
          {
            text: "دخول للمتجر",
            onPress: () => {
              router.replace("/" as any);
            },
          },
        ]);
      } else {
        showAlert(
          "حالة الحساب",
          "حسابك لا يزال قيد المراجعة والتدقيق من قبل فريق الإدارة. سنقوم بتحديث حالتك بمجرد الموافقة.",
          [{ text: "حسناً" }]
        );
      }
    } catch {
      setIsChecking(false);
      showAlert(
        "خطأ في الاتصال",
        "تعذر التحقق من حالة الحساب حالياً. يرجى التأكد من اتصالك بالإنترنت والمحاولة مرة أخرى."
      );
    }
  };

  /**
   * Handles Logging out
   */
  const handleLogout = async () => {
    showAlert(
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
      ]
    );
  };

  /**
   * Handles Support Contact via WhatsApp with the admin
   */
  const handleContactSupport = async () => {
    const phoneNumber = "+967733483739";
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
      showAlert(
        "خطأ في الاتصال",
        `عذراً، لم نتمكن من فتح تطبيق واتساب. يمكنك إرسال رسالة يدوية إلى الرقم:\n${phoneNumber}`
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 16,
          paddingBottom: Math.max(insets.bottom, 20),
          paddingHorizontal: 20,
          justifyContent: "space-between",
        }}
      >
        {/* Header Row: Logo & Logout */}
        <View className="flex-row-reverse items-center justify-between w-full pb-2 border-b border-gray-100">
          <View className="flex-row items-center">
            <Image
              source={require("../../assets/images/logo.jpg")}
              className="h-10 w-28"
              resizeMode="contain"
            />
          </View>
          <Button
            onPress={handleLogout}
            className="flex-row items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-full min-w-0"
          >
            <StyledLogOut size={16} className="text-red-500" />
            <Typography.Paragraph className="text-red-500 font-bold text-xs">
              خروج
            </Typography.Paragraph>
          </Button>
        </View>

        {/* Main Status Card */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 items-center my-4 flex-1 justify-center relative overflow-hidden max-h-[420px]">
          {/* Soft yellow/amber background highlight */}
          <View className="absolute right-0 top-0 w-24 h-24 bg-amber-50/40 rounded-full -mr-6 -mt-6" />

          {/* Pulsing Icon */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }} className="mb-4">
            <View className="w-16 h-16 bg-amber-50 rounded-full items-center justify-center border border-amber-100 shadow-inner">
              <StyledClock size={32} className="text-amber-500" />
            </View>
          </Animated.View>

          {/* User Welcoming */}
          <Typography.Paragraph className="text-gray-400 text-xs font-bold mb-1">
            مرحباً، {user?.fullName || "شريكنا العزيز"}
          </Typography.Paragraph>

          {/* Heading */}
          <Typography.Heading
            type="h2"
            className="text-xl font-extrabold text-gray-900 text-center mb-2"
          >
            الحساب قيد المراجعة
          </Typography.Heading>

          {/* Detailed Message */}
          <Typography.Paragraph className="text-gray-500 text-xs text-center leading-5 px-3 mb-6">
            شكراً لتسجيلك معنا. حسابك حالياً بانتظار موافقة الإدارة وتفعيل متجرك. نقوم بمراجعة كافة
            الطلبات والتحقق من صحة البيانات لضمان تقديم أفضل تجربة.
          </Typography.Paragraph>

          {/* Horizontal Status Step Indicator */}
          <View className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <View className="flex-row-reverse items-center justify-between px-1">
              {/* Step 1: Created */}
              <View className="items-center flex-1">
                <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center mb-1.5 shadow-sm">
                  <StyledCheck size={16} className="text-white" />
                </View>
                <Typography.Paragraph className="text-gray-800 text-[10px] font-bold text-center">
                  إنشاء الحساب
                </Typography.Paragraph>
                <Typography.Paragraph className="text-emerald-600 text-[9px] font-semibold mt-0.5">
                  اكتمل
                </Typography.Paragraph>
              </View>

              {/* Connector 1 */}
              <View className="h-[2px] bg-emerald-500 flex-1 -mt-5 mx-1" />

              {/* Step 2: Under Review */}
              <View className="items-center flex-1">
                <View className="w-8 h-8 bg-amber-500 rounded-full items-center justify-center mb-1.5 shadow-sm">
                  <StyledEllipsis size={16} className="text-white" />
                </View>
                <Typography.Paragraph className="text-gray-800 text-[10px] font-bold text-center">
                  مراجعة وتفعيل
                </Typography.Paragraph>
                <Typography.Paragraph className="text-amber-600 text-[9px] font-bold mt-0.5 animate-pulse">
                  قيد المعالجة
                </Typography.Paragraph>
              </View>

              {/* Connector 2 */}
              <View className="h-[2px] bg-gray-200 flex-1 -mt-5 mx-1" />

              {/* Step 3: Start */}
              <View className="items-center flex-1">
                <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mb-1.5">
                  <StyledLock size={14} className="text-gray-400" />
                </View>
                <Typography.Paragraph className="text-gray-400 text-[10px] font-semibold text-center">
                  بدء استخدام
                </Typography.Paragraph>
                <Typography.Paragraph className="text-gray-400 text-[9px] font-semibold mt-0.5">
                  معلق
                </Typography.Paragraph>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons Section */}
        <View className="gap-2.5 w-full">
          {/* Refresh Status Button */}
          <Button
            onPress={handleCheckStatus}
            className="w-full bg-[#0F4C92] rounded-full py-3 flex-row justify-center items-center shadow-sm"
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
            className="w-full bg-emerald-50 rounded-full py-3 border border-emerald-100 flex-row justify-center items-center"
          >
            <View className="flex-row items-center gap-2">
              <StyledMessageSquare size={18} className="text-emerald-700" />
              <Typography.Paragraph className="text-emerald-700 font-bold text-sm">
                تواصل مع الدعم الفني
              </Typography.Paragraph>
            </View>
          </Button>
        </View>
      </View>
    </View>
  );
}
