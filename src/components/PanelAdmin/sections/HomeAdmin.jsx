import { useEffect, useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import ArticleIcon from '@mui/icons-material/Article';
import ReportIcon from '@mui/icons-material/Report';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import SosIcon from '@mui/icons-material/Sos';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';

export default function HomeAdmin() {
  const [stats, setStats] = useState({
    usuarios: 0,
    publicaciones: 0,
    reportes: 0,
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/estadisticas`);
      const data = await res.json();

      setStats({
        usuarios: data.usuarios || 0,
        publicaciones: data.publicaciones || 0,
        reportes: data.reportes || 0,
      });
    } catch (error) {
      console.error("Error al traer estadísticas", error);
    }
  };

  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 , Width: 300 , height: 120}}>
          <Typography variant="h6">Usuarios registrados</Typography>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            <PersonIcon fontSize="large" />
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {stats.usuarios}
            </Typography>
          </div>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 , Width: 300 , height: 120}}>
          <Typography variant="h6">Publicaciones creadas</Typography>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            <ArticleIcon fontSize="large" />
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {stats.publicaciones}
            </Typography>
          </div>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 , Width: 300 , height: 120}}>
          <Typography variant="h6">Reportes pendientes</Typography>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            <ReportIcon fontSize="large" />
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {stats.reportes}
            </Typography>
          </div>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 , Width: 300 , height: 120}}>
          <Typography variant="h6">Mascotas perdidas</Typography>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            <SearchIcon fontSize="large" />
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              000+
            </Typography>
          </div>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 , Width: 300 , height: 120}}>
          <Typography variant="h6">Mascotas encontradas</Typography>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            <MyLocationIcon fontSize="large" />
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              000+
            </Typography>
          </div>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 , Width: 300 , height: 120}}>
          <Typography variant="h6">Mascotas en adopción</Typography>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            <VolunteerActivismIcon fontSize="large" />
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              000+
            </Typography>
          </div>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 , Width: 300 , height: 120}}>
          <Typography variant="h6">Mascotas en estado critico</Typography>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            <SosIcon fontSize="large" />
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              000+
            </Typography>
          </div>
        </Paper>
      </Grid>

    </Grid>

  );
}
