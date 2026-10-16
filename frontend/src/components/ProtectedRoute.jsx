
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ allowedRoles }) {
  const { user } = useSelector((state) => state.auth);

  // Not logged in? Go to login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role not allowed? Go to dashboard.
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
