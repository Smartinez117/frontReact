import { io } from "socket.io-client";
import { getAuth,onAuthStateChanged } from "firebase/auth";
import {Notificacion} from '../utils/toastUtil'

const baseURL = "https://backendconflask.onrender.com"
//const baseURL = "http://localhost:5000"

//INSTANCIAS GLOBALES DE LOS SOCKETS
export let connectionSocket = null;
export let notificacion = null;
export let socketNotificationsConnected = false;


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
        Notificacion(data)  //< le paso el data de los 4 campos a la funcion de Notificacion
    });
}




