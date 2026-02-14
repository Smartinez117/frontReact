import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { Outlet, useLocation } from 'react-router-dom'; // 👈 IMPORTANTE PARA CAMBIAR EL TITULO SEGÚN LA RUTA
import Navigator from './Navigator';
import Header from './Header';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Typography from '@mui/material/Typography';
import ModalGeneral from './ModalGeneral'; 


let theme = createTheme({
  palette: {
    primary: {
      light: '#63ccff',
      main: '#009be5',
      dark: '#006db3',
    },
  },
  typography: {
    h5: {
      fontWeight: 500,
      fontSize: 26,
      letterSpacing: 0.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTab: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
  mixins: {
    toolbar: {
      minHeight: 48,
    },
  },
});

theme = {
  ...theme,
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#081627',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
        contained: {
          boxShadow: 'none',
          '&:active': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          marginLeft: theme.spacing(1),
        },
        indicator: {
          height: 3,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          backgroundColor: theme.palette.common.white,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          margin: '0 16px',
          minWidth: 0,
          padding: 0,
          [theme.breakpoints.up('md')]: {
            padding: 0,
            minWidth: 0,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: theme.spacing(1),
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 4,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgb(255,255,255,0.15)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#4fc3f7',
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: 14,
          fontWeight: theme.typography.fontWeightMedium,
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: 'inherit',
          minWidth: 'auto',
          marginRight: theme.spacing(2),
          '& svg': {
            fontSize: 20,
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 32,
          height: 32,
        },
      },
    },
  },
};

const drawerWidth = 256;

// … Todo tu código actual arriba sigue igual …

export default function PanelAdmin() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const location = useLocation(); 

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Datos del usuario:
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // <-- NUEVO

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserName(user.displayName);
        setUserPhoto(user.photoURL);
        localStorage.setItem("userName", user.displayName);
        localStorage.setItem("userPhoto", user.photoURL);

        // <-- validación admin
        try {
          const tokenResult = await user.getIdTokenResult();
          setIsAdmin(!!tokenResult.claims.admin);
        } catch (err) {
          console.error("Error leyendo claims de admin:", err);
          setIsAdmin(false);
        }

      } else {
        setUserName('');
        setUserPhoto('');
        setIsAdmin(false);
        localStorage.removeItem("userName");
        localStorage.removeItem("userPhoto");
      }
    });

    return () => unsubscribe();
  }, []);

  // Si el usuario no es admin, mostramos mensaje y no renderizamos el panel
  if (!isAdmin) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">
          No tenés permisos de administrador
        </Typography>
      </Box>
    );
  }

  // 👇 opcional: título dinámico según la ruta
  const getTitle = () => {
    if (location.pathname.includes("usuarios")) return "Usuarios";
    if (location.pathname.includes("publicaciones")) return "Publicaciones";
    if (location.pathname.includes("imagenes")) return "Imagenes";
    if (location.pathname.includes("comentarios")) return "Comentarios";
    if (location.pathname.includes("ubicaciones")) return "Ubicaciones";
    if (location.pathname.includes("etiquetas")) return "Etiquetas";
    if (location.pathname.includes("reportes")) return "Denuncias";
    if (location.pathname.includes("actividad")) return "Actividad";
    return "Inicio";
  };

  // … resto de tu código actual sigue igual …
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          {isSmUp ? null : (
            <Navigator
              PaperProps={{ style: { width: drawerWidth } }}
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
            />
          )}
          <Navigator
            PaperProps={{ style: { width: drawerWidth } }}
            sx={{ display: { sm: 'block', xs: 'none' } }}
          />
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Header title={getTitle()} onDrawerToggle={handleDrawerToggle} userName={userName} userPhoto={userPhoto} />
          <Box
            component="main"
            sx={{
              flex: 1,
              py: 6,
              px: 4,
              bgcolor: '#eaeff1',
              maxWidth: '100vw',
              overflow: 'hidden',
            }}
          >
            <Paper
              sx={{
                width: '100%',
                p: 2,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Outlet/>
              </Box>
            </Paper>
          </Box>
          <Box component="footer" sx={{ p: 2, bgcolor: '#eaeff1' }}></Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
