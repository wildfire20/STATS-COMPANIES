import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CartDrawer() {
  const { items, itemCount, subtotal, isOpen, closeCart, updateQuantity, removeItem, isLoading } = useCart();

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `R${numPrice.toFixed(2)}`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col" data-testid="cart-drawer">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl font-display" data-testid="text-cart-title">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
            {itemCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <Separator />

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12" data-testid="cart-empty">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-center mb-6 text-sm">
              Add some products to get started
            </p>
            <Link href="/shop" onClick={closeCart}>
              <Button className="rounded-full px-6" data-testid="button-browse-products">
                Browse Products
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 py-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex gap-4 py-4 border-b last:border-0"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1" data-testid={`text-item-name-${item.id}`}>
                        {item.productName}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {formatPrice(item.unitPrice)} each
                      </p>
                      {item.options && Object.keys(item.options).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {Object.entries(item.options).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              }
                            }}
                            disabled={item.quantity <= 1 || isLoading}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium" data-testid={`text-quantity-${item.id}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isLoading}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold" data-testid={`text-total-${item.id}`}>
                            {formatPrice(item.totalPrice)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.id)}
                            disabled={isLoading}
                            data-testid={`button-remove-${item.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>

            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span data-testid="text-subtotal">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Shipping and taxes calculated at checkout
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/cart" onClick={closeCart}>
                  <Button variant="outline" className="w-full rounded-full" data-testid="button-view-cart">
                    View Cart
                  </Button>
                </Link>
                <Link href="/checkout" onClick={closeCart}>
                  <Button className="w-full rounded-full btn-premium" data-testid="button-checkout">
                    Checkout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function CartButton() {
  const { itemCount, toggleCart } = useCart();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={toggleCart}
      data-testid="button-cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          data-testid="badge-cart-count"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </Badge>
      )}
    </Button>
  );
}
