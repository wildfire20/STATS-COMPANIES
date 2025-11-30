import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  ShoppingCart, MapPin, CreditCard, Truck, Building2, 
  ArrowRight, ArrowLeft, CheckCircle, Loader2, AlertCircle,
  Package, Plus, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import type { Address } from "@shared/schema";

interface PaymentMethod {
  id: string;
  methodType: string;
  name: string;
  description: string | null;
  instructions: string | null;
  bankName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  branchCode: string | null;
  reference: string | null;
  processingFeeType: string | null;
  processingFeeValue: string | null;
  gatewayEnabled: boolean | null;
}

type CheckoutStep = "address" | "payment" | "review";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, itemCount, subtotal, refetch } = useCart();
  const { toast } = useToast();
  
  const [step, setStep] = useState<CheckoutStep>("address");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer");
  const [notes, setNotes] = useState("");

  const { data: user, isLoading: userLoading } = useQuery<{ id: string; firstName?: string; lastName?: string; email?: string }>({
    queryKey: ["/api/auth/user"],
  });

  const { data: addresses, isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: ["/api/client/addresses"],
    enabled: !!user,
  });

  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods"],
  });

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(a => a.isDefault);
      setSelectedAddressId(defaultAddress?.id || addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (paymentMethods && paymentMethods.length > 0 && !paymentMethod) {
      setPaymentMethod(paymentMethods[0].methodType);
    }
  }, [paymentMethods, paymentMethod]);

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/orders/checkout", {
        addressId: selectedAddressId,
        paymentMethod,
        notes,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/client/orders"] });
      refetch();
      toast({
        title: "Order placed successfully",
        description: `Your order ${data.order.orderNumber} has been confirmed.`,
      });
      setLocation(`/dashboard/orders/${data.order.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `R${numPrice.toFixed(2)}`;
  };

  const getPaymentMethodIcon = (methodType: string) => {
    switch (methodType) {
      case "bank_transfer":
        return Building2;
      case "pay_on_delivery":
      case "cash_on_delivery":
        return Truck;
      case "stripe":
        return CreditCard;
      case "instant_eft":
        return Zap;
      default:
        return CreditCard;
    }
  };

  const getSelectedPaymentMethod = () => {
    return paymentMethods?.find(pm => pm.methodType === paymentMethod);
  };

  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-display font-semibold mb-2">Please sign in</h2>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to complete your checkout.
            </p>
            <Link href="/login">
              <Button className="rounded-full px-6" data-testid="button-login">
                Sign In to Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-display font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some products to your cart before checking out.
            </p>
            <Link href="/shop">
              <Button className="rounded-full px-6" data-testid="button-shop">
                Browse Products
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedAddress = addresses?.find(a => a.id === selectedAddressId);

  const steps = [
    { id: "address", label: "Delivery", icon: MapPin },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "review", label: "Review", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-back-cart">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-display font-bold" data-testid="text-checkout-title">Checkout</h1>
        </motion.div>

        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-4">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => {
                    if (s.id === "address" || (s.id === "payment" && step !== "address") || s.id === step) {
                      setStep(s.id as CheckoutStep);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    step === s.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}
                  data-testid={`step-${s.id}`}
                >
                  <s.icon className="h-4 w-4" />
                  <span className="hidden md:inline font-medium">{s.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className="w-12 h-0.5 bg-border mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === "address" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card data-testid="card-address-step">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Delivery Address
                    </CardTitle>
                    <CardDescription>
                      Select where you'd like your order delivered
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {addressesLoading ? (
                      <div className="space-y-3">
                        {[1, 2].map(i => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                      </div>
                    ) : addresses && addresses.length > 0 ? (
                      <RadioGroup
                        value={selectedAddressId}
                        onValueChange={setSelectedAddressId}
                        className="space-y-3"
                      >
                        {addresses.map((address) => (
                          <div key={address.id} className="relative">
                            <RadioGroupItem
                              value={address.id}
                              id={address.id}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={address.id}
                              className="flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                              data-testid={`address-option-${address.id}`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{address.label}</span>
                                  {address.isDefault && (
                                    <Badge variant="secondary" className="text-xs">Default</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {address.street}, {address.city}, {address.province}, {address.postalCode}
                                </p>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <div className="text-center py-8">
                        <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground mb-4">
                          You don't have any saved addresses yet.
                        </p>
                        <Link href="/dashboard/addresses">
                          <Button variant="outline" className="rounded-full" data-testid="button-add-address">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Address
                          </Button>
                        </Link>
                      </div>
                    )}

                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={() => setStep("payment")}
                        disabled={!selectedAddressId}
                        className="rounded-full px-8"
                        data-testid="button-continue-payment"
                      >
                        Continue to Payment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card data-testid="card-payment-step">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                    <CardDescription>
                      Choose how you'd like to pay for your order
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {paymentMethodsLoading ? (
                      <div className="space-y-3">
                        {[1, 2].map(i => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : paymentMethods && paymentMethods.length > 0 ? (
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                        className="space-y-3"
                      >
                        {paymentMethods.map((method) => {
                          const Icon = getPaymentMethodIcon(method.methodType);
                          return (
                            <div key={method.id} className="relative">
                              <RadioGroupItem
                                value={method.methodType}
                                id={method.methodType}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={method.methodType}
                                className="flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                data-testid={`payment-option-${method.methodType}`}
                              >
                                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <span className="font-medium">{method.name}</span>
                                  {method.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {method.description}
                                    </p>
                                  )}
                                  {method.processingFeeType && method.processingFeeType !== "none" && method.processingFeeValue && (
                                    <p className="text-xs text-amber-600 mt-1">
                                      +{method.processingFeeType === "percentage" 
                                        ? `${method.processingFeeValue}% processing fee` 
                                        : `R${method.processingFeeValue} processing fee`}
                                    </p>
                                  )}
                                </div>
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          No payment methods available. Please contact support.
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 pt-4">
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any special instructions for your order..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="resize-none"
                        rows={3}
                        data-testid="input-notes"
                      />
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setStep("address")}
                        className="rounded-full px-6"
                        data-testid="button-back-address"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button 
                        onClick={() => setStep("review")}
                        className="rounded-full px-8"
                        data-testid="button-continue-review"
                      >
                        Review Order
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === "review" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card data-testid="card-review-step">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Review Your Order
                    </CardTitle>
                    <CardDescription>
                      Please review your order details before placing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Delivery Address
                      </h4>
                      {selectedAddress && (
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="font-medium">{selectedAddress.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.province}, {selectedAddress.postalCode}
                          </p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Payment Method
                      </h4>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        {(() => {
                          const selectedMethod = getSelectedPaymentMethod();
                          const Icon = selectedMethod ? getPaymentMethodIcon(selectedMethod.methodType) : CreditCard;
                          return (
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">
                                  {selectedMethod?.name || paymentMethod}
                                </p>
                                {selectedMethod?.methodType === "bank_transfer" && selectedMethod.bankName && (
                                  <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                    <p>Bank: {selectedMethod.bankName}</p>
                                    {selectedMethod.accountName && <p>Account: {selectedMethod.accountName}</p>}
                                    {selectedMethod.accountNumber && <p>Number: {selectedMethod.accountNumber}</p>}
                                    {selectedMethod.branchCode && <p>Branch: {selectedMethod.branchCode}</p>}
                                    {selectedMethod.reference && <p className="text-xs text-amber-600">{selectedMethod.reference}</p>}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Order Items ({itemCount})
                      </h4>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item.id} className="flex gap-4 bg-muted/50 p-4 rounded-lg">
                            <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden">
                              {item.productImage ? (
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} x {formatPrice(item.unitPrice)}
                              </p>
                            </div>
                            <p className="font-medium">{formatPrice(item.totalPrice)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {notes && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-2">Order Notes</h4>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                            {notes}
                          </p>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setStep("payment")}
                        className="rounded-full px-6"
                        data-testid="button-back-payment"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button 
                        onClick={() => checkoutMutation.mutate()}
                        disabled={checkoutMutation.isPending}
                        className="rounded-full px-8 btn-premium"
                        data-testid="button-place-order"
                      >
                        {checkoutMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Place Order
                            <CheckCircle className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
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
                    <span className="text-muted-foreground">Items ({itemCount})</span>
                    <span data-testid="text-subtotal">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT (15%)</span>
                    <span data-testid="text-tax">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-sm text-green-600">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span data-testid="text-total">{formatPrice(total)}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
