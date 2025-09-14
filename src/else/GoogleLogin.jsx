import * as React from 'react';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase"
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import { GoogleIcon, RedemaIcon } from '../shared-theme/CustomIcons';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function Login(props) {
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const customProvider = new GoogleAuthProvider()
      customProvider.setCustomParameters({ prompt: "select_account" })
      const result = await signInWithPopup(auth, customProvider)
      const user = result.user
      const idToken = await user.getIdToken()

      localStorage.setItem("userName", user.displayName)
      localStorage.setItem("userPhoto", user.photoURL)
      localStorage.setItem("userEmail", user.email)
      localStorage.setItem("token", idToken)

      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("userIdLocal", data.idLocal) // guardar id de la BD
        navigate("/home")
      } else {
        alert("Error en autenticación con backend")
      }
    } catch (error) {
      console.error("Error en login con Google:", error)
    }
  }

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
        <Card variant="outlined">
          <RedemaIcon sx={{ width: "90%", fontSize: "10rem" }} />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(1rem, 10vw, 1.75rem)' }}
            align="center"
          >
            Bienvenid@ a Redema
          </Typography>
          <Typography
            variant="body3"
            sx={{ width: '100%' }}
            align="center"
          >
            Inicia sesión para continuar.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleLogin}
              startIcon={<GoogleIcon />}
            >
              Iniciar sesión con Google
            </Button>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
