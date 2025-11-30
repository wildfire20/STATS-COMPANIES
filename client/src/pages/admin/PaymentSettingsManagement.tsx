import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, CreditCard, Building2, Truck, Zap } from "lucide-react";
import type { PaymentSetting } from "@shared/schema";

const methodTypes = [
  { id: "bank_transfer", name: "Bank Transfer (EFT)", icon: Building2 },
  { id: "cash_on_delivery", name: "Pay on Delivery", icon: Truck },
  { id: "stripe", name: "Stripe (Credit/Debit Cards)", icon: CreditCard },
  { id: "instant_eft", name: "Instant EFT", icon: Zap },
];

export default function PaymentSettingsManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<PaymentSetting | null>(null);
  const [formData, setFormData] = useState({
    methodType: "bank_transfer",
    name: "",
    description: "",
    instructions: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    branchCode: "",
    reference: "",
    processingFeeType: "none" as "none" | "percentage" | "fixed",
    processingFeeValue: "",
    gatewayEnabled: false,
    gatewayTestMode: true,
    isActive: true,
    displayOrder: 0,
  });

  const { data: settings, isLoading } = useQuery<PaymentSetting[]>({
    queryKey: ["/api/admin/payment-settings"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/payment-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Payment method created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create payment method", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PUT", `/api/admin/payment-settings/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      setIsDialogOpen(false);
      setEditingSetting(null);
      resetForm();
      toast({ title: "Payment method updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update payment method", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/payment-settings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      toast({ title: "Payment method deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete payment method", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      methodType: "bank_transfer",
      name: "",
      description: "",
      instructions: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
      branchCode: "",
      reference: "",
      processingFeeType: "none",
      processingFeeValue: "",
      gatewayEnabled: false,
      gatewayTestMode: true,
      isActive: true,
      displayOrder: 0,
    });
  };

  const handleEdit = (setting: PaymentSetting) => {
    setEditingSetting(setting);
    setFormData({
      methodType: setting.methodType,
      name: setting.name,
      description: setting.description || "",
      instructions: setting.instructions || "",
      bankName: setting.bankName || "",
      accountName: setting.accountName || "",
      accountNumber: setting.accountNumber || "",
      branchCode: setting.branchCode || "",
      reference: setting.reference || "",
      processingFeeType: (setting.processingFeeType as "none" | "percentage" | "fixed") || "none",
      processingFeeValue: setting.processingFeeValue || "",
      gatewayEnabled: setting.gatewayEnabled || false,
      gatewayTestMode: setting.gatewayTestMode ?? true,
      isActive: setting.isActive ?? true,
      displayOrder: setting.displayOrder || 0,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      processingFeeValue: formData.processingFeeValue || null,
    };

    if (editingSetting) {
      updateMutation.mutate({ id: editingSetting.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getMethodIcon = (type: string) => {
    const method = methodTypes.find(m => m.id === type);
    if (!method) return CreditCard;
    return method.icon;
  };

  const getMethodLabel = (type: string) => {
    const method = methodTypes.find(m => m.id === type);
    return method?.name || type;
  };

  const toggleActive = (setting: PaymentSetting) => {
    updateMutation.mutate({ 
      id: setting.id, 
      data: { isActive: !setting.isActive } 
    });
  };

  return (
    <AdminLayout title="Payment Settings">
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <div>
            <p className="text-muted-foreground">
              Configure payment methods available at checkout.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingSetting(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-payment-method">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSetting ? "Edit Payment Method" : "Add Payment Method"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Type</Label>
                    <Select
                      value={formData.methodType}
                      onValueChange={(value) => setFormData({ ...formData, methodType: value })}
                    >
                      <SelectTrigger data-testid="select-method-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {methodTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Bank Transfer (EFT)"
                      required
                      data-testid="input-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description shown to customers"
                    rows={2}
                    data-testid="input-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Instructions</Label>
                  <Textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Instructions shown after checkout (e.g., how to make payment)"
                    rows={3}
                    data-testid="input-instructions"
                  />
                </div>

                {formData.methodType === "bank_transfer" && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium">Bank Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Input
                          value={formData.bankName}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          placeholder="e.g., FNB"
                          data-testid="input-bank-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Name</Label>
                        <Input
                          value={formData.accountName}
                          onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                          placeholder="e.g., STATS Companies"
                          data-testid="input-account-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Input
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          placeholder="Account number"
                          data-testid="input-account-number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Branch Code</Label>
                        <Input
                          value={formData.branchCode}
                          onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                          placeholder="e.g., 250655"
                          data-testid="input-branch-code"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Reference Instructions</Label>
                      <Input
                        value={formData.reference}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        placeholder="e.g., Use your order number as reference"
                        data-testid="input-reference"
                      />
                    </div>
                  </div>
                )}

                {formData.methodType === "stripe" && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Stripe Configuration</h4>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.gatewayEnabled}
                          onCheckedChange={(checked) => setFormData({ ...formData, gatewayEnabled: checked })}
                          data-testid="switch-gateway-enabled"
                        />
                        <Label>Enable Stripe</Label>
                      </div>
                    </div>
                    {formData.gatewayEnabled && (
                      <>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={formData.gatewayTestMode}
                            onCheckedChange={(checked) => setFormData({ ...formData, gatewayTestMode: checked })}
                            data-testid="switch-test-mode"
                          />
                          <Label>Test Mode</Label>
                          {formData.gatewayTestMode && (
                            <Badge variant="secondary">Using test keys</Badge>
                          )}
                        </div>
                        <div className="bg-muted/50 p-4 rounded-md">
                          <p className="text-sm text-muted-foreground">
                            Stripe API keys are configured through secure environment secrets. 
                            Contact your administrator to set up STRIPE_PUBLIC_KEY and STRIPE_SECRET_KEY.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Processing Fee</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fee Type</Label>
                      <Select
                        value={formData.processingFeeType}
                        onValueChange={(value) => setFormData({ 
                          ...formData, 
                          processingFeeType: value as "none" | "percentage" | "fixed" 
                        })}
                      >
                        <SelectTrigger data-testid="select-fee-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Fee</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.processingFeeType !== "none" && (
                      <div className="space-y-2">
                        <Label>
                          Fee Value {formData.processingFeeType === "percentage" ? "(%)" : "(R)"}
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.processingFeeValue}
                          onChange={(e) => setFormData({ ...formData, processingFeeValue: e.target.value })}
                          placeholder={formData.processingFeeType === "percentage" ? "e.g., 2.5" : "e.g., 10.00"}
                          data-testid="input-fee-value"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      data-testid="switch-active"
                    />
                    <Label>Active</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      className="w-20"
                      data-testid="input-display-order"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingSetting
                      ? "Update"
                      : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : settings && settings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {settings.map((setting) => {
              const Icon = getMethodIcon(setting.methodType);
              return (
                <Card 
                  key={setting.id} 
                  className={!setting.isActive ? "opacity-60" : ""}
                  data-testid={`card-payment-method-${setting.id}`}
                >
                  <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{setting.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {getMethodLabel(setting.methodType)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={setting.isActive ?? false}
                        onCheckedChange={() => toggleActive(setting)}
                        data-testid={`switch-active-${setting.id}`}
                      />
                      <Badge variant={setting.isActive ? "default" : "secondary"}>
                        {setting.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {setting.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {setting.description}
                      </p>
                    )}
                    
                    {setting.methodType === "bank_transfer" && setting.bankName && (
                      <div className="text-sm space-y-1 bg-muted/50 p-3 rounded-md mb-4">
                        <p><span className="text-muted-foreground">Bank:</span> {setting.bankName}</p>
                        {setting.accountName && (
                          <p><span className="text-muted-foreground">Account:</span> {setting.accountName}</p>
                        )}
                        {setting.accountNumber && (
                          <p><span className="text-muted-foreground">Number:</span> {setting.accountNumber}</p>
                        )}
                      </div>
                    )}

                    {setting.methodType === "stripe" && (
                      <div className="flex items-center gap-2 mb-4">
                        {setting.gatewayEnabled ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Stripe Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline">Stripe Not Configured</Badge>
                        )}
                        {setting.gatewayEnabled && setting.gatewayTestMode && (
                          <Badge variant="secondary">Test Mode</Badge>
                        )}
                      </div>
                    )}

                    {setting.processingFeeType && setting.processingFeeType !== "none" && (
                      <div className="text-sm mb-4">
                        <span className="text-muted-foreground">Processing Fee: </span>
                        {setting.processingFeeType === "percentage"
                          ? `${setting.processingFeeValue}%`
                          : `R ${setting.processingFeeValue}`}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(setting)}
                        data-testid={`button-edit-${setting.id}`}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this payment method?")) {
                            deleteMutation.mutate(setting.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-delete-${setting.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Payment Methods</h3>
              <p className="text-muted-foreground mb-4">
                Add your first payment method to enable checkout.
              </p>
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
