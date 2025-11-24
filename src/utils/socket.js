import { io } from "socket.io-client";
import {Notificacion} from '../utils/toastUtil'

// Leer base URL desde variables de entorno Vite. Si no está definida, usar el valor por defecto.
const rawBase = import.meta.env.VITE_API_URL || "https://backendconflask.onrender.com";
// Normalizar quitando barra final si existe
const baseURL = rawBase.replace(/\/+$/, '');
//const baseURL = "http://localhost:5000"

//INSTANCIAS GLOBALES DE LOS SOCKETS
export let connectionSocket = null;
export let notificacion = null;
export let socketNotificationsConnected = false;
// Handlers externos que desean recibir notificaciones en tiempo real
export const _notificationHandlers = [];


//socket para registrasrse como user connected, usando un token 
export function socketconnection(user) { 
  if (connectionSocket) return connectionSocket;
  if (!user) return;

  user.getIdToken().then((token) => {

    connectionSocket = io(baseURL + '/connection', {
      transports: ['websocket'],
      upgrade: false,
      auth: { token:token }
    });

    connectionSocket.on('connect', () => {
      console.log('Socket conectado');
    });

    connectionSocket.on('connect_error', (error) => {
      console.error('Error en la conexión:', error.message);
    });

  });

  return connectionSocket;
}

//socket para escuchar las notificaciones notificaciones 
export function socketnotificationlisten(useruid) {
    if (socketNotificationsConnected) return; // <- evita doble registro
    socketNotificationsConnected = true;

    notificacion = io(baseURL + '/notificacion', {
      transports: ['websocket'],
      upgrade: false,
      auth: {uid: useruid}
    }); 
    notificacion.on('connect', () => {
        console.log('Socket-DE-notificaciones conectado');
    });
    
    notificacion.on('connect_error', (error) => {
    console.error('Error conexión notificaciones:', error.message);
    });

    notificacion.on('notificacion', (data) => {
        console.log('por lo menos nos llego algo aca deberia aparecer el alert',data)
        Notificacion(data);  //< le paso el data de los 4 campos a la funcion de Notificacion
        // Llamar a handlers externos registrados (si los hay)
        try {
          _notificationHandlers.forEach(fn => {
            try { fn(data); } catch(err){ console.error('notification handler error', err); }
          });
        } catch(e) { console.error(e); }
    });
}

// Permite a otros módulos registrar un callback que recibirá la notificación (data)
export function registerNotificationHandler(fn) {
  if (typeof fn !== 'function') return () => {};
  _notificationHandlers.push(fn);
  // devolver función para desuscribir
  return () => {
    const idx = _notificationHandlers.indexOf(fn);
    if (idx !== -1) _notificationHandlers.splice(idx, 1);
  };
}




