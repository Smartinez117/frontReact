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
import Collapse from '@mui/material/Collapse';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeMaxIcon from '@mui/icons-material/HomeMax';
import DvrIcon from '@mui/icons-material/Dvr';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const APP_URL = import.meta.env.VITE_FRONTEND_URL;

const categories = [
  {
    id: 'Secciones',
    children: [
      { id: 'Inicio', icon: <HomeMaxIcon />, route: 'inicio' },
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
      { id: 'Actividad', icon: <DvrIcon />, route: 'performance' },
    ],
  },
  { 
    id: 'Admin',
    children:[
      { id: 'Volver al sitio', icon: <ArrowBackIcon />, route: 'APP_URL' },
      { id: 'Cerrar sesión', icon: <LogoutIcon />, route: 'logout' }
    ]
  }
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
  const [openAdmin, setOpenAdmin] = React.useState(false);

  const handleToggleAdmin = () => {
    setOpenAdmin(!openAdmin);
  };

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
            <ListItemButton onClick={id === "Admin" ? handleToggleAdmin : undefined}>
              <ListItemText sx={{ color: '#fff' }}>{id}</ListItemText>
              {id === "Admin" && (openAdmin ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>

            {id !== "Admin" ? (
              <>
                {children.map(({ id: childId, icon, route }) => {
                  const path =
                    route === 'inicio'
                      ? '/admin/panel'
                      : `/admin/panel/${route}`;

                  return (
                    <ListItem disablePadding key={childId}>
                      <ListItemButton
                        component={NavLink}
                        to={path}
                        end={route === 'inicio'}
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
                  );
                })}
              </>
            ) : (
              <Collapse in={openAdmin} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {children.map(({ id: childId, icon, route }) => {
                    if (route === "APP_URL") {
                      return (
                        <ListItem disablePadding key={childId}>
                          <ListItemButton
                            sx={item}
                            onClick={() => window.location.href = APP_URL}
                          >
                            <ListItemIcon>{icon}</ListItemIcon>
                            <ListItemText>{childId}</ListItemText>
                          </ListItemButton>
                        </ListItem>
                      );
                    }

                    if (route === "logout") {
                      return (
                        <ListItem disablePadding key={childId}>
                          <ListItemButton sx={item} onClick={() => console.log("Cerrar sesión")}>
                            <ListItemIcon>{icon}</ListItemIcon>
                            <ListItemText>{childId}</ListItemText>
                          </ListItemButton>
                        </ListItem>
                      );
                    }

                    return null;
                  })}
                </List>
              </Collapse>
            )}
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </List>
    </Drawer>
  );
}
