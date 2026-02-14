import { Link } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CircularProgress from "@mui/material/CircularProgress";
import { getFreshToken } from "../../../utils/getFreshToken"; 
import { Snackbar, Alert } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";

// IMPORTAMOS EL SERVICIO (Asegúrate que la ruta sea correcta)
import { confirmarAccion } from "../../../utils/confirmservice"; 

const API_URL = import.meta.env.VITE_API_URL;

export default function UsuariosAdmin() {
  const [roles, setRoles] = useState([]);
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // Estado para edición
  const [open, setOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [loadingGuardar, setLoadingGuardar] = useState(false);

  // Snackbar solo para Edición (ConfirmarAccion maneja sus propias alertas)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // NOTA: Eliminamos estados de confirmación manual (confirmOpen, accionUsuario, borrarUsuario, confirmBorrarOpen)
  // NOTA: Eliminamos loadingAccion y loadingBorrado porque SweetAlert bloquea la pantalla mientras se ejecuta la promesa

  // Cargar roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch(`${API_URL}/api/roles`);
        const data = await res.json();
        const r = Array.isArray(data) ? data : data.roles || [];
        setRoles(r);
      } catch (error) {
        console.error("Error cargando roles:", error);
      }
    };
    fetchRoles();
  }, []);

  // Traer usuarios
  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const queryPage = paginationModel.page + 1;
      const queryLimit = paginationModel.pageSize;
      
      const response = await fetch(
        `${API_URL}/api/usuarios?page=${queryPage}&per_page=${queryLimit}&search=${encodeURIComponent(
          search
        )}`
      );
      const data = await response.json();

      const usuarios = Array.isArray(data.usuarios)
        ? data.usuarios
        : data.data || data.usuarios || [];
      
      const totalRaw = data.total ?? data.totalCount ?? data.count ?? usuarios.length;
      const total = Number(totalRaw) || 0;

      const normalized = usuarios.map((u, idx) => ({
        ...u,
        id: typeof u.id !== "undefined" ? u.id : u._id ?? idx,
      }));

      setRows(normalized);
      setRowCount(total);

    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, search]);

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsuarios();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchUsuarios]);

  // Abrir modal EDICIÓN
  const handleEditUsuario = (row) => {
    let roleId = row.role_id;
    if (!roleId && roles.length > 0) {
      const found = roles.find(
        (r) => r.nombre?.toLowerCase() === row.rol?.toLowerCase()
      );
      if (found) roleId = found.id;
    }
    if (!roleId && roles.length > 0) {
      roleId = roles[0].id;
    }
    setUsuarioSeleccionado({ ...row, role_id: Number(roleId) });
    setOpen(true);
  };

  // Guardar cambios (Edición)
  const handleGuardar = async () => {
    try {
      setLoadingGuardar(true);
      const token = await getFreshToken();

      const res = await fetch(
        `${API_URL}/api/admin/usuario/${usuarioSeleccionado.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            nombre: usuarioSeleccionado.nombre,
            role_id: Number(usuarioSeleccionado.role_id),
          }),
        }
      );

      if (!res.ok) throw new Error("Error actualizando usuario");
      const data = await res.json();
      const actualizado = data.usuario || data;

      setRows((prev) =>
        prev.map((u) => (u.id === actualizado.id ? { ...u, ...actualizado } : u))
      );
      setOpen(false);
      setSnackbarMessage("Cambios guardados correctamente");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      
      fetchUsuarios();

    } catch (error) {
      console.error("Error al guardar:", error);
      setSnackbarMessage("Error al guardar cambios");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoadingGuardar(false);
    }
  };

  // --------------------------------------------------------
  // NUEVA LÓGICA DE ACCIONES (SUSPENDER/ACTIVAR) CON SERVICIO
  // --------------------------------------------------------
  const handleAccionUsuario = (row) => {
    const accion = row.estado === "activo" ? "suspender" : "activar";

    confirmarAccion({
      tipo: accion, // 'suspender' o 'activar'
      dato: row.nombre,
      onConfirm: async () => {
        const token = await getFreshToken();
        const res = await fetch(
          `${API_URL}/api/admin/usuarios/${row.id}/${accion}`,
          { 
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          }
        );
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error en la acción");

        // Actualizamos la tabla
        setRows((prev) =>
          prev.map((u) =>
            u.id === row.id ? { ...u, estado: data.usuario.estado } : u
          )
        );
        // NO llamamos a setSnackbar aquí, confirmarAccion muestra el éxito automáticamente
      }
    });
  };

  // --------------------------------------------------------
  // NUEVA LÓGICA DE ELIMINAR CON SERVICIO
  // --------------------------------------------------------
  const handleBorrarUsuario = (row) => {
    confirmarAccion({
      tipo: 'usuario', // Usa el mensaje de eliminar usuario
      dato: row.nombre,
      onConfirm: async () => {
        const token = await getFreshToken();
        const res = await fetch(
          `${API_URL}/api/admin/usuarios/${row.id}`,
          { 
            method: "DELETE", 
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          }
        );
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al eliminar usuario");

        // Actualizamos estado local
        setRows((prev) => prev.filter((u) => u.id !== row.id));
        setRowCount((prev) => prev - 1);
      }
    });
  };

  const columns = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 70 },
      { field: "nombre", headerName: "Nombre", width: 130 },
      { field: "email", headerName: "Email", width: 200 },
      { field: "rol", headerName: "Rol", width: 80 },
      { field: "estado", headerName: "Estado", width: 100 },
      { field: "fecha_registro", headerName: "Fecha", width: 120 },
      {
        field: "acciones",
        headerName: "Acciones",
        flex: 1,
        minWidth: 400,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const row = params.row;
          const isAdmin = row.rol?.toLowerCase() === "admin";

          return (
            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "center",
                height: "100%",
                width: "100%",
                gap: 1 
              }}
            >
              <Button
                variant="contained"
                size="small"
                component={Link}
                to={`/perfil/${row.slug || row.id}`}
                target="_blank"
                sx={{
                  backgroundColor: "#F1B400;",
                  color: "#000000",
                  fontWeight: "bold",
                  boxShadow: "none",
                  minWidth: "60px", 
                  "&:hover": {
                    backgroundColor: "#e0ba50",
                    borderColor: "#e0ba50",
                  },
                }}
              >
                Ver
              </Button>

              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{ minWidth: "70px" }}
                onClick={() => handleEditUsuario(row)}
              >
                Editar
              </Button>

              {isAdmin ? (
                <Button
                  variant="contained"
                  color="inherit"
                  size="small"
                  sx={{ width: 90 }}
                  disabled
                >
                  Denegado
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color={row.estado === "activo" ? "secondary" : "success"}
                  size="small"
                  sx={{ width: 90 }}
                  onClick={() => handleAccionUsuario(row)}
                >
                  {row.estado === "activo" ? "Suspender" : "Activar"}
                </Button>
              )}

              {!isAdmin ? (
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => handleBorrarUsuario(row)}
                >
                  Eliminar
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="inherit"
                  size="small"
                  sx={{ width: 80 }}
                  disabled
                >
                  Denegado
                </Button>
              )}
            </Box>
          );
        },
      },
    ],
    [roles]
  );

  return (
    <>
      <Box sx={{ minWidth: 600 }}>
        <Toolbar disableGutters sx={{ mb: 2 }}>
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            <Grid item>
              <SearchIcon color="action" />
            </Grid>

            <Grid item xs>
              <TextField
                fullWidth
                placeholder="Buscar por Nombre o Email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                variant="standard"
                InputProps={{ disableUnderline: true }}
              />
            </Grid>

            <Grid item>
              <Tooltip title="Recargar">
                <IconButton onClick={() => fetchUsuarios()}>
                  <RefreshIcon color="action" />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Toolbar>

        <DataGrid
          rows={rows}
          columns={columns}
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 20]}
          autoHeight
          loading={loading}
          sx={{ border: 0 }}
          disableRowSelectionOnClick
        />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar Usuario</DialogTitle>
        
        <DialogContent 
          sx={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: 3,             // Espacio entre los inputs
            pt: 5,              // AUMENTADO: Padding superior interno del contenedor
            pb: 3               // Padding inferior
          }}
        >
          {/* Box con margen superior extra para separar del título definitivamente */}
          <Box sx={{ mt: 2 }}> 
            <TextField
              label="Nombre"
              variant="outlined"
              value={usuarioSeleccionado?.nombre || ""}
              onChange={(e) =>
                setUsuarioSeleccionado({
                  ...usuarioSeleccionado,
                  nombre: e.target.value.slice(0, 40),
                })
              }
              fullWidth
              disabled={loadingGuardar}
              inputProps={{ maxLength: 40 }}
              helperText={`${usuarioSeleccionado?.nombre?.length || 0}/40 caracteres`}
            />
          </Box>

          <FormControl fullWidth disabled={loadingGuardar} variant="outlined">
            <InputLabel id="rol-label">Rol</InputLabel>
            <Select
              labelId="rol-label"
              label="Rol"
              value={usuarioSeleccionado?.role_id ?? ""}
              onChange={(e) =>
                setUsuarioSeleccionado({
                  ...usuarioSeleccionado,
                  role_id: Number(e.target.value),
                })
              }
            >
              {roles.map((rol) => (
                <MenuItem key={rol.id} value={rol.id}>
                  {rol.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)} disabled={loadingGuardar} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardar}
            disabled={loadingGuardar}
            sx={{ position: "relative" }}
          >
            {loadingGuardar ? (
              <CircularProgress size={24} sx={{ position: "absolute", color: 'inherit' }} />
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}