import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  LayoutDashboard, CalendarDays, Heart, User, Wallet, ClipboardList,
  Users, Briefcase, CreditCard, FileBarChart, CalendarCheck,
} from "lucide-react";

import { PublicLayout } from "@/components/PublicLayout";
import { DashboardLayout } from "@/components/DashboardLayout";

import Index from "./pages/Index.tsx";
import Explore from "./pages/Explore.tsx";
import CreatorProfile from "./pages/CreatorProfile.tsx";
import Booking from "./pages/Booking.tsx";
import Payment from "./pages/Payment.tsx";
import Auth from "./pages/Auth.tsx";
import UserDashboardRoutes from "./pages/dashboard/UserDashboard.tsx";
import CreatorDashboardRoutes from "./pages/dashboard/CreatorDashboard.tsx";
import AdminDashboardRoutes from "./pages/dashboard/AdminDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const userItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Bookings", url: "/dashboard/bookings", icon: CalendarDays },
  { title: "Saved Creators", url: "/dashboard/saved", icon: Heart },
  { title: "Profile", url: "/dashboard/profile", icon: User },
];

const creatorItems = [
  { title: "Dashboard", url: "/creator-dashboard", icon: LayoutDashboard },
  { title: "Schedule", url: "/creator-dashboard/schedule", icon: CalendarDays },
  { title: "Bookings", url: "/creator-dashboard/bookings", icon: ClipboardList },
  { title: "Earnings", url: "/creator-dashboard/earnings", icon: Wallet },
  { title: "Profile", url: "/creator-dashboard/profile", icon: User },
];

const adminItems = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Creators", url: "/admin/creators", icon: Briefcase },
  { title: "Payments", url: "/admin/payments", icon: CreditCard },
  { title: "Bookings", url: "/admin/bookings", icon: CalendarCheck },
  { title: "Reports", url: "/admin/reports", icon: FileBarChart },
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/creator/:id" element={<CreatorProfile />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/payment" element={<Payment />} />
          </Route>

          {/* Auth (no public layout) */}
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />

          {/* User dashboard */}
          <Route element={<DashboardLayout items={userItems} brandLabel="User" title="Dashboard" />}>
            <Route path="/dashboard/*" element={<UserDashboardRoutes />} />
          </Route>

          {/* Creator dashboard */}
          <Route element={<DashboardLayout items={creatorItems} brandLabel="Creator" title="Creator Studio" />}>
            <Route path="/creator-dashboard/*" element={<CreatorDashboardRoutes />} />
          </Route>

          {/* Admin dashboard */}
          <Route element={<DashboardLayout items={adminItems} brandLabel="Admin" title="Admin Console" />}>
            <Route path="/admin/*" element={<AdminDashboardRoutes />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
