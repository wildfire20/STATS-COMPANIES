import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  userId: string | null;
  sessionId: string | null;
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  options: Record<string, string | number> | null;
  unitPrice: string;
  totalPrice: string;
  createdAt: string;
  updatedAt: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: {
    productId: string;
    productName: string;
    productImage?: string;
    quantity: number;
    options?: Record<string, string | number>;
    unitPrice: string;
  }) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refetch: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const { data: cartData, isLoading, refetch } = useQuery<{
    items: CartItem[];
    subtotal: number;
    itemCount: number;
  }>({
    queryKey: ["/api/cart"],
    staleTime: 0,
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: {
      productId: string;
      productName: string;
      productImage?: string;
      quantity: number;
      options?: Record<string, string | number>;
      unitPrice: string;
    }) => {
      const response = await apiRequest("POST", "/api/cart", item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
      setIsOpen(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart.",
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await apiRequest("PATCH", `/api/cart/${itemId}`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update cart.",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest("DELETE", `/api/cart/${itemId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item.",
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/cart");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear cart.",
        variant: "destructive",
      });
    },
  });

  const addItem = useCallback(async (item: {
    productId: string;
    productName: string;
    productImage?: string;
    quantity: number;
    options?: Record<string, string | number>;
    unitPrice: string;
  }) => {
    await addItemMutation.mutateAsync(item);
  }, [addItemMutation]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    await updateQuantityMutation.mutateAsync({ itemId, quantity });
  }, [updateQuantityMutation]);

  const removeItem = useCallback(async (itemId: string) => {
    await removeItemMutation.mutateAsync(itemId);
  }, [removeItemMutation]);

  const clearCart = useCallback(async () => {
    await clearCartMutation.mutateAsync();
  }, [clearCartMutation]);

  return (
    <CartContext.Provider
      value={{
        items: cartData?.items || [],
        itemCount: cartData?.itemCount || 0,
        subtotal: cartData?.subtotal || 0,
        isLoading,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        toggleCart: () => setIsOpen((prev) => !prev),
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refetch,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
