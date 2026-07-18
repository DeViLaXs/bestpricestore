import type { JSX } from "react";
import { useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { Button, Input, TextField, Label, Typography } from "heroui-native";
import { Smartphone, Eye, EyeOff } from "lucide-react-native";
import { withUniwind } from "uniwind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth, getErrorMessage, checkIsAdmin } from "../hooks/useAuth";

const StyledSmartphone = withUniwind(Smartphone);
const StyledEye = withUniwind(Eye);
const StyledEyeOff = withUniwind(EyeOff);

export default function LoginScreen(): JSX.Element {
  const { loginMutation } = useAuth();
  const isLoading = loginMutation.isPending;
  const authError = loginMutation.error
    ? getErrorMessage(
        loginMutation.error,
        "فشل تسجيل الدخول. يرجى التحقق من البيانات والمحاولة مرة أخرى."
      )
    : null;
  const insets = useSafeAreaInsets();

  // Form State
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // UI State
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Handles Form Submission
   */
  const handleSubmit = async () => {
    if (!phone.trim()) {
      Alert.alert("تنبيه", "يرجى إدخال رقم الجوال");
      return;
    }
    if (!password) {
      Alert.alert("تنبيه", "يرجى إدخال كلمة المرور");
      return;
    }

    try {
      setSuccessMessage(null);
      const res = await loginMutation.mutateAsync({
        phone: phone.trim(),
        password: password,
      });

      setSuccessMessage("تم تسجيل الدخول بنجاح!");

      // Delay navigation slightly so user can see success state
      setTimeout(() => {
        if (checkIsAdmin(res.user)) {
          router.replace("/admin/dashboard");
        } else if (res.user.isActive) {
          router.replace("/" as any);
        } else {
          router.replace("/pending");
        }
      }, 1500);
    } catch (err: any) {
      console.log("Login failed:", err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 16),
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        <View className="flex-1 justify-between">
          <View>
            {/* Header Spacer to match register.tsx visually */}
            <View className="h-10 mt-2 mb-4" />

            {/* Title */}
            <View className="mb-8">
              <Typography.Heading
                type="h1"
                className="text-3xl font-extrabold text-gray-900 text-center"
              >
                تسجيل الدخول
              </Typography.Heading>
            </View>

            {/* Form Fields */}
            <View className="gap-3.5">
              {/* Mobile Number */}
              <TextField>
                <Label className="w-full mb-1">
                  <Label.Text className="w-full text-right text-gray-800 font-bold text-[15px]">
                    رقم الجوال
                  </Label.Text>
                </Label>
                <View className="w-full flex-row items-center relative">
                  <Input
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="رقم الجوال"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    textAlign="right"
                    className="flex-1 text-right bg-gray-50 focus:border-[#0F4C92] pr-4 pl-12 py-2.5 rounded-xl text-sm text-gray-800"
                    style={{ borderWidth: 1, borderColor: "#cbd5e1" }}
                  />
                  <StyledSmartphone
                    size={18}
                    className="absolute left-4 text-gray-400"
                    pointerEvents="none"
                  />
                </View>
              </TextField>

              {/* Password */}
              <TextField>
                <Label className="w-full mb-1">
                  <Label.Text className="w-full text-right text-gray-800 font-bold text-[15px]">
                    كلمة المرور
                  </Label.Text>
                </Label>
                <View className="w-full flex-row items-center relative">
                  <Input
                    value={password}
                    onChangeText={setPassword}
                    placeholder="كلمة المرور"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!isPasswordVisible}
                    textAlign="right"
                    className="flex-1 text-right bg-gray-50 focus:border-[#0F4C92] pr-4 pl-12 py-2.5 rounded-xl text-sm text-gray-800"
                    style={{ borderWidth: 1, borderColor: "#cbd5e1" }}
                  />
                  <Pressable
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="absolute left-4 w-8 h-8 items-center justify-center"
                  >
                    {isPasswordVisible ? (
                      <StyledEyeOff size={18} className="text-gray-400" />
                    ) : (
                      <StyledEye size={18} className="text-gray-400" />
                    )}
                  </Pressable>
                </View>
              </TextField>

              {/* Forgot Password Link */}
              {/* <View className="flex-row justify-end mt-1">
                <Pressable
                  onPress={() =>
                    Alert.alert(
                      "استعادة كلمة المرور",
                      "سيتم إرسال رابط استعادة كلمة المرور قريباً."
                    )
                  }
                >
                  <Typography.Paragraph className="text-[#0F4C92] font-semibold text-sm">
                    نسيت كلمة المرور؟
                  </Typography.Paragraph>
                </Pressable>
              </View> */}

              {/* API / Auth Context Error Message */}
              {authError && (
                <View className="bg-red-50 border border-red-200 p-3 rounded-lg mt-2">
                  <Typography.Paragraph className="text-right text-danger text-sm font-semibold">
                    {authError}
                  </Typography.Paragraph>
                </View>
              )}

              {/* Login Success Message */}
              {successMessage && (
                <View className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg mt-2">
                  <Typography.Paragraph className="text-right text-emerald-700 text-sm font-semibold">
                    {successMessage}
                  </Typography.Paragraph>
                </View>
              )}

              {/* Login Button */}
              <Button
                onPress={handleSubmit}
                className="w-full bg-[#0F4C92]  rounded-full mt-6 flex-row justify-center items-center"
                isDisabled={isLoading || !!successMessage}
              >
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>

              {/* Register Link below login button */}
              <View className="flex-row-reverse justify-center mt-4 ">
                <Typography.Paragraph className="text-gray-600 text-base ml-1">
                  ليس لديك حساب؟
                </Typography.Paragraph>
                <Pressable onPress={() => router.replace("/register")}>
                  <Typography.Paragraph className="text-[#0F4C92] font-extrabold text-base ml-2">
                    إنشاء حساب
                  </Typography.Paragraph>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
