import { io } from "socket.io-client";
import { getAuth,onAuthStateChanged } from "firebase/auth";
import {Notificacion} from '../utils/toastUtil'




const baseURL = "http://localhost:5000"


//socket para registrasrse como user connected, usando un token 
export function socketconnection(){ 
  const auth = getAuth();
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.log("Usuario no autenticado");
      return;
    }
    try {
      const token = await user.getIdToken();

      const connection = io(baseURL + '/connection', {
        auth: { token: token }
      });

      connection.on('connect', () => {
        console.log('Socket conectado');
      });

      connection.on('connect_error', (error) => {
        console.error('Error en la conexión:', error.message);
      });
      return connection;  // puede devolver o guardar la conexión para usarla después
    } catch (error) {
      console.error('Error obteniendo token:', error);
    }
  });
}


//socket para escuchar las notificaciones notificaciones 
export function socketnotificationlisten(useruid) {
    const notificacion = io(baseURL + '/notificacion/' + useruid, {});

    notificacion.on('connect', () => {
        console.log('Socket1 conectado');
    });
    
    notificacion.on('connect_error', (error) => {
    console.error('Error conexión notificaciones:', error.message);
    });

    notificacion.on('notificacion', (data) => {
        console.log('por lo menos nos llego algo aca deberia aparecer el alert',data)
        Notificacion(data)  //< le paso el data de los 4 campos a la funcion de Notificacion
    });
}




