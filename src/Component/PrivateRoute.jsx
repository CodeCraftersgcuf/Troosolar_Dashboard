import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { loginPathWithReturn } from "../utils/authRedirect";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("access_token");

  if (!token) {
    const returnPath = `${location.pathname}${location.search}`;
    return (
      <Navigate to={loginPathWithReturn(returnPath)} replace state={{ from: location }} />
    );
  }

  return children;
};

export default PrivateRoute;
