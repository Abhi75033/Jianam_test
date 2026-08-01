import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Send members back to the member sign-in, not the admin one. Previously
    // every protected route redirected to /login, so a signed-out member
    // landed on the admin portal.
    const loginPath = location.pathname.startsWith("/member") ? "/member/login" : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }
  return children;
}
