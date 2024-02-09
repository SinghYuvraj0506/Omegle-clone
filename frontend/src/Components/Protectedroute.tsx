import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  navigateCondition: boolean;
  toUrl: string;
  children: React.ReactNode;
}

const Protectedroute: React.FC<ProtectedRouteProps> = ({
  navigateCondition,
  toUrl,
  children,
}) => {
  if (navigateCondition) {
    return <Navigate to={toUrl} />;
  }

  return children;
};

export default Protectedroute;
