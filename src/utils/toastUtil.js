import toast from 'react-hot-toast';

/**
 * Muestra un toast de éxito (green, con icono check)
 * @param {string} message - Mensaje a mostrar
 */
export const showSuccessToast = (message) => {
  toast.success(message, {
    // Opcional: estilos específicos aquí o manejarlo global
    style: {
      border: '1px solid #4CAF50',
      padding: '16px',
      color: '#4CAF50',
      fontWeight: 'bold',
    },
  });
};

/**
 * Muestra un toast de error (rojo, con icono alerta)
 * @param {string} message - Mensaje a mostrar
 */
export const showErrorToast = (message) => {
  toast.error(message, {
    style: {
      border: '1px solid #FF5252',
      padding: '16px',
      color: '#FF5252',
      fontWeight: 'bold',
    },
  });
};

/**
 * Muestra un toast de notificación genérica (gris o default)
 * @param {string} message - Mensaje a mostrar
 */
export const showNotificationToast = (message) => {
  toast(message, {
    style: {
      border: '1px solid #333',
      padding: '16px',
      color: '#333',
    },
  });
};
