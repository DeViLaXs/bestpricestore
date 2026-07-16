import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CartItem {
  productId: number;
  productImageId: number; // Represents the specific variation
  name: string;
  price: number;
  currencyId: number;
  currencyName: string;
  imageUrl: string;
  quantity: number;
  quantityInStock: number;
  selected: boolean;
}

interface CartState {
  items: CartItem[];
  addItem: (
    item: Omit<CartItem, "quantity" | "selected">,
    quantity: number
  ) => { success: boolean; error?: string };
  removeItem: (productId: number, productImageId: number) => void;
  updateQuantity: (
    productId: number,
    productImageId: number,
    quantity: number
  ) => { success: boolean; error?: string };
  toggleSelect: (productId: number, productImageId: number) => void;
  toggleAllSelect: (selected: boolean) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (i) =>
            i.productId === item.productId &&
            i.productImageId === item.productImageId
        );

        // Check if there is stock available at all
        if (item.quantityInStock <= 0) {
          return {
            success: false,
            error: "عذرًا، هذا المنتج غير متوفر في المخزن حاليًا.",
          };
        }

        if (existingIndex >= 0) {
          const existingItem = items[existingIndex];
          const newQuantity = existingItem.quantity + quantity;

          if (newQuantity > item.quantityInStock) {
            // Cap at quantityInStock
            const updatedItems = [...items];
            updatedItems[existingIndex] = {
              ...existingItem,
              quantity: item.quantityInStock,
              quantityInStock: item.quantityInStock, // Update stock info too
            };
            set({ items: updatedItems });
            return {
              success: false,
              error: `تمت إضافة الحد الأقصى المتاح وهو (${item.quantityInStock}) قطع.`,
            };
          }

          const updatedItems = [...items];
          updatedItems[existingIndex] = {
            ...existingItem,
            quantity: newQuantity,
            quantityInStock: item.quantityInStock, // Update stock info too
          };
          set({ items: updatedItems });
          return { success: true };
        } else {
          // New item
          if (quantity > item.quantityInStock) {
            set({
              items: [
                ...items,
                { ...item, quantity: item.quantityInStock, selected: true },
              ],
            });
            return {
              success: false,
              error: `تمت إضافة الحد الأقصى المتاح وهو (${item.quantityInStock}) قطع.`,
            };
          }

          set({
            items: [...items, { ...item, quantity, selected: true }],
          });
          return { success: true };
        }
      },

      removeItem: (productId, productImageId) => {
        set({
          items: get().items.filter(
            (i) =>
              !(i.productId === productId && i.productImageId === productImageId)
          ),
        });
      },

      updateQuantity: (productId, productImageId, quantity) => {
        const { items } = get();
        const index = items.findIndex(
          (i) => i.productId === productId && i.productImageId === productImageId
        );

        if (index === -1) {
          return { success: false, error: "المنتج غير موجود في السلة." };
        }

        const item = items[index];

        if (quantity > item.quantityInStock) {
          const updatedItems = [...items];
          updatedItems[index] = {
            ...item,
            quantity: item.quantityInStock,
          };
          set({ items: updatedItems });
          return {
            success: false,
            error: `الكمية المطلوبة تتجاوز المتوفر في المخزن (${item.quantityInStock} قطع).`,
          };
        }

        const updatedItems = [...items];
        updatedItems[index] = {
          ...item,
          quantity: Math.max(1, quantity),
        };
        set({ items: updatedItems });
        return { success: true };
      },

      toggleSelect: (productId, productImageId) => {
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.productImageId === productImageId
              ? { ...i, selected: !i.selected }
              : i
          ),
        });
      },

      toggleAllSelect: (selected) => {
        set({
          items: get().items.map((i) => ({ ...i, selected })),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      setItems: (items) => {
        set({ items });
      },
    }),
    {
      name: "shopping-cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
