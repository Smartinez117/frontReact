import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import JoyCssBaseline from '@mui/joy/CssBaseline';
import AspectRatio from '@mui/joy/AspectRatio';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import Sheet from '@mui/joy/Sheet';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from "react-router-dom";
import { useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function PublicacionesAdmin() {
  const [publicaciones, setPublicaciones] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [expanded, setExpanded] = React.useState({});
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [total, setTotal] = React.useState(0);

  const fetchPublicaciones = useCallback(async (pagina = 1, limite = 15) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/admin/publicaciones?page=${pagina}&limit=${limite}`
      );

      if (!response.ok) {
        throw new Error("Error al traer publicaciones");
      }

      const data = await response.json();

      // Agregar primera imagen
      const publicacionesConImagen = data.publicaciones.map((pub) => ({
        ...pub,
        primeraImagen: pub.imagenes?.length > 0 ? pub.imagenes[0] : null,
      }));

      setPublicaciones(publicacionesConImagen);
      setTotal(data.total);
      setPage(data.page);
      setLimit(data.limit);

    } catch (error) {
      console.error("Error cargando publicaciones:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPublicaciones();
  }, [fetchPublicaciones]);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <p>Cargando publicaciones...</p>;

  return (
    <CssVarsProvider>
      <JoyCssBaseline />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>

        {publicaciones.map((pub) => (
          <Card key={pub.id} sx={{ width: 320, position: "relative", p: 1 }}>
            
            {/* Título y fecha */}
            <Typography level="title-lg">{pub.titulo}</Typography>
            <Typography level="body-sm">
              {new Date(pub.fecha_creacion).toLocaleDateString("es-AR")}
            </Typography>

            {/* Imagen principal */}
            {pub.primeraImagen && (
              <AspectRatio minHeight="120px" maxHeight="200px" sx={{ mt: 1 }}>
                <img src={pub.primeraImagen} alt={pub.titulo} loading="lazy" />
              </AspectRatio>
            )}

            {/* Botón expandir */}
            <IconButton
              variant="plain"
              color="neutral"
              onClick={() => toggleExpand(pub.id)}
              sx={{
                mt: 1,
                rotate: expanded[pub.id] ? "180deg" : "0deg",
                transition: "0.2s"
              }}
            >
              <ExpandMoreIcon />
            </IconButton>

            {/* Datos del usuario */}
            {expanded[pub.id] && (
              <Sheet variant="soft" sx={{ p: 1, mt: 1, borderRadius: "sm" }}>
                <Typography level="body-sm">
                  <b>Propietario:</b> {pub.usuario?.nombre || "Sin nombre"}
                </Typography>

                <Typography level="body-sm">
                  <b>Email:</b> {pub.usuario?.email || "Sin email"}
                </Typography>
              </Sheet>
            )}

            {/* Botones */}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: 10 }}>
              <Button
                variant="solid"
                size="md"
                color="primary"
                sx={{ fontWeight: 600 }}
                component={Link}
                to={`/publicacion/${pub.id}`}
                target="_blank"
              >
                Ver
              </Button>

              <Button
                variant="solid"
                size="md"
                color="danger"
                sx={{ fontWeight: 600 }}
                onClick={() => console.log("Borrar publicación", pub.id)}
              >
                Borrar
              </Button>
            </div>

          </Card>
        ))}

      </div>

      {/* PAGINADO */}
      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
        <Button
          disabled={page <= 1}
          onClick={() => fetchPublicaciones(page - 1, limit)}
        >
          ◀ Anterior
        </Button>

        <Typography level="title-md">Página {page}</Typography>

        <Button
          disabled={page * limit >= total}
          onClick={() => fetchPublicaciones(page + 1, limit)}
        >
          Siguiente ▶
        </Button>
      </div>

    </CssVarsProvider>
  );
}
