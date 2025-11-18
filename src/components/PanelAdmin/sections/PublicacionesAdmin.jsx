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
import { red } from '@mui/material/colors';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

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
  const limit = 9; // 3 cards por fila

  const fetchPublicaciones = async (pagina = 1) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/publicaciones?page=${pagina}&limit=${limit}`);
      const data = await res.json();
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

      // Actualizar lista y cerrar modal
      setPublicaciones(prev => prev.filter(p => p.id !== publicacionSeleccionada.id));
      setTotal(prev => prev - 1);
      setConfirmBorrarPubOpen(false);
      setPublicacionSeleccionada(null);

      // Mostrar snackbar de éxito
      setSnackbarMessage("Publicación borrada");
      setSnackbarOpen(true);

    } catch (error) {
      console.error(error);
      // Mostrar snackbar de error
      setSnackbarMessage(`Error al eliminar: ${error.message}`);
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
        {publicaciones.map(pub => (
          <Grid item xs={12} sm={4} key={pub.id} sx={{ display: 'flex' }}>
            <Card sx={{ width: 320, position: "relative", p: 1 }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: red[500] }}>{pub.usuario?.nombre?.[0] || "U"}</Avatar>
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
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Collapse in={expanded[pub.id]} timeout="auto" unmountOnExit>
                  <Typography><b>Propietario:</b> {pub.usuario?.nombre || "Sin nombre"}</Typography>
                  <Typography><b>Email:</b> {pub.usuario?.email || "Sin email"}</Typography>
                </Collapse>
              </CardContent>
              <CardActions disableSpacing>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  href={`/publicacion/${pub.id}`}
                  target="_blank"
                >
                  Ver
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
        ))}
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
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
