import { useState, useEffect, useRef } from "react";
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
import { Loader2, X, ArrowLeft, Phone, Smartphone } from "lucide-react";
import { SiGoogle, SiApple } from "react-icons/si";
import statsLogo from "@assets/stats_business_card_1765625638234.png";

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

const phoneSchema = z.object({
  phone: z.string().min(9, "Please enter a valid phone number"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const phoneRegisterSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type EmailFormData = z.infer<typeof emailSchema>;
type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type PhoneFormData = z.infer<typeof phoneSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type PhoneRegisterFormData = z.infer<typeof phoneRegisterSchema>;

type Step = "initial" | "login" | "register" | "phone" | "phone-verify" | "phone-register";

export default function Login() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("initial");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isNewPhoneUser, setIsNewPhoneUser] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const params = new URLSearchParams(searchString);
  const redirectPath = params.get("redirect") || "/";

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

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

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
    },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const phoneRegisterForm = useForm<PhoneRegisterFormData>({
    resolver: zodResolver(phoneRegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  const handleClose = () => {
    setLocation("/");
  };

  const handleBack = () => {
    if (step === "phone-verify") {
      setStep("phone");
      otpForm.reset();
    } else if (step === "phone-register") {
      setStep("phone-verify");
      phoneRegisterForm.reset();
    } else if (step === "phone") {
      setStep("initial");
      setPhoneNumber("");
      phoneForm.reset();
    } else {
      setStep("initial");
      setEmail("");
    }
  };

  const handleSocialLogin = (provider: string) => {
    window.location.href = "/api/login";
  };

  const handlePhoneLogin = () => {
    toast({
      title: "Coming Soon",
      description: "Phone number login will be available soon. Please use email or social login for now.",
    });
  };

  const handleSendOtp = async (data: PhoneFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: data.phone }),
      });
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to send OTP");
      }
      
      setPhoneNumber(result.phone || data.phone);
      setResendTimer(60);
      setStep("phone-verify");
      toast({
        title: "OTP Sent",
        description: "A 6-digit code has been sent to your phone.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to resend OTP");
      }
      
      setResendTimer(60);
      otpForm.reset();
      toast({
        title: "OTP Resent",
        description: "A new 6-digit code has been sent to your phone.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (data: OtpFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phoneNumber, 
          otp: data.otp 
        }),
      });
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Invalid OTP");
      }
      
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      if (result.isNewUser) {
        setIsNewPhoneUser(true);
        setStep("phone-register");
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
        if (result.user?.role === "admin") {
          setLocation("/admin");
        } else {
          setLocation(redirectPath.startsWith("/dashboard") ? redirectPath : "/dashboard");
        }
      }
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneRegister = async (data: PhoneRegisterFormData) => {
    setIsLoading(true);
    try {
      await apiRequest("PUT", "/api/client/profile", {
        firstName: data.firstName,
        lastName: data.lastName,
      });
      
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Account created!",
        description: "Welcome to STATS Companies. Check out your new dashboard!",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
          className="absolute right-4 top-4 left-auto p-2 rounded-full hover:bg-muted transition-colors z-10"
          data-testid="button-close-login"
          type="button"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
        <CardContent className="pt-8 pb-8 px-8">
          {step === "initial" && (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <img 
                  src={statsLogo} 
                  alt="STATS Companies" 
                  className="h-16 w-auto mx-auto object-contain"
                  data-testid="img-stats-logo"
                />
                <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-login-title">
                  Log in or sign up
                </h1>
                <p className="text-muted-foreground text-sm">
                  Access your account to track orders, manage bookings, and more.
                </p>
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
                            autoFocus
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  className="h-12 flex items-center justify-center"
                  onClick={() => handleSocialLogin("google")}
                  aria-label="Continue with Google"
                  data-testid="button-login-google"
                >
                  <SiGoogle className="h-5 w-5 text-[#4285F4]" />
                  <span className="sr-only">Google</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-12 flex items-center justify-center"
                  onClick={() => handleSocialLogin("apple")}
                  aria-label="Continue with Apple"
                  data-testid="button-login-apple"
                >
                  <SiApple className="h-5 w-5" />
                  <span className="sr-only">Apple</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-12 flex items-center justify-center"
                  onClick={() => handleSocialLogin("microsoft")}
                  aria-label="Continue with Microsoft"
                  data-testid="button-login-microsoft"
                >
                  <MicrosoftIcon className="h-5 w-5" />
                  <span className="sr-only">Microsoft</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-12 flex items-center justify-center"
                  onClick={handlePhoneLogin}
                  aria-label="Continue with phone"
                  data-testid="button-login-phone"
                >
                  <Phone className="h-5 w-5" />
                  <span className="sr-only">Phone</span>
                </Button>
              </div>
            </div>
          )}

          {step === "login" && (
            <div className="space-y-6">
              <div className="text-center mb-2">
                <img 
                  src={statsLogo} 
                  alt="STATS Companies" 
                  className="h-12 w-auto mx-auto object-contain"
                />
              </div>
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
                    name="email"
                    render={({ field }) => (
                      <input type="hidden" {...field} />
                    )}
                  />
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
              <div className="text-center mb-2">
                <img 
                  src={statsLogo} 
                  alt="STATS Companies" 
                  className="h-12 w-auto mx-auto object-contain"
                />
              </div>
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

          {step === "phone" && (
            <div className="space-y-6">
              <div className="text-center mb-2">
                <img 
                  src={statsLogo} 
                  alt="STATS Companies" 
                  className="h-12 w-auto mx-auto object-contain"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBack}
                  className="p-1 rounded-full hover-elevate text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-back-phone"
                  type="button"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">Sign in with phone</h1>
                  <p className="text-sm text-muted-foreground">Enter your South African mobile number</p>
                </div>
              </div>

              <Form {...phoneForm}>
                <form onSubmit={phoneForm.handleSubmit(handleSendOtp)} className="space-y-4">
                  <FormField
                    control={phoneForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="082 123 4567"
                              className="h-12 pl-10"
                              autoFocus
                              data-testid="input-phone"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          We'll send you a 6-digit verification code
                        </p>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-12"
                    disabled={isLoading}
                    data-testid="button-send-otp"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending code...
                      </>
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="text-center">
                <button
                  onClick={() => setStep("initial")}
                  className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
                  data-testid="button-use-email"
                  type="button"
                >
                  Use email instead
                </button>
              </div>
            </div>
          )}

          {step === "phone-verify" && (
            <div className="space-y-6">
              <div className="text-center mb-2">
                <img 
                  src={statsLogo} 
                  alt="STATS Companies" 
                  className="h-12 w-auto mx-auto object-contain"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBack}
                  className="p-1 rounded-full hover-elevate text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-back-verify"
                  type="button"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">Enter verification code</h1>
                  <p className="text-sm text-muted-foreground">Sent to {phoneNumber}</p>
                </div>
              </div>

              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000000"
                            className="h-14 text-center text-2xl tracking-[0.5em] font-mono"
                            maxLength={6}
                            autoFocus
                            inputMode="numeric"
                            pattern="[0-9]*"
                            data-testid="input-otp"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                              field.onChange(value);
                            }}
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
                    data-testid="button-verify-otp"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Continue"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || isLoading}
                  className="text-sm text-muted-foreground hover:text-foreground underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-resend-otp"
                  type="button"
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
                </button>
              </div>
            </div>
          )}

          {step === "phone-register" && (
            <div className="space-y-6">
              <div className="text-center mb-2">
                <img 
                  src={statsLogo} 
                  alt="STATS Companies" 
                  className="h-12 w-auto mx-auto object-contain"
                />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-semibold tracking-tight">Complete your profile</h1>
                <p className="text-sm text-muted-foreground">Tell us a bit about yourself</p>
              </div>

              <Form {...phoneRegisterForm}>
                <form onSubmit={phoneRegisterForm.handleSubmit(handlePhoneRegister)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={phoneRegisterForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              className="h-11"
                              autoFocus
                              data-testid="input-phone-register-firstname"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={phoneRegisterForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              className="h-11"
                              data-testid="input-phone-register-lastname"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12"
                    disabled={isLoading}
                    data-testid="button-phone-register-submit"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Complete Setup"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
