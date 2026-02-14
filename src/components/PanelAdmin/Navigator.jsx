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
import { NavLink, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

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

const APP_URL = import.meta.env.VITE_FRONTEND_URL;

const categories = [
  {
    id: 'Secciones',
    children: [
      { id: 'Inicio', icon: <HomeMaxIcon />, route: 'inicio' },
      { id: 'Usuarios', icon: <PeopleIcon />, route: 'usuarios' },
      { id: 'Publicaciones', icon: <ArticleIcon />, route: 'publicaciones' },
     // { id: 'Imagenes', icon: <PermMediaOutlinedIcon />, route: 'imagenes' },
      { id: 'Comentarios', icon: <ChatBubbleOutlineIcon />, route: 'comentarios' },
      { id: 'Ubicaciones', icon: <LocationOnIcon />, route: 'ubicaciones' },
      { id: 'Etiquetas', icon: <LabelIcon />, route: 'etiquetas' },
    ],
  },
  {
    id: 'Seguimiento',
    children: [
      { id: 'Denuncias', icon: <ReportIcon />, route: 'reportes' },
     // { id: 'Actividad', icon: <DvrIcon />, route: 'performance' },
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
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      localStorage.removeItem("userName");
      localStorage.removeItem("userPhoto");
      localStorage.removeItem("isAdmin");
      console.log("🔒 Sesión cerrada");
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
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
            {id !== "Admin" && (
              <ListItemButton>
                <ListItemText sx={{ color: '#fff' }}>{id}</ListItemText>
              </ListItemButton>
            )}

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
              <>
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
                        <ListItemButton sx={item} onClick={handleLogout}>
                          <ListItemIcon>{icon}</ListItemIcon>
                          <ListItemText>{childId}</ListItemText>
                        </ListItemButton>
                      </ListItem>
                    );
                  }

                  return null;
                })}
              </>
            )}
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </List>
    </Drawer>
  );
}
