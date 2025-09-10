// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  // simple check: is there a token?
  const token = localStorage.getItem("access_token");

  if (!token) {
    // not logged in → go to login page
    return <Navigate to="/login" replace />;
  }

  // logged in → render child
  return children;
};

export default PrivateRoute;
