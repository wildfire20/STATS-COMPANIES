import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
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
import Login from "@/pages/Login";
import EquipmentRental from "@/pages/EquipmentRental";
import NotFound from "@/pages/not-found";

import AdminDashboard from "@/pages/admin/Dashboard";
import ServicesManagement from "@/pages/admin/ServicesManagement";
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

import ClientDashboard from "@/pages/client/Dashboard";
import ClientOrders from "@/pages/client/Orders";
import ClientBookings from "@/pages/client/Bookings";
import ClientInvoices from "@/pages/client/Invoices";
import ClientProfile from "@/pages/client/Profile";
import ClientAddresses from "@/pages/client/Addresses";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/shop" component={Shop} />
      <Route path="/services" component={Services} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/quote" component={Quote} />
      <Route path="/promotions" component={Promotions} />
      <Route path="/equipment" component={EquipmentRental} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/services" component={ServicesManagement} />
      <Route path="/admin/products" component={ProductsManagement} />
      <Route path="/admin/promotions" component={PromotionsManagement} />
      <Route path="/admin/orders" component={OrdersManagement} />
      <Route path="/admin/bookings" component={BookingsManagement} />
      <Route path="/admin/quotes" component={QuotesManagement} />
      <Route path="/admin/portfolio" component={PortfolioManagement} />
      <Route path="/admin/testimonials" component={TestimonialsManagement} />
      <Route path="/admin/team" component={TeamManagement} />
      <Route path="/admin/payments" component={PaymentSettingsManagement} />
      <Route path="/admin/contact" component={ContactSettingsManagement} />
      <Route path="/admin/equipment" component={EquipmentManagement} />

      <Route path="/dashboard" component={ClientDashboard} />
      <Route path="/dashboard/orders/:id" component={ClientOrders} />
      <Route path="/dashboard/orders" component={ClientOrders} />
      <Route path="/dashboard/bookings" component={ClientBookings} />
      <Route path="/dashboard/invoices" component={ClientInvoices} />
      <Route path="/dashboard/profile" component={ClientProfile} />
      <Route path="/dashboard/addresses" component={ClientAddresses} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/admin/:rest*">
              {() => <Router />}
            </Route>
            <Route path="/admin">
              {() => <Router />}
            </Route>
            <Route path="/dashboard/:rest*">
              {() => <Router />}
            </Route>
            <Route path="/dashboard">
              {() => <Router />}
            </Route>
            <Route>
              {() => (
                <MainLayout>
                  <Router />
                </MainLayout>
              )}
            </Route>
          </Switch>
          <CartDrawer />
          <WhatsAppButton />
          <Toaster />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
