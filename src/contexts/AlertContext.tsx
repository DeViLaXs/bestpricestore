import type { JSX } from "react";
import { createContext, useContext, useState, useCallback } from "react";
import { Modal, View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { Check, AlertCircle, HelpCircle, XCircle } from "lucide-react-native";

export interface AlertButton {
  text: string;
  onPress?: () => void | Promise<void>;
  style?: "default" | "cancel" | "destructive";
}

export interface AlertOptions {
  title: string;
  message: string;
  buttons?: AlertButton[];
}

interface AlertContextType {
  showAlert: (title: string, message: string, buttons?: AlertButton[]) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [buttons, setButtons] = useState<AlertButton[]>([]);

  // Animation values
  const [scaleAnim] = useState(() => new Animated.Value(0.9));
  const [fadeAnim] = useState(() => new Animated.Value(0));

  const showAlert = useCallback(
    (alertTitle: string, alertMessage: string, alertButtons?: AlertButton[]) => {
      setTitle(alertTitle);
      setMessage(alertMessage);
      setButtons(alertButtons || [{ text: "حسنًا", style: "default" }]);
      setVisible(true);

      // Reset animations
      scaleAnim.setValue(0.9);
      fadeAnim.setValue(0);

      // Run animation on next frame to allow the Modal layout to mount first, eliminating jank
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            damping: 15,
            stiffness: 120,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [scaleAnim, fadeAnim]
  );

  const hideAlert = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  }, [scaleAnim, fadeAnim]);

  const handleButtonPress = async (btn: AlertButton) => {
    hideAlert();
    if (btn.onPress) {
      try {
        await btn.onPress();
      } catch (err) {
        console.error("Error running alert button callback:", err);
      }
    }
  };

  // Determine alert theme/icon based on title & button styles
  const getAlertTheme = () => {
    const titleLower = title.toLowerCase();
    const hasDestructive = buttons.some((btn) => btn.style === "destructive");

    if (
      titleLower.includes("إخفاء") ||
      titleLower.includes("حذف") ||
      titleLower.includes("إلغاء") ||
      hasDestructive
    ) {
      return {
        icon: <XCircle size={26} color="#dc2626" />,
        bgColor: "bg-red-50",
      };
    }
    if (titleLower.includes("نجاح") || titleLower.includes("تم")) {
      return {
        icon: <Check size={26} color="#16a34a" />,
        bgColor: "bg-green-50",
      };
    }
    if (titleLower.includes("خطأ") || titleLower.includes("فشل")) {
      return {
        icon: <AlertCircle size={26} color="#dc2626" />,
        bgColor: "bg-red-50",
      };
    }
    if (titleLower.includes("تنبيه") || titleLower.includes("تحذير")) {
      return {
        icon: <AlertCircle size={26} color="#d97706" />,
        bgColor: "bg-amber-50",
      };
    }
    // Default / Help theme
    return {
      icon: <HelpCircle size={26} color="#0F4C92" />,
      bgColor: "bg-blue-50",
    };
  };

  const theme = getAlertTheme();

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      <Modal transparent visible={visible} animationType="none" onRequestClose={hideAlert}>
        {/* Semi-transparent backdrop overlay */}
        <Animated.View
          className="flex-1 bg-black/50 justify-center items-center px-6"
          style={{ opacity: fadeAnim }}
        >
          {/* Central Dialog Card */}
          <Animated.View
            className="bg-white rounded-[28px] p-6 w-full max-w-[320px] items-center"
            style={[
              styles.cardShadow,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Themed Icon Header */}
            <View
              className={`w-14 h-14 rounded-full justify-center items-center mb-4 ${theme.bgColor}`}
            >
              {theme.icon}
            </View>

            {/* RTL Title */}
            <Text className="text-[17px] font-extrabold text-gray-900 mb-2 text-center w-full leading-6">
              {title}
            </Text>

            {/* RTL Message */}
            <Text className="text-xs font-semibold text-gray-500 mb-6 text-center w-full leading-5 px-1">
              {message}
            </Text>

            {/* RTL Buttons list */}
            {buttons.length === 1 ? (
              // Single button layout
              <TouchableOpacity
                onPress={() => handleButtonPress(buttons[0])}
                activeOpacity={0.8}
                className="w-full py-3 bg-[#0F4C92] rounded-[14px] items-center justify-center"
              >
                <Text className="text-white text-xs font-extrabold">{buttons[0].text}</Text>
              </TouchableOpacity>
            ) : buttons.length === 2 ? (
              // Two buttons layout side by side (RTL layout)
              <View className="w-full flex-row-reverse gap-3">
                {buttons.map((btn, idx) => {
                  const isDestructive = btn.style === "destructive";
                  const isCancel = btn.style === "cancel";

                  let btnBg = "bg-[#0F4C92]";
                  let textColor = "text-white";

                  if (isDestructive) {
                    btnBg = "bg-red-600";
                  } else if (isCancel) {
                    btnBg = "bg-gray-100";
                    textColor = "text-gray-700";
                  }

                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleButtonPress(btn)}
                      activeOpacity={0.8}
                      className={`flex-1 py-3 rounded-[14px] items-center justify-center ${btnBg}`}
                    >
                      <Text className={`text-xs font-extrabold ${textColor}`}>{btn.text}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              // Three or more buttons stacked vertically
              <View className="w-full flex-col gap-2">
                {buttons.map((btn, idx) => {
                  const isDestructive = btn.style === "destructive";
                  const isCancel = btn.style === "cancel";

                  let btnBg = "bg-[#0F4C92]";
                  let textColor = "text-white";

                  if (isDestructive) {
                    btnBg = "bg-red-600";
                  } else if (isCancel) {
                    btnBg = "bg-gray-100";
                    textColor = "text-gray-700";
                  }

                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleButtonPress(btn)}
                      activeOpacity={0.8}
                      className={`w-full py-3 rounded-[14px] items-center justify-center ${btnBg}`}
                    >
                      <Text className={`text-xs font-extrabold ${textColor}`}>{btn.text}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </Modal>
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertContextType {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 10,
  },
});
