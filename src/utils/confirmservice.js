// confirmationService.js
import Swal from 'sweetalert2';
import './confirm.css'; // Asegúrate de importar el CSS con los estilos y blur



export function mostrarAlerta({ titulo, mensaje, tipo = 'info', duracion = 2000 }) {
  return Swal.fire({
    icon: tipo, // info | success | error | warning
    title: titulo,
    text: mensaje,
    timer: duracion,
    showConfirmButton: false,
  });
}

// Funciones que devuelven textos parametrizados según tipo
const getTitle = (tipo) => {
  switch (tipo) {
    case 'publicacion':
      return '¿Eliminar publicación?';
    case 'usuario':
      return '¿Eliminar usuario?';
    case 'archivar':
      return '¿Archivar publicación?';
    case 'desarchivar':
      return '¿Desarchivar publicación?';  
    default:
      return '¿Confirmar acción?';
  }
};

const getMessage = (tipo) => {
  switch (tipo) {
    case 'publicacion':
      return '¿Estás seguro de que deseas eliminar esta publicación?';
    case 'usuario':
      return '¿Estás seguro de que deseas eliminar este usuario?';
    case 'archivar':
      return 'La publicación será archivada y no será visible para otros usuarios.';
    case 'desarchivar':
      return 'La publicación volverá a estar visible para todos.';
    default:
      return '¿Estás seguro de realizar esta acción?';
  }
};

const getConfirmText = (tipo) => {
  switch (tipo) {
    case 'publicacion':
    case 'usuario':
      return 'Eliminar';
    case 'archivar':
      return 'Archivar';
    case 'desarchivar':
      return 'Desarchivar';
    default:
      return 'Confirmar';
  }
};

const getCancelText = () => 'Cancelar';

// El icono rojo cuadrado personalizado con el signo "!" más pequeño y centrado
const iconHtml = `
  <div style="
    background: #e74646;
    color: white;
    border-radius: 8px;
    width: 60px;
    height: 40px;
    font-weight: bold;
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 10px auto;
    user-select: none;
  ">
    !
  </div>
`;

// Función principal para mostrar la confirmación
export async function confirmarAccion({ tipo, onConfirm }) {
  const result = await Swal.fire({
    title: getTitle(tipo),
    html: `${iconHtml}${getMessage(tipo)}`,
    icon: null, // usamos icono customHtml, no icon por defecto
    showCancelButton: true,
    confirmButtonText: getConfirmText(tipo),
    cancelButtonText: getCancelText(),
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: 'custom-popup',
      confirmButton: 'custom-confirm-button',
      cancelButton: 'custom-cancel-button',
    },
  });

  if (result.isConfirmed) {
    try {
      await onConfirm(); // Ejecuta la acción confirmada que recibimos por parámetro
      await Swal.fire({
        icon: 'success',
        title: 'Operación exitosa',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Ocurrió un error inesperado',
      });
    }
  }
}
