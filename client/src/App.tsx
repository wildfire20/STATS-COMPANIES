import { useEffect, useRef } from "react";
import { ClerkProvider, Show, SignIn, SignUp, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, Redirect, Router as WouterRouter, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Shop from "@/pages/Shop";
import Services from "@/pages/Services";
import Portfolio from "@/pages/Portfolio";
import Bookings from "@/pages/Bookings";
import Quote from "@/pages/Quote";
import Promotions from "@/pages/Promotions";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import EquipmentRental from "@/pages/EquipmentRental";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/admin/Dashboard";
import ServicesManagement from "@/pages/admin/ServicesManagement";
import ServicePlansManagement from "@/pages/admin/ServicePlansManagement";
import ProductsManagement from "@/pages/admin/ProductsManagement";
import PromotionsManagement from "@/pages/admin/PromotionsManagement";
import OrdersManagement from "@/pages/admin/OrdersManagement";
import BookingsManagement from "@/pages/admin/BookingsManagement";
import QuotesManagement from "@/pages/admin/QuotesManagement";
import PortfolioManagement from "@/pages/admin/PortfolioManagement";
import TestimonialsManagement from "@/pages/admin/TestimonialsManagement";
import TeamManagement from "@/pages/admin/TeamManagement";
import PaymentSettingsManagement from "@/pages/admin/PaymentSettingsManagement";
import ContactSettingsManagement from "@/pages/admin/ContactSettingsManagement";
import EquipmentManagement from "@/pages/admin/EquipmentManagement";
import DemoAccountsManagement from "@/pages/admin/DemoAccountsManagement";
import ClientDashboard from "@/pages/client/Dashboard";
import ClientOrders from "@/pages/client/Orders";
import ClientBookings from "@/pages/client/Bookings";
import ClientInvoices from "@/pages/client/Invoices";
import ClientProfile from "@/pages/client/Profile";
import ClientAddresses from "@/pages/client/Addresses";

const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
function stripBase(path: string): string { return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path; }
if (!clerkPubKey) throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
const clerkAppearance = {
  theme: shadcn,
  options: { logoPlacement: "inside" as const, logoLinkUrl: basePath || "/", logoImageUrl: `${window.location.origin}${basePath}/logo.svg` },
  variables: { colorPrimary: "#1e3a5f", colorForeground: "#0f172a", colorMutedForeground: "#475569", colorDanger: "#dc2626", colorBackground: "#ffffff", colorInput: "#f8fafc", colorInputForeground: "#0f172a", colorNeutral: "#cbd5e1", fontFamily: "Inter, sans-serif", borderRadius: "0.75rem" },
  elements: { rootBox: "w-full flex justify-center", cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl", card: "!shadow-none !border-0 !bg-transparent !rounded-none", footer: "!shadow-none !border-0 !bg-transparent !rounded-none", headerTitle: "text-slate-900", headerSubtitle: "text-slate-600", socialButtonsBlockButtonText: "text-slate-700", formFieldLabel: "text-slate-700", footerActionLink: "text-primary", footerActionText: "text-slate-600", dividerText: "text-slate-500", identityPreviewEditButton: "text-primary", formFieldSuccessText: "text-emerald-700", alertText: "text-slate-700", logoBox: "mb-4", logoImage: "h-14 w-auto", socialButtonsBlockButton: "border-slate-200 hover:bg-slate-50", formButtonPrimary: "bg-primary hover:bg-primary/90", formFieldInput: "bg-slate-50 text-slate-900 border-slate-300", footerAction: "bg-slate-50", dividerLine: "bg-slate-200", alert: "bg-slate-50 border-slate-200", otpCodeFieldInput: "bg-slate-50 text-slate-900", formFieldRow: "gap-2", main: "gap-4" },
};
function SignInPage() { return <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div>; }
function SignUpPage() { return <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div>; }
function HomeRedirect() {
  const showPublicSite = new URLSearchParams(window.location.search).get("view") === "site";
  if (showPublicSite) {
    return <Home />;
  }

  return <>
    <Show when="signed-in"><Redirect to="/dashboard" /></Show>
    <Show when="signed-out"><Home /></Show>
  </>;
}
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk(); const previous = useRef<string | null | undefined>(undefined);
  useEffect(() => addListener(({ user }) => { const id = user?.id ?? null; if (previous.current !== undefined && previous.current !== id) queryClient.clear(); previous.current = id; }), [addListener]);
  return null;
}
function Router() {
  return <Switch>
    <Route path="/" component={HomeRedirect} /><Route path="/about" component={About} /><Route path="/shop" component={Shop} /><Route path="/services" component={Services} /><Route path="/portfolio" component={Portfolio} /><Route path="/bookings" component={Bookings} /><Route path="/quote" component={Quote} /><Route path="/promotions" component={Promotions} /><Route path="/equipment" component={EquipmentRental} /><Route path="/cart" component={Cart} /><Route path="/checkout" component={Checkout} />
    <Route path="/admin" component={AdminDashboard} /><Route path="/admin/services" component={ServicesManagement} /><Route path="/admin/plans" component={ServicePlansManagement} /><Route path="/admin/products" component={ProductsManagement} /><Route path="/admin/promotions" component={PromotionsManagement} /><Route path="/admin/orders" component={OrdersManagement} /><Route path="/admin/bookings" component={BookingsManagement} /><Route path="/admin/quotes" component={QuotesManagement} /><Route path="/admin/portfolio" component={PortfolioManagement} /><Route path="/admin/testimonials" component={TestimonialsManagement} /><Route path="/admin/team" component={TeamManagement} /><Route path="/admin/payments" component={PaymentSettingsManagement} /><Route path="/admin/contact" component={ContactSettingsManagement} /><Route path="/admin/equipment" component={EquipmentManagement} /><Route path="/admin/demo-accounts" component={DemoAccountsManagement} />
    <Route path="/dashboard" component={ClientDashboard} /><Route path="/dashboard/orders/:id" component={ClientOrders} /><Route path="/dashboard/orders" component={ClientOrders} /><Route path="/dashboard/bookings" component={ClientBookings} /><Route path="/dashboard/invoices" component={ClientInvoices} /><Route path="/dashboard/profile" component={ClientProfile} /><Route path="/dashboard/addresses" component={ClientAddresses} /><Route component={NotFound} />
  </Switch>;
}
function MainLayout({ children }: { children: React.ReactNode }) { return <div className="min-h-screen flex flex-col"><Header /><main className="flex-1">{children}</main><Footer /></div>; }
function AppRoutes() {
  return <Switch><Route path="/sign-in/*?" component={SignInPage} /><Route path="/sign-up/*?" component={SignUpPage} /><Route path="/admin/:rest*">{() => <Router />}</Route><Route path="/admin">{() => <Router />}</Route><Route path="/dashboard/:rest*">{() => <Router />}</Route><Route path="/dashboard">{() => <Router />}</Route><Route>{() => <MainLayout><Router /></MainLayout>}</Route></Switch>;
}
function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return <ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl} appearance={clerkAppearance} signInUrl={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} localization={{ signIn: { start: { title: "Welcome back", subtitle: "Sign in to access your account" } }, signUp: { start: { title: "Create your account", subtitle: "Get started today" } } }} routerPush={(to) => setLocation(stripBase(to))} routerReplace={(to) => setLocation(stripBase(to), { replace: true })}><QueryClientProvider client={queryClient}><ClerkQueryClientCacheInvalidator /><TooltipProvider><CartProvider><AppRoutes /><CartDrawer /><WhatsAppButton /><Toaster /></CartProvider></TooltipProvider></QueryClientProvider></ClerkProvider>;
}
export default function App() {
  return <WouterRouter base={basePath}><ClerkProviderWithRoutes /></WouterRouter>;
}