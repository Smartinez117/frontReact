
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
// Asegúrate de que esta utilidad funcione correctamente, si falla usa auth.currentUser.getIdToken()
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

const API_URL = import.meta.env.VITE_API_URL;

// ------------------------------------------------------------------
// CORRECCIÓN: Eliminamos la variable 'token' global.
// ------------------------------------------------------------------

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

  const [open, setOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [accionUsuario, setAccionUsuario] = useState({ row: null, accion: "" });
  const [borrarUsuario, setBorrarUsuario] = useState(null);
  const [confirmBorrarOpen, setConfirmBorrarOpen] = useState(false);
  const [loadingAccion, setLoadingAccion] = useState(false);
  const [loadingBorrado, setLoadingBorrado] = useState(false);
  const [loadingGuardar, setLoadingGuardar] = useState(false);

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
      
      // Nota: Si tus rutas GET también son protegidas, deberías añadir el header Authorization aquí también.
      // Si son públicas, déjalo así.
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

  // Abrir modal EDICIÓN DE USUARIO
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

  // Guardar cambios
  const handleGuardar = async () => {
    try {
      setLoadingGuardar(true);
      // CORRECCIÓN: Obtenemos el token AQUÍ, justo antes de usarlo
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

  // Acciones (Suspender/Activar)
  const handleAccionUsuario = (row) => {
    const accion = row.estado === "activo" ? "suspender" : "activar";
    setAccionUsuario({ row, accion });
    setConfirmOpen(true);
  };

  const ejecutarAccion = async () => {
    if (!accionUsuario) return;
    const { row, accion } = accionUsuario;
    setLoadingAccion(true);
    try {
      // CORRECCIÓN: Obtenemos el token AQUÍ, justo antes de usarlo
      const token = await getFreshToken();

      const res = await fetch(
        `${API_URL}/api/admin/usuarios/${row.id}/${accion}`,
        { method: "PATCH" ,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en la acción");

      setRows((prev) =>
        prev.map((u) =>
          u.id === row.id ? { ...u, estado: data.usuario.estado } : u
        )
      );

      setSnackbarMessage(
        accion === "suspender" ? "Usuario suspendido" : "Usuario activado"
      );
      setSnackbarSeverity(accion === "suspender" ? "warning" : "success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error(error);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoadingAccion(false);
      setConfirmOpen(false);
      setAccionUsuario(null);
    }
  };

  // Eliminar
  const handleBorrarUsuario = (row) => {
    setBorrarUsuario(row);
    setConfirmBorrarOpen(true);
  };

  const ejecutarBorrado = async () => {
    if (!borrarUsuario) return;
    setLoadingBorrado(true);
    try {
      // CORRECCIÓN: Obtenemos el token AQUÍ, justo antes de usarlo
      const token = await getFreshToken();

      const res = await fetch(
        `${API_URL}/api/admin/usuarios/${borrarUsuario.id}`,
        { method: "DELETE", 
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar usuario");

      setRows((prev) => prev.filter((u) => u.id !== borrarUsuario.id));
      setRowCount((prev) => prev - 1);

      setSnackbarMessage(`Usuario borrado`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } catch (error) {
      console.error(error);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoadingBorrado(false);
      setConfirmBorrarOpen(false);
      setBorrarUsuario(null);
    }
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
        minWidth: 300,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const row = params.row;
          const isAdmin = row.rol?.toLowerCase() === "admin";

          return (
            <>
              <Button
                variant="outlined"
                size="small"
                sx={{ mr: 1 }}
                component={Link}
                to={`/perfil/${row.slug || row.id}`}
                target="_blank"
                disabled={loadingAccion || loadingBorrado}
              >
                Ver
              </Button>

              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{ mr: 1 }}
                onClick={() => handleEditUsuario(row)}
                disabled={loadingAccion || loadingBorrado}
              >
                Editar
              </Button>

              {isAdmin ? (
                <Button
                  variant="contained"
                  color="inherit"
                  size="small"
                  sx={{ mr: 1, width: 90 }}
                  disabled
                >
                  Denegado
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color={row.estado === "activo" ? "secondary" : "success"}
                  size="small"
                  sx={{ mr: 1, width: 90, position: "relative" }}
                  onClick={() => handleAccionUsuario(row)}
                  disabled={loadingAccion || loadingBorrado}
                >
                  {loadingAccion ? (
                    <CircularProgress size={20} sx={{ position: "absolute" }} />
                  ) : (
                    (row.estado === "activo" ? "Suspender" : "Activar")
                  )}
                </Button>
              )}

              {!isAdmin ? (
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => handleBorrarUsuario(row)}
                  disabled={loadingAccion || loadingBorrado}
                  sx={{ position: "relative" }}
                >
                  {loadingBorrado ? (
                    <CircularProgress size={20} sx={{ position: "absolute" }} />
                  ) : (
                    "Borrar"
                  )}
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
            </>
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

      {/* MODAL EDITAR */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Nombre"
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
          <FormControl fullWidth disabled={loadingGuardar}>
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
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loadingGuardar}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardar}
            disabled={loadingGuardar}
            sx={{ position: "relative" }}
          >
            {loadingGuardar ? (
              <CircularProgress size={20} sx={{ position: "absolute" }} />
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL CONFIRMAR ACCIÓN */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>
          {accionUsuario?.accion === "suspender"
            ? "Confirmar suspensión"
            : "Confirmar activación"}
        </DialogTitle>
        <DialogContent>
          {accionUsuario?.row && (
            <p>
              ¿Seguro que quieres {accionUsuario.accion} al usuario{" "}
              <strong>{accionUsuario.row.nombre}</strong>?
            </p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={loadingAccion}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={ejecutarAccion}
            color={accionUsuario?.accion === "suspender" ? "secondary" : "success"}
            disabled={loadingAccion}
            sx={{ position: "relative" }}
          >
            {loadingAccion ? (
              <CircularProgress size={20} sx={{ position: "absolute" }} />
            ) : (
              (accionUsuario?.accion === "suspender" ? "Suspender" : "Activar")
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL ELIMINAR */}
      <Dialog open={confirmBorrarOpen} onClose={() => setConfirmBorrarOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          {borrarUsuario && (
            <p>
              ¿Seguro que quieres borrar al usuario <strong>{borrarUsuario.nombre}</strong>?
            </p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmBorrarOpen(false)} disabled={loadingBorrado}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={ejecutarBorrado}
            disabled={loadingBorrado}
            sx={{ position: "relative" }}
          >
            {loadingBorrado ? (
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