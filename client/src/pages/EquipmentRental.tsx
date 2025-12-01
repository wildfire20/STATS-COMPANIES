import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Camera, Video, Lightbulb, Mic, Move3D, Package, Calendar, CheckCircle, Info } from "lucide-react";
import type { Equipment } from "@shared/schema";
import { format, differenceInDays, addDays } from "date-fns";

const categories = [
  { id: "all", name: "All Equipment", icon: Package },
  { id: "camera", name: "Cameras", icon: Camera },
  { id: "lens", name: "Lenses", icon: Camera },
  { id: "lighting", name: "Lighting", icon: Lightbulb },
  { id: "audio", name: "Audio", icon: Mic },
  { id: "tripod", name: "Tripods", icon: Move3D },
  { id: "drone", name: "Drones", icon: Video },
];

export default function EquipmentRental() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isRentalDialogOpen, setIsRentalDialogOpen] = useState(false);
  const [rentalForm, setRentalForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    startDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 2), "yyyy-MM-dd"),
    quantity: 1,
    notes: "",
  });

  const { data: equipment, isLoading } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === "all" ? "/api/equipment" : `/api/equipment?category=${selectedCategory}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch equipment");
      return response.json();
    },
  });

  const createRentalMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/equipment-rentals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setIsRentalDialogOpen(false);
      setSelectedEquipment(null);
      setRentalForm({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        startDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
        endDate: format(addDays(new Date(), 2), "yyyy-MM-dd"),
        quantity: 1,
        notes: "",
      });
      toast({ 
        title: "Rental Request Submitted!",
        description: "We'll contact you shortly to confirm your booking."
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to submit rental request", 
        description: error.message || "Please try again later",
        variant: "destructive" 
      });
    },
  });

  const handleRentClick = (item: Equipment) => {
    setSelectedEquipment(item);
    setIsRentalDialogOpen(true);
  };

  const calculateTotal = () => {
    if (!selectedEquipment) return { days: 0, subtotal: 0, deposit: 0, total: 0 };
    
    const start = new Date(rentalForm.startDate);
    const end = new Date(rentalForm.endDate);
    const days = Math.max(1, differenceInDays(end, start));
    const dailyRate = parseFloat(selectedEquipment.dailyRate);
    const subtotal = dailyRate * days * rentalForm.quantity;
    const deposit = selectedEquipment.deposit ? parseFloat(selectedEquipment.deposit) * rentalForm.quantity : 0;
    const total = subtotal + deposit;
    
    return { days, subtotal, deposit, total };
  };

  const handleSubmitRental = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    createRentalMutation.mutate({
      equipmentId: selectedEquipment.id,
      ...rentalForm,
    });
  };

  const { days, subtotal, deposit, total } = calculateTotal();

  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6" data-testid="heading-equipment">
              Equipment Rental
            </h1>
            <p className="text-lg text-muted-foreground">
              Professional photography and videography equipment available for rent. 
              From cameras to lighting, we have everything you need for your next project.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="flex flex-wrap justify-center gap-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className="flex items-center gap-2"
                      data-testid={`tab-category-${cat.id}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{cat.name}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <TabsContent value={selectedCategory} className="mt-0">
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array(8).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-80" />
                  ))}
                </div>
              ) : equipment && equipment.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {equipment.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-equipment-${item.id}`}>
                        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Camera className="h-16 w-16 text-muted-foreground/20" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="capitalize">
                              {item.category}
                            </Badge>
                          </div>
                          {item.availableQuantity === 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Badge variant="destructive" className="text-lg py-2 px-4">
                                Currently Unavailable
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                          {item.brand && item.model && (
                            <p className="text-sm text-muted-foreground">{item.brand} {item.model}</p>
                          )}
                        </CardHeader>
                        <CardContent className="flex-1">
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold">R{item.dailyRate}</p>
                              <p className="text-xs text-muted-foreground">per day</p>
                            </div>
                            {item.weeklyRate && (
                              <div className="text-right">
                                <p className="text-lg font-semibold text-primary">R{item.weeklyRate}</p>
                                <p className="text-xs text-muted-foreground">per week</p>
                              </div>
                            )}
                          </div>
                          {item.deposit && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Refundable deposit: R{item.deposit}
                            </p>
                          )}
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button 
                            className="w-full" 
                            onClick={() => handleRentClick(item)}
                            disabled={(item.availableQuantity || 0) === 0}
                            data-testid={`button-rent-${item.id}`}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            {(item.availableQuantity || 0) > 0 ? "Rent Now" : "Unavailable"}
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Equipment Available</h3>
                  <p className="text-muted-foreground">
                    {selectedCategory === "all" 
                      ? "Check back soon for available equipment."
                      : "No equipment in this category. Try another category."}
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-center mb-8">How Equipment Rental Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  step: 1, 
                  title: "Choose Equipment", 
                  description: "Browse our selection and select the equipment you need for your project."
                },
                { 
                  step: 2, 
                  title: "Submit Request", 
                  description: "Fill out the rental form with your dates and contact information."
                },
                { 
                  step: 3, 
                  title: "Pick Up & Create", 
                  description: "Once approved, pick up your equipment and start creating!"
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Dialog open={isRentalDialogOpen} onOpenChange={setIsRentalDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Rent Equipment</DialogTitle>
            <DialogDescription>
              {selectedEquipment && `Request to rent: ${selectedEquipment.name}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEquipment && (
            <form onSubmit={handleSubmitRental} className="space-y-4 overflow-y-auto flex-1">
              <div className="p-3 bg-muted rounded-lg flex items-center gap-3">
                {selectedEquipment.image ? (
                  <img src={selectedEquipment.image} alt={selectedEquipment.name} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-muted-foreground/10 rounded flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold">{selectedEquipment.name}</h4>
                  <p className="text-sm text-muted-foreground">R{selectedEquipment.dailyRate}/day</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={rentalForm.startDate}
                    min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                    onChange={(e) => setRentalForm({ ...rentalForm, startDate: e.target.value })}
                    required
                    data-testid="input-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={rentalForm.endDate}
                    min={rentalForm.startDate}
                    onChange={(e) => setRentalForm({ ...rentalForm, endDate: e.target.value })}
                    required
                    data-testid="input-end-date"
                  />
                </div>
              </div>

              {(selectedEquipment.availableQuantity || 0) > 1 && (
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedEquipment.availableQuantity || 1}
                    value={rentalForm.quantity}
                    onChange={(e) => setRentalForm({ ...rentalForm, quantity: parseInt(e.target.value) || 1 })}
                    data-testid="input-quantity"
                  />
                  <p className="text-xs text-muted-foreground">{selectedEquipment.availableQuantity} available</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="customerName">Full Name</Label>
                <Input
                  id="customerName"
                  value={rentalForm.customerName}
                  onChange={(e) => setRentalForm({ ...rentalForm, customerName: e.target.value })}
                  required
                  data-testid="input-customer-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={rentalForm.customerEmail}
                    onChange={(e) => setRentalForm({ ...rentalForm, customerEmail: e.target.value })}
                    required
                    data-testid="input-customer-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={rentalForm.customerPhone}
                    onChange={(e) => setRentalForm({ ...rentalForm, customerPhone: e.target.value })}
                    required
                    data-testid="input-customer-phone"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={rentalForm.notes}
                  onChange={(e) => setRentalForm({ ...rentalForm, notes: e.target.value })}
                  placeholder="Any special requirements or questions?"
                  data-testid="input-notes"
                />
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{days} day{days !== 1 ? "s" : ""} × R{selectedEquipment.dailyRate} × {rentalForm.quantity}</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>
                {deposit > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Refundable Deposit</span>
                    <span>R{deposit.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>R{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  A valid ID document is required at pickup. The deposit will be refunded upon safe return of the equipment.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsRentalDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createRentalMutation.isPending}
                  data-testid="button-submit-rental"
                >
                  {createRentalMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
