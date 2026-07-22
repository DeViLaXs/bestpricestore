import { useToast, Toast } from "heroui-native";
import { Check, AlertCircle } from "lucide-react-native";
import { View, Text } from "react-native";
import type { JSX } from "react";

export const useAppToast = () => {
  const { toast } = useToast();

  const showSuccessToast = (title: string, message: string) => {
    toast.show({
      component: (props) => (
        <Toast
          variant="success"
          {...props}
          className="bg-white border border-gray-100 p-3.5 rounded-2xl flex-row-reverse items-center shadow-lg"
        >
          <View className="w-8 h-8 rounded-full bg-green-50 justify-center items-center ml-3">
            <Check size={18} color="#16a34a" />
          </View>
          <View className="items-end flex-1 pr-1">
            <Text className="text-gray-900 font-extrabold text-base text-right">{title}</Text>
            <Text className="text-gray-500 font-bold text-sm text-right mt-0.5">{message}</Text>
          </View>
          <Toast.Close className="mr-auto" iconProps={{ size: 14, color: "#94a3b8" }} />
        </Toast>
      ),
    });
  };

  const showErrorToast = (title: string, message: string) => {
    toast.show({
      component: (props) => (
        <Toast
          variant="danger"
          {...props}
          className="bg-white border border-gray-100 p-3.5 rounded-2xl flex-row-reverse items-center shadow-lg"
        >
          <View className="w-8 h-8 rounded-full bg-red-50 justify-center items-center ml-3">
            <AlertCircle size={18} color="#dc2626" />
          </View>
          <View className="items-end flex-1 pr-1">
            <Text className="text-gray-900 font-extrabold text-base text-right">{title}</Text>
            <Text className="text-gray-500 font-bold text-sm text-right mt-0.5">{message}</Text>
          </View>
          <Toast.Close className="mr-auto" iconProps={{ size: 14, color: "#94a3b8" }} />
        </Toast>
      ),
    });
  };

  const showWarningToast = (title: string, message: string) => {
    toast.show({
      component: (props) => (
        <Toast
          variant="warning"
          {...props}
          className="bg-white border border-gray-100 p-3.5 rounded-2xl flex-row-reverse items-center shadow-lg"
        >
          <View className="w-8 h-8 rounded-full bg-amber-50 justify-center items-center ml-3">
            <AlertCircle size={18} color="#d97706" />
          </View>
          <View className="items-end flex-1 pr-1">
            <Text className="text-gray-900 font-extrabold text-base text-right">{title}</Text>
            <Text className="text-gray-500 font-bold text-sm text-right mt-0.5">{message}</Text>
          </View>
          <Toast.Close className="mr-auto" iconProps={{ size: 14, color: "#94a3b8" }} />
        </Toast>
      ),
    });
  };

  return { showSuccessToast, showErrorToast, showWarningToast };
};
