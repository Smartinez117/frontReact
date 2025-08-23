/* Barra lateral */
import * as React from 'react';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { NavLink } from 'react-router-dom';

/* iconos */
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PermMediaOutlinedIcon from '@mui/icons-material/PhotoSizeSelectActual';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArticleIcon from '@mui/icons-material/Article';
import LabelIcon from '@mui/icons-material/Label';
import ReportIcon from '@mui/icons-material/Report';
import TimerIcon from '@mui/icons-material/Timer';
import PhonelinkSetupIcon from '@mui/icons-material/PhonelinkSetup';

const categories = [
  {
    id: 'Secciones',
    children: [
      { id: 'Usuarios', icon: <PeopleIcon />, route: 'usuarios' },
      { id: 'Publicaciones', icon: <ArticleIcon />, route: 'publicaciones' },
      { id: 'Imagenes', icon: <PermMediaOutlinedIcon />, route: 'imagenes' },
      { id: 'Comentarios', icon: <ChatBubbleOutlineIcon />, route: 'comentarios' },
      { id: 'Ubicaciones', icon: <LocationOnIcon />, route: 'ubicaciones' },
      { id: 'Etiquetas', icon: <LabelIcon />, route: 'etiquetas' },
    ],
  },
  {
    id: 'Seguimiento',
    children: [
      { id: 'Reportes', icon: <ReportIcon />, route: 'reportes' },
      { id: 'Performance', icon: <TimerIcon />, route: 'performance' },
      { id: 'Test Lab', icon: <PhonelinkSetupIcon />, route: 'test-lab' },
    ],
  },
];

const item = {
  py: '2px',
  px: 3,
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover, &:focus': {
    bgcolor: 'rgba(255, 255, 255, 0.08)',
  },
};

const itemCategory = {
  boxShadow: '0 -1px 0 rgb(255,255,255,0.1) inset',
  py: 1.5,
  px: 3,
};

export default function Navigator(props) {
  const { ...other } = props;

  return (
    <Drawer variant="permanent" {...other}>
      <List disablePadding>
        <ListItem sx={{ ...item, ...itemCategory, fontSize: 22, color: '#fff' }}>
          Redema
        </ListItem>
        <ListItem sx={{ ...item, ...itemCategory }}>
          <ListItemIcon>
            <AdminPanelSettingsIcon />
          </ListItemIcon>
          <ListItemText>Panel administrativo</ListItemText>
        </ListItem>
        {categories.map(({ id, children }) => (
          <Box key={id} sx={{ bgcolor: '#101F33' }}>
            <ListItem sx={{ py: 2, px: 3 }}>
              <ListItemText sx={{ color: '#fff' }}>{id}</ListItemText>
            </ListItem>
            {children.map(({ id: childId, icon, route }) => (
              <ListItem disablePadding key={childId}>
                <ListItemButton
                  component={NavLink}
                  to={`/admin/panel/${route}`}
                  sx={item}
                  style={({ isActive }) =>
                    isActive
                      ? { color: '#4fc3f7', backgroundColor: 'rgba(255,255,255,0.08)' }
                      : {}
                  }
                >
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText>{childId}</ListItemText>
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </List>
    </Drawer>
  );
}
