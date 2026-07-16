import type { JSX } from "react";
import { useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { router } from "expo-router";
import { Button, Input, TextField, Label, Typography, FieldError } from "heroui-native";
import { ChevronRight, ArrowRight, Smartphone, MapPin, Eye, EyeOff } from "lucide-react-native";
import { withUniwind } from "uniwind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth, getErrorMessage, checkIsAdmin } from "../hooks/useAuth";

const StyledChevronRight = withUniwind(ChevronRight);
const StyledArrowRight = withUniwind(ArrowRight);
const StyledSmartphone = withUniwind(Smartphone);
const StyledMapPin = withUniwind(MapPin);
const StyledEye = withUniwind(Eye);
const StyledEyeOff = withUniwind(EyeOff);

export default function RegisterScreen(): JSX.Element {
  const { registerMutation } = useAuth();
  const isLoading = registerMutation.isPending;
  const authError = registerMutation.error
    ? getErrorMessage(registerMutation.error, "فشلت عملية إنشاء الحساب. يرجى المحاولة مرة أخرى.")
    : null;
  const insets = useSafeAreaInsets();

  // Form State
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation State
  const [errors, setErrors] = useState<{
    storeName?: string;
    phone?: string;
    location?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // UI State
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Field change handlers to clear error states as user types
  const handleStoreNameChange = (text: string) => {
    setStoreName(text);
    if (errors.storeName) {
      setErrors((prev) => ({ ...prev, storeName: undefined }));
    }
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handleLocationChange = (text: string) => {
    setLocation(text);
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: undefined }));
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  /**
   * Performs form validation checks
   */
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // 1. Store name validation
    if (!storeName.trim()) {
      newErrors.storeName = "يرجى إدخال اسم المتجر";
    } else if (storeName.trim().length < 2) {
      newErrors.storeName = "يجب أن يكون اسم المتجر حرفين على الأقل";
    } else if (storeName.trim().length > 50) {
      newErrors.storeName = "يجب ألا يتجاوز اسم المتجر 50 حرفاً";
    }

    // 2. Phone number validation (starts with 7 and total 9 digits)
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      newErrors.phone = "يرجى إدخال رقم الجوال";
    } else if (!/^7\d{8}$/.test(cleanPhone)) {
      newErrors.phone = "رقم الجوال غير صحيح. يجب أن يبدأ بـ 7 ويتكون من 9 أرقام";
    }

    // 3. Location validation
    if (!location.trim()) {
      newErrors.location = "يرجى تحديد الموقع";
    }

    // 4. Password validation
    if (!password) {
      newErrors.password = "يرجى إدخال كلمة المرور";
    } else if (password.length < 6) {
      newErrors.password = "يجب أن تتكون كلمة المرور من 6 خانات على الأقل";
    }

    // 5. Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "يرجى تأكيد كلمة المرور";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "كلمة المرور غير متطابقة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles Form Submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSuccessMessage(null);
      const res = await registerMutation.mutateAsync({
        storeName: storeName.trim(),
        phone: phone.trim(),
        password: password,
        confirmPassword: confirmPassword,
        location: location.trim(),
      });

      setSuccessMessage("تم إنشاء الحساب بنجاح!");

      // Delay navigation slightly so user can see success state
      setTimeout(() => {
        if (checkIsAdmin(res.user)) {
          router.replace("/admin/representatives");
        } else if (res.user.isActive) {
          router.replace("/" as any);
        } else {
          router.replace("/pending");
        }
      }, 1500);
    } catch (err: any) {
      // Errors are handled and set in context, but caught here for safety
      console.log("Registration failed:", err);
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
            {/* Header Navigation / Back Button */}
            <View className="flex-row-reverse items-center justify-between mt-2 mb-4">
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100"
              >
                {Platform.OS === "ios" ? (
                  <StyledChevronRight size={22} className="text-gray-800" />
                ) : (
                  <StyledArrowRight size={22} className="text-gray-800" />
                )}
              </Pressable>
              {/* Spacer to align back button */}
              <View className="w-10" />
            </View>

            {/* Title */}
            <View className=" mb-6">
              <Typography.Heading
                type="h1"
                className="text-3xl font-extrabold text-gray-900 text-center"
              >
                إنشاء حساب جديد
              </Typography.Heading>
            </View>

            {/* Form Fields */}
            <View className="gap-3.5">
              {/* Full Name */}
              <TextField isRequired isInvalid={!!errors.storeName}>
                <Label className="w-full mb-1">
                  <Label.Text className="w-full text-right text-gray-800 font-bold text-[15px]">
                    اسم المتجر
                  </Label.Text>
                </Label>
                <Input
                  value={storeName}
                  onChangeText={handleStoreNameChange}
                  placeholder="اسم المتجر"
                  placeholderTextColor="#9ca3af"
                  textAlign="right"
                  maxLength={50}
                  className="w-full text-right bg-gray-50 focus:border-[#0F4C92] px-4 py-2.5 rounded-xl text-sm text-gray-800"
                  style={{ borderWidth: 1, borderColor: errors.storeName ? "#dc2626" : "#cbd5e1" }}
                />
                <FieldError classNames={{ text: "text-right text-xs mt-1" }}>
                  {errors.storeName}
                </FieldError>
              </TextField>

              {/* Mobile Number */}
              <TextField isRequired isInvalid={!!errors.phone}>
                <Label className="w-full mb-1">
                  <Label.Text className="w-full text-right text-gray-800 font-bold text-[15px]">
                    رقم الجوال
                  </Label.Text>
                </Label>
                <View className="w-full flex-row items-center relative">
                  <Input
                    value={phone}
                    onChangeText={handlePhoneChange}
                    placeholder="رقم الجوال"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    textAlign="right"
                    className="flex-1 text-right bg-gray-50 focus:border-[#0F4C92] pr-4 pl-12 py-2.5 rounded-xl text-sm text-gray-800"
                    style={{ borderWidth: 1, borderColor: errors.phone ? "#dc2626" : "#cbd5e1" }}
                  />
                  <StyledSmartphone
                    size={18}
                    className="absolute left-4 text-gray-400"
                    pointerEvents="none"
                  />
                </View>
                <FieldError classNames={{ text: "text-right text-xs mt-1" }}>
                  {errors.phone}
                </FieldError>
              </TextField>

              {/* Location */}
              <TextField isRequired isInvalid={!!errors.location}>
                <Label className="w-full mb-1">
                  <Label.Text className="w-full text-right text-gray-800 font-bold text-[15px]">
                    الموقع
                  </Label.Text>
                </Label>
                <View className="w-full flex-row items-center relative">
                  <Input
                    value={location}
                    onChangeText={handleLocationChange}
                    placeholder="الموقع"
                    placeholderTextColor="#9ca3af"
                    textAlign="right"
                    className="flex-1 text-right bg-gray-50 focus:border-[#0F4C92] pr-4 pl-12 py-2.5 rounded-xl text-sm text-gray-800"
                    style={{ borderWidth: 1, borderColor: errors.location ? "#dc2626" : "#cbd5e1" }}
                  />
                  <StyledMapPin
                    size={18}
                    className="absolute left-4 text-gray-400"
                    pointerEvents="none"
                  />
                </View>
                <FieldError classNames={{ text: "text-right text-xs mt-1" }}>
                  {errors.location}
                </FieldError>
              </TextField>

              {/* Password */}
              <TextField isRequired isInvalid={!!errors.password}>
                <Label className="w-full mb-1">
                  <Label.Text className="w-full text-right text-gray-800 font-bold text-[15px]">
                    كلمة المرور
                  </Label.Text>
                </Label>
                <View className="w-full flex-row items-center relative">
                  <Input
                    value={password}
                    onChangeText={handlePasswordChange}
                    placeholder="كلمة المرور"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!isPasswordVisible}
                    textAlign="right"
                    className="flex-1 text-right bg-gray-50 focus:border-[#0F4C92] pr-4 pl-12 py-2.5 rounded-xl text-sm text-gray-800"
                    style={{ borderWidth: 1, borderColor: errors.password ? "#dc2626" : "#cbd5e1" }}
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
                <FieldError classNames={{ text: "text-right text-xs mt-1" }}>
                  {errors.password}
                </FieldError>
              </TextField>

              {/* Confirm Password */}
              <TextField isRequired isInvalid={!!errors.confirmPassword}>
                <Label className="w-full mb-1">
                  <Label.Text className="w-full text-right text-gray-800 font-bold text-[15px]">
                    تأكيد كلمة المرور
                  </Label.Text>
                </Label>
                <View className="w-full flex-row items-center relative">
                  <Input
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    placeholder="تأكيد كلمة المرور"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!isConfirmPasswordVisible}
                    textAlign="right"
                    className="flex-1 text-right bg-gray-50 focus:border-[#0F4C92] pr-4 pl-12 py-2.5 rounded-xl text-sm text-gray-800"
                    style={{
                      borderWidth: 1,
                      borderColor: errors.confirmPassword ? "#dc2626" : "#cbd5e1",
                    }}
                  />
                  <Pressable
                    onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    className="absolute left-4 w-8 h-8 items-center justify-center"
                  >
                    {isConfirmPasswordVisible ? (
                      <StyledEyeOff size={18} className="text-gray-400" />
                    ) : (
                      <StyledEye size={18} className="text-gray-400" />
                    )}
                  </Pressable>
                </View>
                <FieldError classNames={{ text: "text-right text-xs mt-1" }}>
                  {errors.confirmPassword}
                </FieldError>
              </TextField>

              {/* API / Auth Context Error Message */}
              {authError && (
                <View className="bg-red-50 border border-red-200 p-3 rounded-lg mt-1">
                  <Typography.Paragraph className="text-right text-danger text-sm font-semibold">
                    {authError}
                  </Typography.Paragraph>
                </View>
              )}

              {/* Registration Success Message */}
              {successMessage && (
                <View className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg mt-1">
                  <Typography.Paragraph className="text-right text-emerald-700 text-sm font-semibold">
                    {successMessage}
                  </Typography.Paragraph>
                </View>
              )}

              {/* Register Button */}
              <Button
                onPress={handleSubmit}
                className="w-full bg-[#0F4C92] rounded-full mt-4 flex-row justify-center items-center"
                isDisabled={isLoading || !!successMessage}
              >
                {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
              </Button>
            </View>
          </View>

          {/* Login Bottom Link */}
          <View className="flex-row justify-center items-center mt-4 mb-2">
            <Pressable onPress={() => router.replace("/login")}>
              <Typography.Paragraph className="text-[#0F4C92] font-extrabold underline text-base ml-1">
                تسجيل الدخول
              </Typography.Paragraph>
            </Pressable>
            <Typography.Paragraph className="text-gray-600 text-base">
              هل لديك حساب؟
            </Typography.Paragraph>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
