import * as React from "react";
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

export default function UsuariosAdmin() {
  const [roles, setRoles] = useState([]);
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [open, setOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

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
      const response = await fetch(
        `${API_URL}/api/usuarios?page=${page + 1}&per_page=${pageSize}&search=${encodeURIComponent(
          search
        )}`
      );
      const data = await response.json();
      setRows(data.usuarios || []);
      setRowCount(data.total || 0);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(0);
      fetchUsuarios();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, page, pageSize, fetchUsuarios]);

  // Abrir modal
  const handleEditUsuario = (row) => {
    let roleId = row.role_id; // puede venir del backend

    // intentar mapear si solo vino "rol"
    if (!roleId && roles.length > 0) {
      const found = roles.find(
        (r) => r.nombre?.toLowerCase() === row.rol?.toLowerCase()
      );
      if (found) roleId = found.id;
    }

    // fallback
    if (!roleId && roles.length > 0) {
      roleId = roles[0].id;
    }

    setUsuarioSeleccionado({ ...row, role_id: Number(roleId) });
    setOpen(true);
  };

  // Guardar cambios
  const handleGuardar = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/usuario/${usuarioSeleccionado.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: usuarioSeleccionado.nombre,
          role_id: Number(usuarioSeleccionado.role_id),
        }),
      });

      if (!res.ok) throw new Error("Error actualizando usuario");

      const data = await res.json();
      const actualizado = data.usuario || data;

      // Actualizar tabla sin recargar
      setRows((prev) =>
        prev.map((u) => (u.id === actualizado.id ? { ...u, ...actualizado } : u))
      );

      setOpen(false);
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const columns = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 70 },
      { field: "nombre", headerName: "Nombre", width: 130 },
      { field: "email", headerName: "Email", width: 200 },
      { field: "rol", headerName: "Rol", width: 130 },
      { field: "fecha_registro", headerName: "Fecha", width: 130 },
      {
        field: "acciones",
        headerName: "Acciones",
        flex: 1,
        minWidth: 300,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const row = params.row;
          return (
            <>
              <Button
                variant="outlined"
                size="small"
                sx={{ mr: 1 }}
                component={Link}
                to={`/perfil/${row.slug}`}
                target="_blank"
              >
                Ver
              </Button>

              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{ mr: 1 }}
                onClick={() => handleEditUsuario(row)}
              >
                Editar
              </Button>

              <Button
                variant="contained"
                color="secondary"
                size="small"
                sx={{ mr: 1 }}
                onClick={() => console.log("Suspender usuario:", row.id)}
              >
                Suspender
              </Button>

              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => console.log("Borrar usuario:", row.id)}
              >
                Borrar
              </Button>
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
          pagination
          paginationMode="server"
          rowCount={rowCount}
          page={page}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          pageSizeOptions={[5, 10, 20]}
          autoHeight
          loading={loading}
          sx={{ border: 0 }}
        />
      </Box>

      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar Usuario</DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Nombre"
            value={usuarioSeleccionado?.nombre || ""}
            onChange={(e) =>
              setUsuarioSeleccionado({
                ...usuarioSeleccionado,
                nombre: e.target.value,
              })
            }
            fullWidth
          />

          <FormControl fullWidth>
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
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
