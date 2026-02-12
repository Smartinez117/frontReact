import Swal from 'sweetalert2';
import './confirm.css'; 

const getTitle = (tipo) => {
  switch (tipo) {
    case 'publicacion': return '¿Eliminar publicación?';
    case 'usuario': return '¿Eliminar usuario?';
    case 'archivar': return '¿Archivar publicación?';
    case 'desarchivar': return '¿Desarchivar publicación?';
    case 'comentario': return '¿Eliminar comentario?';
    case 'etiqueta': return '¿Eliminar etiqueta?';
    case 'localidad': return '¿Eliminar localidad?';
    case 'reporte': return '¿Eliminar reporte?';
    case 'suspender': return '¿Suspender usuario?';
    case 'activar': return '¿Activar usuario?';
    default: return '¿Confirmar acción?';
  }
};

const getMessage = (tipo, dato) => {
  const nombre = dato ? `<b>"${dato}"</b>` : 'este elemento'; 

  switch (tipo) {
    case 'publicacion':
      return `Está por eliminar la publicación ${nombre}. Esta acción no se puede deshacer y el contenido se perderá permanentemente.`;
    case 'usuario':
      return `Está por eliminar al usuario ${nombre}. Esta acción es irreversible y se eliminarán todas sus publicaciones asociadas.`;
    case 'etiqueta':
      return `Está por eliminar la etiqueta ${nombre}. Se desvinculará de las publicaciones que la usen.`;
    case 'localidad':
      return `Está por eliminar la localidad ${nombre}. Esto podría afectar a los usuarios o publicaciones que dependan de esta ubicación.`;
    case 'reporte': 
      return `Está por eliminar este reporte. Esto significa que la denuncia será desestimada y desaparecerá de la lista.`;
    case 'archivar':
      return `Está por archivar ${nombre}. Dejará de ser visible para otros usuarios, pero podrás restaurarla luego.`;
    case 'desarchivar':
      return `La publicación ${nombre} volverá a ser pública y visible para todos.`;
    case 'comentario':
      if (dato) {
          return `Está por eliminar ${nombre}. Esta acción no se puede deshacer.`;
      }
      return 'Está por eliminar este comentario. Esta acción no se puede deshacer.';
    case 'suspender':
      return `Está por suspender el acceso a ${nombre}. El usuario no podrá iniciar sesión hasta que sea reactivado.`;
    case 'activar':
      return `Está por reactivar el acceso a ${nombre}. El usuario podrá volver a iniciar sesión inmediatamente.`;

    default:
      return '¿Realmente deseas realizar esta acción?';
  }
};

const getConfirmButtonColor = (tipo) => {
    switch(tipo) {
        case 'publicacion':
        case 'usuario':
        case 'comentario':
        case 'etiqueta':
        case 'localidad':
        case 'reporte':
            return '#d33';
        case 'archivar':
            return '#3085d6';
        case 'suspender': 
            return '#bc22e6'; 
        case 'desarchivar':
        case 'activar': 
            return '#3085d6'; 
        default:
            return '#3085d6'; 
    }
}

const getConfirmText = (tipo) => {
  switch (tipo) {
    case 'publicacion':
    case 'usuario': 
    case 'etiqueta':
    case 'localidad': 
    case 'reporte': return 'Sí, eliminar'; 
    case 'archivar': return 'Sí, archivar';
    case 'desarchivar': return 'Sí, desarchivar';
    case 'comentario': return 'Sí, eliminar';
    case 'suspender': return 'Sí, suspender';
    case 'activar': return 'Sí, activar';
    default: return 'Confirmar';
  }
};

export async function confirmarAccion({ tipo, dato, onConfirm }) {
  const iconType = (tipo === 'activar' || tipo === 'desarchivar' || tipo === 'archivar') ? 'question' : 'warning';

  const result = await Swal.fire({
    title: getTitle(tipo),
    html: getMessage(tipo, dato), 
    icon: iconType,
    showCancelButton: true,
    confirmButtonColor: getConfirmButtonColor(tipo),
    cancelButtonColor: '#6c757d',
    confirmButtonText: getConfirmText(tipo),
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: 'custom-popup',
    },
  });

  if (result.isConfirmed) {
    try {
      if (onConfirm) await onConfirm(); 
      await Swal.fire({
        icon: 'success',
        title: 'Operación exitosa',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Ocurrió un error inesperado',
      });
    }
  }
}

export function mostrarAlerta({ titulo, mensaje, tipo = 'info', duracion = 2000 }) {
  return Swal.fire({
    icon: tipo,
    title: titulo,
    text: mensaje,
    timer: duracion,
    showConfirmButton: false,
  });
}