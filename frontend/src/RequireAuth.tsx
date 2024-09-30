import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect to login page if no token is found
    }
  }, [navigate]);

  // Render the protected page if authenticated (if token is present)
  return <>{children}</>;
};

export default RequireAuth;
