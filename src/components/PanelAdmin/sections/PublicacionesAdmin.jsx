import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import JoyCssBaseline from '@mui/joy/CssBaseline';
import AspectRatio from '@mui/joy/AspectRatio';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function PublicacionesAdmin() {
  const [publicaciones, setPublicaciones] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const fetchPublicaciones = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/publicaciones?page=0&limit=12`);
      const data = await response.json();
      setPublicaciones(data || []);
    } catch (error) {
      console.error('Error cargando publicaciones:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPublicaciones();
  }, [fetchPublicaciones]);

  if (loading) return <p>Cargando publicaciones...</p>;

  return (
    <CssVarsProvider>
      <JoyCssBaseline />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {publicaciones.map((pub) => (
          <Card key={pub.id} sx={{ width: 320, position: 'relative' }}>
            <div>
              <Typography level="title-lg">{pub.titulo}</Typography>
              <Typography level="body-sm">
                {new Date(pub.fecha_creacion).toLocaleDateString()}
              </Typography>
            </div>
            {pub.imagenes && pub.imagenes.length > 0 && (
              <AspectRatio minHeight="120px" maxHeight="200px">
                <img
                  src={pub.imagenes[0]}
                  alt={pub.titulo}
                  loading="lazy"
                />
              </AspectRatio>
            )}
            <CardContent orientation="horizontal">
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <Button
                  variant="solid"
                  size="md"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                  component={Link}
                  to = {`/publicacion/${pub.id}`}
                  target="_blank"
                >
                  Ver
                </Button>
                <Button
                  variant="solid"
                  size="md"
                  color="danger"
                  sx={{ fontWeight: 600 }}
                  onClick={() => console.log('Borrar publicación', pub.id)}
                >
                  Borrar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </CssVarsProvider>
  );
}
