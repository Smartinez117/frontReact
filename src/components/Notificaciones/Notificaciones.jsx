import React from 'react';

const toastStyle = {
  maxWidth: '400px',
  width: '100%',
  backgroundColor: 'white',
  boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
  borderRadius: '12px',
  pointerEvents: 'auto',
  display: 'flex',
  border: '1px solid rgba(0,0,0,0.05)',
  animation: 'fadeIn 0.3s ease-out',
};

const contentStyle = {
  flex: 1,
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
};

const titleStyle = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#1a202c', // gris oscuro
  margin: 0,
};

const messageStyle = {
  marginTop: '8px',
  fontSize: '12px',
  color: '#718096', // gris medio
  margin: 0,
};

const buttonContainerStyle = {
  borderLeft: '1px solid #e2e8f0', // borde gris
  display: 'flex',
  alignItems: 'center',
  padding: '8px',
};

const buttonStyle = {
  border: 'none',
  backgroundColor: 'transparent',
  color: '#4c51bf', // índigo-600
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '500',
  padding: '8px 12px',
  borderRadius: '8px',
  outline: 'none',
};

export default function notificationComent({ t, toast }) {
  return (
    <div style={toastStyle}>
      <div style={contentStyle}>
        <p style={titleStyle}>{t.title || 'Título'}</p>
        <p style={messageStyle}>{t.message || 'Mensaje de la notificación'}</p>
      </div>
      <div style={buttonContainerStyle}>
        <button
          style={buttonStyle}
          onClick={() => toast.dismiss(t.id)}
          aria-label="Cerrar notificación"
        >
          ver
        </button>
      </div>
    </div>
  );
}
