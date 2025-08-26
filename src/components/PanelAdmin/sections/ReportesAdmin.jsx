import * as React from "react";
import { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Paper from "@mui/material/Paper";
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

// Definimos las columnas de la tabla de reportes
const columns = (handleEliminar) => [
  { field: "id", headerName: "ID", width: 70 },
  { field: "id_publicacion", headerName: "ID Publicación", width: 130 },
  { field: "usuario", headerName: "Usuario", width: 150 },
  { field: "tipo", headerName: "Tipo", width: 160 },
  { field: "descripcion", headerName: "Descripción", width: 250 },
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
        <>
          <Button
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => console.log("Ver reporte:", id)}
          >
            Ver
          </Button>
          <Button
            variant="contained"
            color="success"
            size="small"
            sx={{ mr: 1 }}
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
        </>
      );
    },
  },
];

const paginationModel = { page: 0, pageSize: 5 };

export default function ReportesAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Obtener todos los reportes del backend
  const fetchReportes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/reportes`);
      const data = await res.json();

      // Mapear los datos si es necesario (depende de tu backend)
      const formateados = data.map((r) => ({
        id: r.id,
        id_publicacion: r.id_publicacion,
        usuario: r.usuario || `Usuario ${r.id_usuario}`, // si no mandás nombre, al menos mostrar ID
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

  // 🔹 Eliminar un reporte
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

  // Ejecutar fetch al montar el componente
  useEffect(() => {
    fetchReportes();
  }, []);

  return (
    <Paper sx={{ maxWidth: 1200, margin: "auto", overflow: "hidden" }}>
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.12)" }}
      >
        <Toolbar>
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            <Grid item>
              <SearchIcon color="inherit" sx={{ display: "block" }} />
            </Grid>
            <Grid item xs>
              <TextField
                fullWidth
                placeholder="Buscar por usuario, tipo o publicación"
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: "default" },
                }}
                variant="standard"
              />
            </Grid>
            <Grid item>
              <Tooltip title="Recargar">
                <IconButton onClick={fetchReportes}>
                  <RefreshIcon color="inherit" sx={{ display: "block" }} />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>

      <DataGrid
        rows={rows}
        columns={columns(handleEliminar)}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        loading={loading}
        sx={{ border: 0, height: 500 }}
      />
    </Paper>
  );
}
