// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../contexts/AuthContext"; // Make sure User type is exported from AuthContext

interface ProtectedRouteProps {
  // This prop will be an array of roles that are allowed to access the route
  allowedRoles?: User["role"][];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  // 1. Show a loading state while user auth is being verified
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Loading...
      </div>
    );
  }

  // 2. If user is not logged in, redirect them to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If user is logged in, check their role
  // Admins are always allowed
  const isAuthorized =
    user.role === "admin" || !allowedRoles || allowedRoles.includes(user.role);

  // If authorized, render the child routes. Otherwise, redirect to the home page.
  // A dedicated "/unauthorized" page would be even better.
  return isAuthorized ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
