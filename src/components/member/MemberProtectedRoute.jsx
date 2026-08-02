import { Navigate, useLocation } from "react-router-dom";
import { useMemberAuth } from "@/contexts/MemberAuthContext";

/**
 * MemberProtectedRoute — guards /member/* using the MEMBER session only.
 *
 * The admin `ProtectedRoute` reads the shared admin session, which is why an
 * admin login used to unlock member screens. This one consults nothing but
 * `MemberAuthContext`, and sends unauthenticated visitors to the member
 * sign-in rather than the admin one.
 */
export default function MemberProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useMemberAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/member/login" state={{ from: location }} replace />;
  }

  return children;
}
