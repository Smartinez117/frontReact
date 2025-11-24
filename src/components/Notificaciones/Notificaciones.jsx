import React, { useEffect, useState, useCallback } from "react";
import "./notificaciones.css";
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { socketconnection, socketnotificationlisten, registerNotificationHandler } from '../../utils/socket';
import { Toaster, toast } from 'react-hot-toast'; // Agregamos Feedback visual

const API_URL = import.meta.env.VITE_API_URL;

// ---------------- ICONOS ----------------
function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
  );
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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

  // --- LÓGICA NUEVA: Responder Solicitud ---
  const responderSolicitud = async (idNotificacion, idSolicitud, accion) => {
    const token = await getFirebaseToken();
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/api/contactar/${idSolicitud}/responder`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ accion })
        });

        if (!res.ok) throw new Error('Error al responder');

        const data = await res.json();

        if (accion === 'aceptar') {
            // data.dato_contacto viene del backend con el tel o email
            if (data.tipo_contacto === 'whatsapp') {
                 toast.success(`¡Aceptado! Su WhatsApp es: ${data.dato_contacto}`, { duration: 6000 });
                 // Opcional: abrir whatsapp directamente si quieres
            } else {
                 toast.success(`¡Aceptado! Su Email es: ${data.dato_contacto}`, { duration: 6000 });
            }
        } else {
            toast("Solicitud rechazada", { icon: '👋' });
        }

        await eliminarNotificacion(idNotificacion);
        
    } catch (error) {
        console.error(error);
        toast.error("Ocurrió un error al procesar la solicitud");
    }
  };

  const verPublicacion = async (noti) => {
    const token = await getFirebaseToken();
    if (!token) return;

    // Marcar como leída si no lo está
    if (!noti.leido) {
        await fetch(`${API_URL}notificaciones/leida/${noti.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        });
    }

    // Redirigir
    if (noti.id_publicacion) {
      navigate(`/publicacion/${noti.id_publicacion}`);
    }
    
    // Actualizar lista localmente para que se vea leída
    setNotificaciones(prev => prev.map(n => n.id === noti.id ? {...n, leido: true} : n));
  };

  const eliminarNotificacion = async (id) => {
    const token = await getFirebaseToken();
    if (!token) return;

    await fetch(`${API_URL}notificaciones/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    // Actualizamos estado local para que sea instantáneo
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    fetchNotificaciones();
    const interval = setInterval(fetchNotificaciones, 20000);
    return () => clearInterval(interval);
  }, [fetchNotificaciones]);

  // Sockets
  useEffect(() => {
    let unsubscribeHandler = null;
    const auth = getAuth();
    const remove = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      socketconnection(user);
      socketnotificationlisten(user.uid);

      unsubscribeHandler = registerNotificationHandler((data) => {
        setNotificaciones(prev => {
          const arr = [data, ...(prev || [])];
          arr.sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
          return arr;
        });
        toast('Nueva notificación', { icon: '🔔' });
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
      <Toaster />
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
                
                {/* --- MOSTRAR BOTONES SI ES SOLICITUD --- */}
                {n.tipo === 'solicitud_contacto' && (
                    <div className="noti-actions-row">
                        {/* IMPORTANTE: n.id_referencia debe venir del backend con el ID de la solicitud */}
                        <button 
                            className="btn-accept" 
                            onClick={() => responderSolicitud(n.id, n.id_referencia || n.id_publicacion, 'aceptar')}
                        >
                            <CheckIcon /> Aceptar
                        </button>
                        <button 
                            className="btn-reject"
                            onClick={() => responderSolicitud(n.id, n.id_referencia || n.id_publicacion, 'rechazar')}
                        >
                            <XIcon /> Rechazar
                        </button>
                    </div>
                )}
              </div>

              <div className="noti-buttons">
                {/* Si es solicitud, no mostramos el ojo, solo borrar. Si es normal, mostramos ojo */}
                {n.tipo !== 'solicitud_contacto' && !n.leido && (
                  <button className="noti-btn-icon" onClick={() => verPublicacion(n)} title="Ver detalle">
                    <EyeIcon />
                  </button>
                )}
                <button className="noti-btn-icon remove" onClick={() => eliminarNotificacion(n.id)} title="Eliminar">
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