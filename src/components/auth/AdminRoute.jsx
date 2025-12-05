import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      try {
        const tokenResult = await user.getIdTokenResult();
        const isAdmin = !!tokenResult.claims.admin;

        setAllowed(isAdmin);
      } catch (err) {
        console.error("Error leyendo claims admin:", err);
        setAllowed(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null; // o spinner

  if (!allowed) return <Navigate to="*" replace />;


  return children;
}
