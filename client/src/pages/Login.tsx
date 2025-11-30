import { useState } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, X, ArrowLeft, Phone } from "lucide-react";
import { SiGoogle, SiApple } from "react-icons/si";

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 21 21" className={className} aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
      <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
    </svg>
  );
}

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  marketingOptIn: z.boolean().default(false),
});

type EmailFormData = z.infer<typeof emailSchema>;
type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

type Step = "initial" | "login" | "register";

export default function Login() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("initial");
  const [email, setEmail] = useState("");

  const params = new URLSearchParams(searchString);
  const redirectPath = params.get("redirect") || "/";

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      marketingOptIn: false,
    },
  });

  const handleClose = () => {
    setLocation("/");
  };

  const handleBack = () => {
    setStep("initial");
    setEmail("");
  };

  const handleSocialLogin = (provider: string) => {
    window.location.href = "/api/login";
  };

  const handlePhoneLogin = () => {
    toast({
      title: "Coming Soon",
      description: "Phone login is coming soon. Please use email or social login for now.",
    });
  };

  const handleEmailContinue = async (data: EmailFormData) => {
    setIsLoading(true);
    setEmail(data.email);
    
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      const result = await response.json();
      
      if (result.exists) {
        loginForm.setValue("email", data.email);
        setStep("login");
      } else {
        registerForm.setValue("email", data.email);
        setStep("register");
      }
    } catch (error) {
      registerForm.setValue("email", data.email);
      setStep("register");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/local/login", data);
      const result = await response.json();
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
      });
      if (result.user?.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation(redirectPath.startsWith("/dashboard") ? redirectPath : "/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/local/register", data);
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Account created!",
        description: "Welcome to STATS Companies. Check out your new dashboard!",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md relative shadow-lg">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-1 rounded-full hover-elevate text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-close-login"
        >
          <X className="h-5 w-5" />
        </button>

        <CardContent className="pt-12 pb-8 px-8">
          {step === "initial" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-login-title">
                  Log in or sign up
                </h1>
                <p className="text-muted-foreground text-sm">
                  Access your account to track orders, manage bookings, and more.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start px-4 gap-3 font-normal"
                  onClick={() => handleSocialLogin("google")}
                  data-testid="button-login-google"
                >
                  <SiGoogle className="h-5 w-5 text-[#4285F4]" />
                  <span>Continue with Google</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12 justify-start px-4 gap-3 font-normal"
                  onClick={() => handleSocialLogin("apple")}
                  data-testid="button-login-apple"
                >
                  <SiApple className="h-5 w-5" />
                  <span>Continue with Apple</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12 justify-start px-4 gap-3 font-normal"
                  onClick={() => handleSocialLogin("microsoft")}
                  data-testid="button-login-microsoft"
                >
                  <MicrosoftIcon className="h-5 w-5" />
                  <span>Continue with Microsoft</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12 justify-start px-4 gap-3 font-normal"
                  onClick={handlePhoneLogin}
                  data-testid="button-login-phone"
                >
                  <Phone className="h-5 w-5" />
                  <span>Continue with phone</span>
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">OR</span>
                </div>
              </div>

              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(handleEmailContinue)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Email address"
                            className="h-12"
                            data-testid="input-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-12"
                    disabled={isLoading}
                    data-testid="button-continue"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          )}

          {step === "login" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBack}
                  className="p-1 rounded-full hover-elevate text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </div>

              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            className="h-12"
                            autoFocus
                            data-testid="input-login-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-12"
                    disabled={isLoading}
                    data-testid="button-login-submit"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="text-center">
                <button
                  onClick={() => {
                    registerForm.setValue("email", email);
                    setStep("register");
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
                  data-testid="button-create-account"
                >
                  Create a new account instead
                </button>
              </div>
            </div>
          )}

          {step === "register" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBack}
                  className="p-1 rounded-full hover-elevate text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </div>

              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={registerForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              className="h-11"
                              autoFocus
                              data-testid="input-register-firstname"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              className="h-11"
                              data-testid="input-register-lastname"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+27 12 345 6789"
                            className="h-11"
                            data-testid="input-register-phone"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Create a password (min 6 chars)"
                            className="h-11"
                            data-testid="input-register-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="marketingOptIn"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-marketing"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal text-muted-foreground">
                            I'd like to receive promotions and updates via email
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12"
                    disabled={isLoading}
                    data-testid="button-register-submit"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="text-center">
                <button
                  onClick={() => {
                    loginForm.setValue("email", email);
                    setStep("login");
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
                  data-testid="button-signin-instead"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
