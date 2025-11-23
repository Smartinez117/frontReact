import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { red, grey } from '@mui/material/colors'; // Agregué grey para estados
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material'; // Agregué Chip

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  marginLeft: 'auto',
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const API_URL = import.meta.env.VITE_API_URL;

// Componente de paginación personalizado
function PaginationRounded({ count, page, onChange }) {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', mt: 4 }}>
      <Pagination count={count} page={page} onChange={onChange} shape="rounded" />
    </Stack>
  );
}

export default function PublicacionesAdmin() {
  const [publicaciones, setPublicaciones] = React.useState([]);
  const [expanded, setExpanded] = React.useState({});
  const [confirmBorrarPubOpen, setConfirmBorrarPubOpen] = React.useState(false);
  const [publicacionSeleccionada, setPublicacionSeleccionada] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  // Nuevo estado para controlar el color de la alerta (success/error)
  const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');

  const limit = 9;

  const fetchPublicaciones = async (pagina = 1) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/publicaciones?page=${pagina}&limit=${limit}`);
      const data = await res.json();
      console.log("Datos recibidos del backend:", data.publicaciones);
      const pubsConImagen = data.publicaciones.map(pub => ({
        ...pub,
        primeraImagen: pub.imagenes?.[0] || null,
      }));
      setPublicaciones(pubsConImagen);
      setTotal(data.total);
      setPage(data.page);
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    fetchPublicaciones(page);
  }, [page]);

  const handleExpandClick = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Lógica para Archivar / Desarchivar ---
  const handleArchivar = async (pub) => {
    const isArchived = pub.estado === 1; // Asumiendo que el estado se llama 'archivada' o similar
    const endpoint = isArchived ? 'desarchivar' : 'archivar';
    
    try {
      const res = await fetch(`${API_URL}/publicaciones/${pub.id}/${endpoint}`, {
        method: 'PATCH',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Error al ${endpoint}`);
      }

      // Actualizar estado localmente para reflejar el cambio inmediato
      setPublicaciones(prev => prev.map(p => {
        if (p.id === pub.id) {
            // Cambiamos el estado localmente
            return { ...p, estado: isArchived ? 0 : 1 };
        }
        return p;
      }));

      setSnackbarMessage(isArchived ? "Publicación desarchivada" : "Publicación archivada");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

    } catch (error) {
      console.error(error);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleBorrarPublicacionModal = (pub) => {
    setPublicacionSeleccionada(pub);
    setConfirmBorrarPubOpen(true);
  };

  const ejecutarBorradoPublicacion = async () => {
    if (!publicacionSeleccionada) return;
    try {
      const res = await fetch(`${API_URL}/publicaciones/${publicacionSeleccionada.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar publicación");
      }

      setPublicaciones(prev => prev.filter(p => p.id !== publicacionSeleccionada.id));
      setTotal(prev => prev - 1);
      setConfirmBorrarPubOpen(false);
      setPublicacionSeleccionada(null);

      setSnackbarMessage("Publicación borrada");
      setSnackbarSeverity("success"); // Éxito
      setSnackbarOpen(true);

    } catch (error) {
      console.error(error);
      setSnackbarMessage(`Error al eliminar: ${error.message}`);
      setSnackbarSeverity("error"); // Error
      setSnackbarOpen(true);
    }
  };

  const handlePageChange = (event, value) => {
    fetchPublicaciones(value);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Grid container spacing={2}>
        {publicaciones.map(pub => {
            // Verificamos si está archivada para estilos condicionales
            const isArchived = pub.estado === 1; // 1 indica archivada

            return (
              <Grid item xs={12} sm={4} key={pub.id} sx={{ display: 'flex' }}>
                <Card 
                    sx={{ 
                        width: 320, 
                        position: "relative", 
                        p: 1,
                        // Opcional: poner un fondo grisáceo si está archivada
                        bgcolor: isArchived ? '#f5f5f5' : 'white',
                        opacity: isArchived ? 0.8 : 1
                    }}
                >
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: isArchived ? grey[500] : red[500] }}>
                        {pub.usuario?.nombre?.[0] || "U"}
                      </Avatar>
                    }
                    action={
                        // Indicador visual si está archivada
                        isArchived && <Chip label="Archivada" size="small" color="default" />
                    }
                    title={pub.titulo}
                    subheader={new Date(pub.fecha_creacion).toLocaleDateString("es-AR")}
                  />
                  {pub.primeraImagen && (
                    <CardMedia
                      component="img"
                      height="194"
                      image={pub.primeraImagen}
                      alt={pub.titulo}
                      sx={{ filter: isArchived ? 'grayscale(100%)' : 'none' }} // Efecto visual
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Collapse in={expanded[pub.id]} timeout="auto" unmountOnExit>
                      <Typography><b>Propietario:</b> {pub.usuario?.nombre || "Sin nombre"}</Typography>
                      <Typography><b>Email:</b> {pub.usuario?.email || "Sin email"}</Typography>
                      <Typography><b>Estado:</b> {pub.estado}</Typography>
                    </Collapse>
                  </CardContent>
                  
                  <CardActions disableSpacing sx={{flexWrap: 'wrap', gap: 1}}>
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      href={`/publicacion/${pub.id}`}
                      target="_blank"
                    >
                      Ver
                    </Button>

                    {/* BOTÓN ARCHIVAR / DESARCHIVAR */}
                    <Button
                      variant="contained"
                      size="small"
                      // Cambiamos color según acción: Warning para archivar, Info/Success para restaurar
                      color={isArchived ? "success" : "warning"} 
                      onClick={() => handleArchivar(pub)}
                    >
                      {isArchived ? "Desarchivar" : "Archivar"}
                    </Button>

                    <Button
                      variant="contained"
                      size="small"
                      color="error"
                      onClick={() => handleBorrarPublicacionModal(pub)}
                    >
                      Borrar
                    </Button>

                    <ExpandMore
                      expand={expanded[pub.id]}
                      onClick={() => handleExpandClick(pub.id)}
                      aria-expanded={expanded[pub.id]}
                      aria-label="show more"
                    >
                      <ExpandMoreIcon />
                    </ExpandMore>
                  </CardActions>
                </Card>
              </Grid>
            );
        })}
      </Grid>

      {/* Paginación */}
      <PaginationRounded
        count={Math.ceil(total / limit)}
        page={page}
        onChange={handlePageChange}
      />

      {/* Modal de borrado */}
      <Dialog open={confirmBorrarPubOpen} onClose={() => setConfirmBorrarPubOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          {publicacionSeleccionada && (
            <Typography>
              ¿Seguro que quieres borrar la publicación <b>{publicacionSeleccionada.titulo}</b>?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmBorrarPubOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={ejecutarBorradoPublicacion}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity} // AHORA ES DINÁMICO
            sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}