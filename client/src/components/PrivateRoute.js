import React from "react";

import { Navigate } from "react-router-dom";
import { useAuthentication } from "../components/context/AuthenticationContext";

export default function PrivateRoute({ children }) {
  const { currentUser } = useAuthentication();

  return currentUser ? children : <Navigate to="/about" />;
}
