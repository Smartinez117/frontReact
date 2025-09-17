import * as React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/GridLegacy';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DataGrid } from '@mui/x-data-grid';

const API_URL = import.meta.env.VITE_API_URL;

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'nombre', headerName: 'Nombre', width: 130 },
  { field: 'email', headerName: 'Email', width: 200 },
  { field: 'rol', headerName: 'Rol', description: 'Muestra si es admin o usuario común', width: 90 },
  { field: 'fecha_registro', headerName: 'Fecha de registro', width: 130 },
  {
    field: 'acciones',
    headerName: 'Acciones',
    width: 350,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const id = params.row.id;
      const slug = params.row.slug;
      return (
        <>
          <Button
            component={Link}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
            target="_blank"
            to={`/perfil/${slug}`}
          >
            Ver
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => console.log("Editar usuario:", id)}
          >
            Editar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => console.log("Suspender usuario:", id)}
          >
            Suspender
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => console.log("Borrar usuario:", id)}
          >
            Borrar
          </Button>
        </>
      );
    }
  }
];

export default function UsuariosAdmin() {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0); // DataGrid usa 0-based
  const [pageSize, setPageSize] = useState(10);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}api/usuarios?page=${page + 1}&per_page=${pageSize}&search=${encodeURIComponent(search)}`
      );
      const data = await response.json();
      setRows(data.usuarios);
      setRowCount(data.total);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  // Ejecutar fetch con debounce cuando cambia la búsqueda
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(0); // reset página al cambiar búsqueda
      fetchUsuarios();
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, page, pageSize, fetchUsuarios]);

  return (
    <Box sx={{ minWidth: 600 }}>
      {/* Filtros y acciones */}
      <Toolbar disableGutters sx={{ mb: 2 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid item>
            <SearchIcon color="action" />
          </Grid>
          <Grid item xs>
            <TextField
              fullWidth
              placeholder="Buscar por Nombre o Email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                disableUnderline: true,
                sx: { fontSize: 'default' },
              }}
              variant="standard"
            />
          </Grid>
          <Grid item>
            <Button variant="contained" sx={{ mr: 1 }}>
              Agregar usuario
            </Button>
            <Tooltip title="Reload">
              <IconButton onClick={() => fetchUsuarios()}>
                <RefreshIcon color="action" />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Toolbar>

      {/* Tabla */}
      <DataGrid
        rows={rows}
        columns={columns}
        pagination
        paginationMode="server"
        rowCount={rowCount} // total de registros
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
  );
}
