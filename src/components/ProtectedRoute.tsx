import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { AuthRole } from "../lib/auth";

type ProtectedRouteProps = {
  allowedRoles?: AuthRole[];
};

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, role } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to appropriate home based on role
    if (role === "docente") {
      return <Navigate to="/docente" replace />;
    }
    if (role === "estudiante") {
      return <Navigate to="/estudiante" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
