// publicBanner.jsx es la portada que vemos de un perfil público
import React, { useEffect, useState } from 'react';
import './cbanner.css';
import { obtenerUsuarioPorId } from '../../services/perfilService';

// --- IMPORTACIONES NUEVAS ---
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import MailIcon from '@mui/icons-material/Mail';
import IconButton from '@mui/material/IconButton'; // Para que el icono sea un botón clickeable
import Tooltip from '@mui/material/Tooltip';       // Para mostrar "Reportar" al pasar el mouse
import ReporteForm from '../Reportes/Reportes.jsx'; // Asegúrate que la ruta sea correcta
// ----------------------------

const PublicBanner = ({ userId }) => { // Cambié a PascalCase (Buenas prácticas React)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para controlar el modal de reporte
  const [mostrarModalReporte, setMostrarModalReporte] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await obtenerUsuarioPorId(userId);
        setUser(data);
      } catch (err) {
        setError(err.message || 'Error al cargar el usuario');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <p>Cargando perfil...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <>
      <div className="nombre-container">
        <img
          src={user?.foto_perfil_url || "/default-profile.png"}
          alt={user?.nombre || "Usuario"}
          className="nombre-foto"
        />

        <div className="nombre-info">
          <span className="nombre-text">{user?.nombre || "Usuario"}</span>
          
          <div className="nombre-icons">
            {/* Botón de Mensaje (Ejemplo) */}
            <Tooltip title="Enviar mensaje">
                <IconButton size="small">
                    <MailIcon />
                </IconButton>
            </Tooltip>

            {/* BOTÓN DE REPORTAR */}
            <Tooltip title="Reportar usuario">
                <IconButton 
                    size="small" 
                    onClick={() => setMostrarModalReporte(true)}
                    sx={{ '&:hover': { color: 'warning.main' } }} // Se pone naranja al pasar el mouse
                >
                    <OutlinedFlagIcon />
                </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* MODAL DE REPORTE */}
      {mostrarModalReporte && (
        <ReporteForm
            // Pasamos el userId del perfil actual como el usuario a reportar
            idUsuario={userId} 
            onClose={() => setMostrarModalReporte(false)}
        />
      )}
    </>
  );
};

export default PublicBanner;