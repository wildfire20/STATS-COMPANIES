import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { items, itemCount, subtotal, isLoading, updateQuantity, removeItem, clearCart } = useCart();

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `R${numPrice.toFixed(2)}`;
  };

  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link href="/shop">
            <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-back-shop">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-display font-bold" data-testid="text-cart-title">Shopping Cart</h1>
          {itemCount > 0 && (
            <Badge variant="secondary" className="text-sm">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </Badge>
          )}
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-display font-semibold mb-3" data-testid="text-empty-cart">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven't added any products yet. Browse our shop to find great products.
            </p>
            <Link href="/shop">
              <Button size="lg" className="rounded-full px-8" data-testid="button-continue-shopping">
                Continue Shopping
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden" data-testid={`cart-item-${item.id}`}>
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-10 w-10 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                              <div>
                                <h3 className="font-display font-semibold text-lg mb-1" data-testid={`text-item-name-${item.id}`}>
                                  {item.productName}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {formatPrice(item.unitPrice)} each
                                </p>
                                {item.options && Object.keys(item.options).length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {Object.entries(item.options).map(([key, value]) => (
                                      <Badge key={key} variant="outline" className="text-xs">
                                        {key}: {value}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="text-xl font-display font-bold" data-testid={`text-total-${item.id}`}>
                                  {formatPrice(item.totalPrice)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-9 w-9 rounded-full"
                                  onClick={() => {
                                    if (item.quantity > 1) {
                                      updateQuantity(item.id, item.quantity - 1);
                                    }
                                  }}
                                  disabled={item.quantity <= 1}
                                  data-testid={`button-decrease-${item.id}`}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-10 text-center font-medium text-lg" data-testid={`text-quantity-${item.id}`}>
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-9 w-9 rounded-full"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  data-testid={`button-increase-${item.id}`}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeItem(item.id)}
                                data-testid={`button-remove-${item.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="flex justify-between items-center pt-4">
                <Link href="/shop">
                  <Button variant="outline" className="rounded-full" data-testid="button-continue-shopping">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={clearCart}
                  data-testid="button-clear-cart"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="sticky top-24" data-testid="card-order-summary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span data-testid="text-subtotal">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VAT (15%)</span>
                      <span data-testid="text-tax">{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-sm text-muted-foreground">Calculated at checkout</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span data-testid="text-total">{formatPrice(total)}</span>
                    </div>
                    <Link href="/checkout">
                      <Button className="w-full rounded-full btn-premium h-12 text-base" data-testid="button-checkout">
                        Proceed to Checkout
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                    <p className="text-xs text-center text-muted-foreground">
                      Secure checkout powered by industry-standard encryption
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
