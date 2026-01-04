import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, ArrowLeft, Monitor } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function DemoLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      toast({
        title: "Access Code Required",
        description: "Please enter your demo access code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/demo/login", { accessCode: accessCode.trim() });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Welcome to the Demo!",
          description: `Hello ${data.name}, you can now explore the admin dashboard.`,
        });
        setLocation("/admin");
      }
    } catch (error: any) {
      toast({
        title: "Invalid Access Code",
        description: error.message || "The access code is invalid or has expired. Please contact STATS Companies for a new code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Monitor className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">STATS Companies</h1>
          <p className="text-muted-foreground mt-2">Admin Dashboard Demo</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Demo Access
            </CardTitle>
            <CardDescription>
              Enter your demo access code to explore the STATS Companies admin dashboard and see all the features available for your business.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessCode">Access Code</Label>
                <Input
                  id="accessCode"
                  type="text"
                  placeholder="Enter your 8-character code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="text-center text-lg tracking-widest font-mono uppercase"
                  data-testid="input-demo-access-code"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || accessCode.length < 8}
                data-testid="button-demo-login"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Access Demo
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium text-sm mb-2">What You'll Explore:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complete admin dashboard with analytics</li>
                <li>• Product and service management</li>
                <li>• Order and booking tracking</li>
                <li>• Customer management system</li>
                <li>• Equipment rental management</li>
                <li>• Marketing and promotions tools</li>
              </ul>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Demo access is read-only and expires automatically.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                data-testid="button-back-home"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Website
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an access code?{" "}
            <a 
              href="mailto:info@statscompanies.co.za?subject=Demo Access Request"
              className="text-primary hover:underline"
            >
              Contact us
            </a>{" "}
            to request demo access.
          </p>
        </div>
      </div>
    </div>
  );
}
