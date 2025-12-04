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
import Box from '@mui/material/Box'; 
import TextField from '@mui/material/TextField'; 
import Checkbox from '@mui/material/Checkbox'; 
import CircularProgress from '@mui/material/CircularProgress';
import { red, grey } from '@mui/material/colors';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete'; 
import SearchIcon from '@mui/icons-material/Search'; 
import { Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';

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
  
  // --- ESTADOS DE SELECCIÓN Y FILTRO ---
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [filterUserId, setFilterUserId] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('');
  // -------------------------------------

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');
  const [loadingArchivar, setLoadingArchivar] = React.useState({});
  const [loadingBorrar, setLoadingBorrar] = React.useState({});
  const [loadingBorrarModal, setLoadingBorrarModal] = React.useState(false);

  const limit = 9;

  const fetchPublicaciones = async (pagina = 1, userId = '') => {
    try {
      let url = `${API_URL}/api/admin/publicaciones?page=${pagina}&limit=${limit}`;
      
      if (userId) {
        url += `&id_usuario=${userId}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      const lista = Array.isArray(data.publicaciones) ? data.publicaciones : [];

      const pubsConImagen = lista.map(pub => ({
        ...pub,
        primeraImagen: pub.imagenes?.[0] || null,
      }));
      setPublicaciones(pubsConImagen);
      setTotal(data.total || 0);
      setPage(Number(data.page) || 1);
    } catch (error) {
      console.error(error);
      setPublicaciones([]);
    }
  };

  React.useEffect(() => {
    fetchPublicaciones(page, activeFilter);
  }, [page]); 

  const handleExpandClick = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- MANEJO DE FILTRO ---
  const handleSearch = () => {
    setPage(1);
    setActiveFilter(filterUserId);
    fetchPublicaciones(1, filterUserId);
  };

  const handleClearSearch = () => {
    setFilterUserId('');
    setActiveFilter('');
    setPage(1);
    fetchPublicaciones(1, '');
  };

  // --- MANEJO DE SELECCIÓN ---
  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
        if (prev.includes(id)) {
            return prev.filter(item => item !== id);
        } else {
            return [...prev, id];
        }
    });
  };

  // --- BORRADO MASIVO ---
  const handleBulkDelete = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar ${selectedIds.length} publicaciones seleccionadas?`)) return;

    const deletePromises = selectedIds.map(id => 
        fetch(`${API_URL}/publicaciones/${id}`, { method: 'DELETE' })
    );

    try {
        await Promise.all(deletePromises);
        fetchPublicaciones(page, activeFilter);
        setSelectedIds([]);
        setSnackbarMessage(`${selectedIds.length} publicaciones eliminadas.`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
    } catch (error) {
        console.error("Error en borrado masivo:", error);
        setSnackbarMessage("Error al eliminar algunas publicaciones");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
    }
  };

  // --- Lógica Individual ---
  const handleArchivar = async (pub) => {
    const isArchived = pub.estado === 1; 
    const endpoint = isArchived ? 'desarchivar' : 'archivar';
    
    setLoadingArchivar(prev => ({ ...prev, [pub.id]: true }));
    try {
      const res = await fetch(`${API_URL}/publicaciones/${pub.id}/${endpoint}`, { method: 'PATCH' });
      if (!res.ok) throw new Error(`Error al ${endpoint}`);

      setPublicaciones(prev => prev.map(p => {
        if (p.id === pub.id) return { ...p, estado: isArchived ? 0 : 1 };
        return p;
      }));

      setSnackbarMessage(isArchived ? "Publicación desarchivada" : "Publicación archivada");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoadingArchivar(prev => ({ ...prev, [pub.id]: false }));
    }
  };

  const handleBorrarPublicacionModal = (pub) => {
    setPublicacionSeleccionada(pub);
    setConfirmBorrarPubOpen(true);
  };

  const ejecutarBorradoPublicacion = async () => {
    if (!publicacionSeleccionada) return;
    setLoadingBorrarModal(true);
    try {
      const res = await fetch(`${API_URL}/publicaciones/${publicacionSeleccionada.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");

      setPublicaciones(prev => prev.filter(p => p.id !== publicacionSeleccionada.id));
      setTotal(prev => prev - 1);
      setConfirmBorrarPubOpen(false);
      setPublicacionSeleccionada(null);

      setSnackbarMessage("Publicación borrada");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoadingBorrarModal(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  // --- CÁLCULO DE ESTADO DEL CHECKBOX MAESTRO ---
  const allVisibleIds = publicaciones.map(p => p.id);
  const isAllSelected = publicaciones.length > 0 && allVisibleIds.every(id => selectedIds.includes(id));
  const isSomeSelected = publicaciones.length > 0 && allVisibleIds.some(id => selectedIds.includes(id));

  return (
    <>
      {/* --- BARRA DE HERRAMIENTAS --- */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        
        {/* Área de Filtro */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField 
                label="Filtrar por ID Usuario" 
                variant="outlined" 
                size="small"
                type="number"
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
            />
            <Button variant="contained" onClick={handleSearch} startIcon={<SearchIcon />}>
                Buscar
            </Button>
            {activeFilter && (
                <>
                    <Button variant="outlined" onClick={handleClearSearch} color="inherit">
                        Limpiar
                    </Button>
                    
                    {/* CHECKBOX MAESTRO ARREGLADO */}
                    <Box 
                        sx={{ display: 'flex', alignItems: 'center', ml: 2, borderLeft: '1px solid #ccc', pl: 2, cursor: 'pointer' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isAllSelected) {
                                // Desmarcar todos los visibles
                                setSelectedIds(prev => prev.filter(id => !allVisibleIds.includes(id)));
                            } else {
                                // Marcar todos los visibles
                                setSelectedIds(prev => [...new Set([...prev, ...allVisibleIds])]);
                            }
                        }}
                    >
                        <Checkbox 
                            checked={isAllSelected}
                            indeterminate={isSomeSelected && !isAllSelected}
                            // SOLUCION: Desactivar eventos de puntero en el Checkbox para que el Box capture el clic siempre
                            style={{ pointerEvents: 'none' }} 
                            color="error"
                            sx={{ p: 0, mr: 1 }}
                        />
                        <Typography variant="body2">
                            Marcar todo en página
                        </Typography>
                    </Box>
                </>
            )}
        </Box>

        {/* Área de Acciones Masivas */}
        {selectedIds.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">
                    {selectedIds.length} seleccionadas
                </Typography>
                <Button 
                    variant="contained" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={handleBulkDelete}
                >
                    Eliminar Marcadas
                </Button>
            </Box>
        )}
      </Box>

      {/* --- GRILLA DE TARJETAS --- */}
      <Grid container spacing={2}>
        {publicaciones.map(pub => {
            const isArchived = pub.estado === 1; 
            const isSelected = selectedIds.includes(pub.id);

            return (
              <Grid item xs={12} sm={4} key={pub.id} sx={{ display: 'flex' }}>
                <Card 
                    sx={{ 
                        width: 320, 
                        position: "relative", 
                        p: 1,
                        bgcolor: isArchived ? '#f5f5f5' : 'white',
                        opacity: isArchived ? 0.8 : 1,
                        border: isSelected ? `2px solid ${red[500]}` : '1px solid transparent'
                    }}
                >
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: isArchived ? grey[500] : red[500] }}>
                        {pub.usuario?.nombre?.[0] || "U"}
                      </Avatar>
                    }
                    action={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Checkbox 
                                checked={isSelected}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleSelect(pub.id);
                                }}
                                // Aseguramos que aquí SÍ se pueda hacer click
                                sx={{ p: 0, pointerEvents: 'auto' }} 
                                color="error"
                            />
                            {isArchived && <Chip label="Archivada" size="small" color="default" sx={{ ml: 1 }} />}
                        </Box>
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
                      sx={{ filter: isArchived ? 'grayscale(100%)' : 'none' }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Collapse in={expanded[pub.id]} timeout="auto" unmountOnExit>
                      <Typography><b>ID Pub:</b> {pub.id}</Typography>
                      <Typography><b>Usuario ID:</b> {pub.id_usuario}</Typography>
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
                      disabled={loadingArchivar[pub.id] || loadingBorrar[pub.id]}
                    >
                      Ver
                    </Button>

                    <Button
                      variant="contained"
                      size="small"
                      color={isArchived ? "success" : "warning"} 
                      onClick={() => handleArchivar(pub)}
                      disabled={loadingArchivar[pub.id] || loadingBorrar[pub.id]}
                      sx={{ position: "relative" }}
                    >
                      {loadingArchivar[pub.id] ? (
                        <CircularProgress size={20} sx={{ position: "absolute" }} />
                      ) : (
                        (isArchived ? "Desarchivar" : "Archivar")
                      )}
                    </Button>

                    <Button 
                      variant="contained" 
                      size="small" 
                      color="error" 
                      onClick={() => handleBorrarPublicacionModal(pub)}
                      disabled={loadingArchivar[pub.id] || loadingBorrar[pub.id]}
                      sx={{ position: "relative" }}
                    >
                      {loadingBorrar[pub.id] ? (
                        <CircularProgress size={20} sx={{ position: "absolute" }} />
                      ) : (
                        "Borrar"
                      )}
                    </Button>

                    <ExpandMore
                      expand={expanded[pub.id]}
                      onClick={() => handleExpandClick(pub.id)}
                      aria-expanded={expanded[pub.id]}
                      aria-label="show more"
                      disabled={loadingArchivar[pub.id] || loadingBorrar[pub.id]}
                    >
                      <ExpandMoreIcon />
                    </ExpandMore>
                  </CardActions>
                </Card>
              </Grid>
            );
        })}
      </Grid>

      {publicaciones.length === 0 && (
        <Box sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
            <Typography>No se encontraron publicaciones.</Typography>
        </Box>
      )}

      <PaginationRounded
        count={Math.ceil(total / limit)}
        page={page}
        onChange={handlePageChange}
      />

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
          <Button onClick={() => setConfirmBorrarPubOpen(false)} disabled={loadingBorrarModal}>Cancelar</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={ejecutarBorradoPublicacion}
            disabled={loadingBorrarModal}
            sx={{ position: "relative" }}
          >
            {loadingBorrarModal ? (
              <CircularProgress size={20} sx={{ position: "absolute" }} />
            ) : (
              "Eliminar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}