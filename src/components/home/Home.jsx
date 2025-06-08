import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';

const cards = [
  {
    id: 1,
    title: '🐶 Adoptar Mascota',
    description: 'Conocé mascotas que buscan un hogar.',
  },
  {
    id: 2,
    title: '🆘 Reportar Mascota Perdida',
    description: 'Publicá si perdiste a tu mascota.',
  },
  {
    id: 3,
    title: '📍 Encontré una Mascota',
    description: 'Ayudá a reunirla con su familia.',
  },
  {
    id: 4,
    title: '💊 Asistencia Veterinaria',
    description: 'Solicitá o ofrecé ayuda médica.',
  },
  {
    id: 5,
    title: '👥 Historias y Comunidad',
    description: 'Compartí experiencias con otros usuarios.',
  },
];

const Home = () => {
  const [selectedCard, setSelectedCard] = React.useState(null);

  return (
    <Box sx={{ padding: 4 }}>
      <Box
        sx={{
          width: '100%',
          marginTop: 3,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 2,
        }}
      >
        {cards.map((card, index) => (
          <Card key={card.id}>
            <CardActionArea
              onClick={() => setSelectedCard(index)}
              data-active={selectedCard === index ? '' : undefined}
              sx={{
                height: '100%',
                '&[data-active]': {
                  backgroundColor: 'action.selected',
                  '&:hover': {
                    backgroundColor: 'action.selectedHover',
                  },
                },
              }}
            >
              <CardContent>
                <Typography variant="h5" component="div">
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Home;
