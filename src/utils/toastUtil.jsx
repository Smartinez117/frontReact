import toast from 'react-hot-toast';
import React from 'react';
import { marcarNotificacionLeida } from '../services/notificaciones';

let callbackAgregar = null;

export function registrarCallbackAgregar(fn) {
  callbackAgregar = fn;
}

// aca la funcion NOtificaion recibe los datos
export function Notificacion(notificacion){
  if (callbackAgregar) {
  callbackAgregar(notificacion);
  }
  const handlerbutton = (toastId,publicacion_ID) => { 
  toast.dismiss(toastId);
  window.location.href = `/publicacion/${publicacion_ID}`;
  console.log('marcar com0 leido en el back, si llego hasta aqui entonces se puede lograr sin') // aca tendriamos que poner la funcion para marcarlo como leido a la notificacion
  //marcarNotificacionLeida(notificacion.id_notificacion) 
  //funcion de marcar como leida sin probar aun 

};

  toast (({toastId}) =>( 
    <span>
      {notificacion.titulo}
      <p/>{notificacion.descripcion}
      <button onClick={()=> handlerbutton(toastId,notificacion.id_publicacion)}>ver</button>
    </span>
    
  ));
}

