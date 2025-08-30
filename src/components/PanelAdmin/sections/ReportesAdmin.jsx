import * as React from "react";
import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Toolbar from "@mui/material/Toolbar";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DataGrid } from "@mui/x-data-grid";

// URL del backend Flask
const API_URL = "http://localhost:5000";

// Columnas de la tabla
const columns = (handleEliminar) => [
  { field: "id", headerName: "ID", width: 70 },
  { field: "id_publicacion", headerName: "ID Publicación", width: 130 },
  { field: "usuario", headerName: "Usuario", width: 150 },
  { field: "tipo", headerName: "Tipo", width: 160 },
  { field: "descripcion", headerName: "Descripción", width: 250, flex: 1 },
  { field: "fecha", headerName: "Fecha", width: 160 },
  {
    field: "acciones",
    headerName: "Acciones",
    width: 300,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const id = params.row.id;
      return (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => console.log("Ver reporte:", id)}
          >
            Ver
          </Button>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={() => console.log("Marcar resuelto:", id)}
          >
            Resuelto
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleEliminar(id)}
          >
            Eliminar
          </Button>
        </Box>
      );
    },
  },
];

const paginationModel = { page: 0, pageSize: 5 };

export default function ReportesAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener reportes
  const fetchReportes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/reportes`);
      const data = await res.json();

      const formateados = data.map((r) => ({
        id: r.id,
        id_publicacion: r.id_publicacion,
        usuario: r.usuario || `Usuario ${r.id_usuario}`,
        tipo: r.tipo,
        descripcion: r.descripcion,
        fecha: r.fecha || "N/A",
      }));

      setRows(formateados);
    } catch (error) {
      console.error("Error al obtener reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar reporte
  const handleEliminar = async (id) => {
    try {
      await fetch(`${API_URL}/reportes/${id}`, {
        method: "DELETE",
      });
      setRows(rows.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error al eliminar reporte:", error);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Filtros y acciones */}
      <Toolbar disableGutters sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <SearchIcon color="action" />
          </Grid>
          <Grid item xs>
            <TextField
              fullWidth
              placeholder="Buscar por usuario o descripción"
              variant="standard"
            />
          </Grid>
          <Grid item>
            <Button variant="contained" sx={{ mr: 1 }}>
              Buscar reporte
            </Button>
            <Tooltip title="Reload">
              <IconButton onClick={fetchReportes}>
                <RefreshIcon color="action" />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Toolbar>

      {/* Tabla responsive */}
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <DataGrid
          rows={rows}
          columns={columns(handleEliminar)}
          pageSizeOptions={[5, 10]}
          paginationModel={paginationModel}
          autoHeight
          density="comfortable"
          loading={loading}
          sx={{
            border: 0,
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal',
              lineHeight: '1.4 !important',
              maxHeight: 'none !important',
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#f5f5f5',
            },
          }}
        />
      </Box>
    </Box>
  );
}
