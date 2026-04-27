import { Navigate, useLocation } from "react-router-dom";
import { authService } from "@/services/backendService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "user" | "creator" | "admin";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const location = useLocation();

  // Check if token exists
  if (!authService.isLoggedIn()) {
    // Redirect to login, remember where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole && requiredRole !== "admin") {
    const user = authService.getStoredUser();
    if (user && user.role !== requiredRole) {
      // Wrong role — redirect to their correct dashboard
      const redirect = user.role === "creator" ? "/creator-dashboard" : "/dashboard";
      return <Navigate to={redirect} replace />;
    }
  }

  return <>{children}</>;
}