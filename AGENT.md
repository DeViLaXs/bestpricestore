# Styling Rules for bestpricestore

## Styling Preference

- **Strictly Use `uniwind` (Tailwind CSS for React Native)** for all component styling.
- **Do NOT use React Native's `StyleSheet.create()`** or regular stylesheet CSS unless something does not work in `uniwind`.
- **Minimize inline `style` objects**, using them only for dynamic calculations (e.g., dynamic safe area insets or animated values).
- **Fallback Policy**: If a specific styling layout, animation, or visual feature does not work correctly in `uniwind`, you are allowed to fall back to using `StyleSheet.create()` or inline `style` objects.

## How to Style

- Apply utility classes directly using the `className` prop:
  ```tsx
  <View className="flex-1 bg-white px-6">
    <Text className="text-xl font-bold text-gray-900">مرحبا</Text>
  </View>
  ```
- For third-party components or icons (like `lucide-react-native` or `@expo/vector-icons`), wrap them using `withUniwind`:
  ```tsx
  import { withUniwind } from "uniwind";
  import { Smartphone } from "lucide-react-native";

  const StyledSmartphone = withUniwind(Smartphone);

  // In JSX:
  <StyledSmartphone size={18} className="text-gray-400" />;
  ```
- Always adhere to RTL/Arabic layouts, verifying font alignments and directional layout properties (e.g., `text-right`, `flex-row-reverse` where applicable).

## Service and Hooks Rules

- **Access Services via Hooks**: UI components and pages must **never** call or import services (from `src/services`) directly.
- **Use React Query / Custom Hooks**: All service methods must be wrapped and accessed using hooks (from `src/hooks`, typically built with `@tanstack/react-query` or similar state management).
- **Add Missing Hooks**: If a service action is needed but no corresponding hook exists, create a new hook in `src/hooks` first, then consume that hook in the UI.
