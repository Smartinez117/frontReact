import React, { useEffect, useState, useCallback } from "react";
import "./notificaciones.css";
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { socketconnection, socketnotificationlisten, registerNotificationHandler } from '../../utils/socket';
import { Toaster, toast } from 'react-hot-toast'; 

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
  const [loadingRespuesta, setLoadingRespuesta] = useState(null); // { idNotificacion, accion } | null
  const navigate = useNavigate();

  // Función auxiliar para obtener token de manera segura
  const getFirebaseToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };

  // Función de carga (Memoizada)
  const fetchNotificaciones = useCallback(async (usuarioObj = null) => {
    try {
      // Si nos pasan el usuario (desde onAuthStateChanged), usamos ese para sacar el token
      // Si no, intentamos buscarlo globalmente
      let token = null;
      if (usuarioObj) {
         token = await usuarioObj.getIdToken();
      } else {
         token = await getFirebaseToken();
      }

      if (!token) {
          // Si tras intentar todo no hay token, paramos carga
          setLoading(false);
          return;
      }

      const res = await fetch(`${API_URL}notificaciones/usuario`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        data.sort(
            (a, b) =>
            new Date(b.fecha_creacion).getTime() -
            new Date(a.fecha_creacion).getTime()
        );
        setNotificaciones(data);
      }
    } catch (err) {
      console.error("Error al obtener notificaciones:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- CORRECCIÓN AQUÍ: Carga Inicial Robusta ---
  useEffect(() => {
    const auth = getAuth();
    
    // Escuchamos el estado de autenticación.
    // Esto se dispara automáticamente cuando Firebase termina de cargar al recargar la página.
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Si hay usuario, cargamos notificaciones
        fetchNotificaciones(user);
        
        // Y conectamos los sockets
        socketconnection(user);
        socketnotificationlisten(user.uid);
      } else {
        // Si no hay usuario, dejamos de cargar y redirigimos si quieres
        setLoading(false);
      }
    });

    // Intervalo para refrescar (Polling) cada 20s por seguridad
    const interval = setInterval(() => {
        const user = auth.currentUser;
        if(user) fetchNotificaciones(user);
    }, 20000);

    return () => {
        unsubscribeAuth();
        clearInterval(interval);
    };
  }, [fetchNotificaciones]);


  // Handler de Sockets (Separado para claridad)
  useEffect(() => {
    let unsubscribeHandler = null;
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      
      // 1. Conectar socket
      socketconnection(user);
      socketnotificationlisten(user.uid);

      // 2. Registrar handler (Asegúrate de que tu utilidad 'registerNotificationHandler' 
      // devuelva una función para desuscribirse o limpiar el evento)
      unsubscribeHandler = registerNotificationHandler((data) => {
        
        // --- CORRECCIÓN: Evitar duplicados por ID ---
        setNotificaciones(prev => {
          // Si la notificación ya existe en la lista (por ID), no la agregamos de nuevo
          if (prev.some(n => n.id === data.id)) return prev;
          
          const arr = [data, ...prev];
          arr.sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
          return arr;
        });

        // Mostrar Toast
        toast('Nueva notificación', { icon: '🔔', id: `noti-${data.id}` }); // 'id' evita toasts duplicados visuales
      });
    });

    // Función de limpieza al desmontar el componente
    return () => {
      unsubscribeAuth();
      if (unsubscribeHandler) unsubscribeHandler();
      // Opcional: desconectar listeners de socket si tu librería lo permite
    };
  }, []);


  // ... (Resto de funciones responderSolicitud, verPublicacion, etc. IGUAL QUE ANTES) ...
  
  const responderSolicitud = async (idNotificacion, idSolicitud, accion) => {
    const token = await getFirebaseToken();
    if (!token) return;

    setLoadingRespuesta({ idNotificacion, accion }); // Rastrear qué botón está procesando

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
             // data.dato_contacto viene del backend
            if (data.tipo_contacto === 'whatsapp') {
                 toast.success(`¡Aceptado! Su WhatsApp es: ${data.dato_contacto}`, { duration: 6000 });
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
        setLoadingRespuesta(null); // Desbloqueamos los botones en caso de error
    }
  };

  const verPublicacion = async (noti) => {
    const token = await getFirebaseToken();
    if (!token) return;

    if (!noti.leido) {
        await fetch(`${API_URL}notificaciones/leida/${noti.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        });
    }

    if (noti.id_publicacion) {
      navigate(`/publicacion/${noti.id_publicacion}`);
    }
    
    setNotificaciones(prev => prev.map(n => n.id === noti.id ? {...n, leido: true} : n));
  };

  const eliminarNotificacion = async (id) => {
    const token = await getFirebaseToken();
    if (!token) return;

    await fetch(`${API_URL}notificaciones/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  };

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
                
                {n.tipo === 'solicitud_contacto' && (
                    <div className="noti-actions-row">
                        <button 
                            className="btn-accept" 
                            onClick={() => responderSolicitud(n.id, n.id_referencia || n.id_publicacion, 'aceptar')}
                            disabled={loadingRespuesta !== null}
                        >
                            {loadingRespuesta?.idNotificacion === n.id && loadingRespuesta?.accion === 'aceptar' ? (
                                <>
                                    <span className="spinner-small"></span> Procesando...
                                </>
                            ) : (
                                <>
                                    <CheckIcon /> Aceptar
                                </>
                            )}
                        </button>
                        <button 
                            className="btn-reject"
                            onClick={() => responderSolicitud(n.id, n.id_referencia || n.id_publicacion, 'rechazar')}
                            disabled={loadingRespuesta !== null}
                        >
                            {loadingRespuesta?.idNotificacion === n.id && loadingRespuesta?.accion === 'rechazar' ? (
                                <>
                                    <span className="spinner-small"></span> Procesando...
                                </>
                            ) : (
                                <>
                                    <XIcon /> Rechazar
                                </>
                            )}
                        </button>
                    </div>
                )}
              </div>

              <div className="noti-buttons">
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