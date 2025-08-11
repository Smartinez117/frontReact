import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Notificaciones({ soloNoLeidas = false }) {
  const [idUsuario, setIdUsuario] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener usuario Firebase
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIdUsuario(user.uid);
      } else {
        setError("No hay usuario autenticado");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Cargar notificaciones cuando se tenga idUsuario
  useEffect(() => {
    if (!idUsuario) return;

    const fetchNotificaciones = async () => {
      try {
        setLoading(true);

        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
          throw new Error("Usuario no autenticado");
        }

        const token = await currentUser.getIdToken();

        const response = await fetch(
          `http://localhost:5000/notificaciones/usuario`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al obtener notificaciones");
        }

        const data = await response.json();
        setNotificaciones(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificaciones();
  }, [idUsuario, soloNoLeidas]);

  if (loading) return <p>Cargando notificaciones...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (notificaciones.length === 0) return <p>No hay notificaciones.</p>;

  return (
    <div>
      <h2>Notificaciones</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {notificaciones.map((n) => (
          <li
            key={n.id}
            style={{
              fontWeight: n.leido ? "normal" : "bold",
              backgroundColor: n.leido ? "#f5f5f5" : "#e3f2fd",
              padding: "12px",
              marginBottom: "6px",
              borderRadius: "5px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <strong>{n.titulo}</strong>
            <p>{n.descripcion}</p>
            <small>
              {new Date(n.fecha_creacion).toLocaleString()} — {n.tiempo_pasado}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}

