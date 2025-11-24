import React, { useEffect, useState, useCallback } from "react";
import "./notificaciones.css";
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { socketconnection, socketnotificationlisten, registerNotificationHandler } from '../../utils/socket';

const API_URL = import.meta.env.VITE_API_URL;

// ---------------- ICONOS ----------------
function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getFirebaseToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };

  const fetchNotificaciones = useCallback(async () => {
    try {
      const token = await getFirebaseToken();
      if (!token) return;

      const res = await fetch(`${API_URL}notificaciones/usuario`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      data.sort(
        (a, b) =>
          new Date(b.fecha_creacion).getTime() -
          new Date(a.fecha_creacion).getTime()
      );

      setNotificaciones(data);
    } catch (err) {
      console.error("Error al obtener notificaciones:", err);
    } finally {
      setLoading(false);
    }
  }, []);

const verPublicacion = async (noti) => {
  const token = await getFirebaseToken();
  if (!token) return;

  // Primero marcar como leída
  await fetch(`${API_URL}notificaciones/leida/${noti.id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });

  // Redirigir a la publicación
  if (noti.id_publicacion) {
    navigate(`/publicacion/${noti.id_publicacion}`);
  }

  fetchNotificaciones();
};


  const eliminarNotificacion = async (id) => {
    const token = await getFirebaseToken();
    if (!token) return;

    await fetch(`${API_URL}notificaciones/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNotificaciones();
  };

  useEffect(() => {
    fetchNotificaciones();
    const interval = setInterval(fetchNotificaciones, 20000);
    return () => clearInterval(interval);
  }, [fetchNotificaciones]);

  // Conexión en tiempo real: si el usuario está logueado abrimos sockets
  useEffect(() => {
    let unsubscribeHandler = null;
    const auth = getAuth();
    const remove = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      // iniciar conexión y listener de notificaciones
      socketconnection(user);
      socketnotificationlisten(user.uid);

      // registrar handler que inserta la notificación al inicio
      unsubscribeHandler = registerNotificationHandler((data) => {
        setNotificaciones(prev => {
          const arr = [data, ...(prev || [])];
          arr.sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
          return arr;
        });
      });
    });

    return () => {
      remove();
      if (unsubscribeHandler) unsubscribeHandler();
    };
  }, []);

  if (loading) return <p className="noti-loading">Cargando notificaciones...</p>;

  return (
    <div className="noti-container">
      <h2 className="noti-title">Notificaciones</h2>

      {notificaciones.length === 0 ? (
        <p className="noti-vacio">No tenés notificaciones</p>
      ) : (
        <ul className="noti-list">
          {notificaciones.map((n) => (
            <li
              key={n.id}
              className={`noti-item ${n.leido ? "noti-leida" : "noti-nueva"}`}
            >
              <div className="noti-info">
                <h4 className="noti-titulo">{n.titulo}</h4>
                <p className="noti-descripcion">{n.descripcion}</p>
                <small className="noti-fecha">
                  {new Date(n.fecha_creacion).toLocaleString()}
                </small>
              </div>

              <div className="noti-buttons">
                {!n.leido && (
                  <button className="noti-btn-icon" onClick={() => verPublicacion(n)}>
                    <EyeIcon />
                  </button>

                )}
                <button className="noti-btn-icon remove" onClick={() => eliminarNotificacion(n.id)}>
                  <TrashIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
