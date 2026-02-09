import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  CardActionArea, 
  Container
} from '@mui/material';

// Iconos
import PostAddIcon from '@mui/icons-material/PostAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';

const cards = [
  {
    id: 1,
    title: 'Publicá',
    description: 'Publica una búsqueda, encuentro, adopción o caso crítico.',
    icon: <PostAddIcon sx={{ fontSize: 50 }} />,
    url: "/publicar",
    color: '#e3f2fd', 
    iconColor: '#27a8c5ff'
  },
  {
    id: 2,
    title: 'Buscá',
    description: 'Filtra entre miles de publicaciones para encontrar a tu compañero.',
    icon: <VisibilityIcon sx={{ fontSize: 50 }} />,
    url: "/buscar",
    color: '#f3e5f5', 
    iconColor: '#e4ae18ff'
  },
  {
    id: 3,
    title: 'Navegá',
    description: 'Explora el mapa interactivo con publicaciones y refugios cercanos.',
    icon: <TravelExploreIcon sx={{ fontSize: 50 }} />,
    url: "/mapa", 
    color: '#e8f5e9', 
    iconColor: '#d32222ff'
  },
];

const Home = () => {
  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', pb: 0 }}> {/* pb: 0 para que el footer (si hay) o el fondo peguen bien */}
      
      {/* --- HERO SECTION (Portada Limpia) --- */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '50vh', md: '60vh' }, 
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'url("https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          }
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white' }}>
          <Typography 
            variant="h2" 
            component="h1" 
            fontWeight="800" 
            gutterBottom
            sx={{ fontSize: { xs: '2.5rem', md: '3.75rem' }, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
          >
            Reencontrando amigos,<br /> uniendo familias.
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ opacity: 0.95, fontSize: { xs: '1rem', md: '1.25rem' }, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
          >
            La red más grande para conectar mascotas perdidas, en adopción y urgencias.
          </Typography>
          {/* Botón eliminado */}
        </Container>
      </Box>

      {/* --- CARDS SECTION --- */}
      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: -10 }, mb: 8, position: 'relative', zIndex: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: 4 
          }}
        >
          {cards.map((card) => (
            <Card 
              key={card.id}
              sx={{ 
                width: 340, 
                maxWidth: '100%',
                borderRadius: 4,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)', 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                }
              }}
            >
              <CardActionArea 
                component={Link} 
                to={card.url} 
                sx={{ height: '100%', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
              >
                <Box 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    bgcolor: card.color, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    color: card.iconColor,
                    mb: 2
                  }}
                >
                  {card.icon}
                </Box>
                
                <CardContent sx={{ p: 0 }}>
                  <Typography gutterBottom variant="h5" component="div" fontWeight="bold" color="text.primary">
                    {card.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Container>

      {/* --- SECCIÓN INFORMATIVA AMARILLA --- */}
      <Box sx={{ py: 8, bgcolor: '#FFF8E1', textAlign: 'center' }}> 
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
            ¿Cómo funciona REDEMA?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
            Somos una comunidad dedicada a ayudar a los animales. Utiliza nuestro mapa interactivo para geolocalizar mascotas perdidas, publicar alertas de adopción o encontrar el refugio más cercano en segundos.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;