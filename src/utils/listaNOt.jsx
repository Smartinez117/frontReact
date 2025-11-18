import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';

export default function AlignItemsList({ notificaciones }) {
  const handleVerClick = (notificacion) =>{ window.location.href = `/publicacion/${notificacion.id_publicacion}`;}
  return (
    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'white' }}>
      {notificaciones.map((notificacion, index) => (
        <React.Fragment key={index}>
          <ListItem alignItems="flex-start">
            <ListItemText
              primary={
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ color: 'text.primary', display: 'inline' }}
                >
                  {notificacion.titulo}
                </Typography>
              }
            />
            <button
              variant="outlined" 
              size="small"
              onClick={() => handleVerClick(notificacion)}
              sx={{ flexShrink: 0 }} // Evita que el botón se comprima
            >
              VER
            </button>
          </ListItem>
          {index < notificaciones.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
}