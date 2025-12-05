import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);

  const location = useLocation();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLogged(true);
      } else {
        setIsLogged(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null; // evita loops

  if (!isLogged) {
    // guardamos la ruta deseada
    localStorage.setItem(
      "redirectAfterLogin",
      location.pathname + location.search
    );

    return <Navigate to="/login" replace />;
  }

  // 🔹 si el usuario está logueado, chequeamos si hay redirección pendiente
  const redirectUrl = localStorage.getItem("redirectAfterLogin");
  if (redirectUrl) {
    localStorage.removeItem("redirectAfterLogin");
    return <Navigate to={redirectUrl} replace />;
  }

  return children;
}
