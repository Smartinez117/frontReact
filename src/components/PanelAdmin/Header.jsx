import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import HelpIcon from '@mui/icons-material/Help';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const lightColor = 'rgba(255, 255, 255, 0.7)';

function Header({ onDrawerToggle, title }) {
  const auth = getAuth();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name = localStorage.getItem("userName");
        const photo = localStorage.getItem("userPhoto");

        if (name) setUserName(name);
        if (photo) setUserPhoto(photo);
      } else {
        setUserName('');
        setUserPhoto('');
        localStorage.removeItem("userName");
        localStorage.removeItem("userPhoto");
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const lightColor = 'rgba(255, 255, 255, 0.7)';

  return (
    <React.Fragment>
      {/* Barra superior */}
      <AppBar color="primary" position="sticky" elevation={0}>
        <Toolbar>
          <Grid container spacing={1} sx={{ alignItems: 'center' }}>
            <Grid sx={{ display: { sm: 'none', xs: 'block' } }} item>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={onDrawerToggle}
                edge="start"
              >
                <MenuIcon />
              </IconButton>
            </Grid>
            <Grid item xs />
            <Grid item>
              <Link
                href="/"
                variant="body2"
                sx={{
                  textDecoration: 'none',
                  color: lightColor,
                  '&:hover': { color: 'common.white' },
                }}
                rel="noopener noreferrer"
                target="_blank"
              >
                Go to docs
              </Link>
            </Grid>
            <Grid item>
              <Tooltip title="Alerts • No alerts">
                <IconButton color="inherit">
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <IconButton color="inherit" sx={{ p: 0.5 }}>
                {userPhoto ? (
                  <Avatar alt={userName || "User"} src={userPhoto} />
                ) : (
                  <Avatar alt="User" src="/default-profile.png" />
                )}
              </IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>

      {/* Barra secundaria con título */}
      <AppBar
        component="div"
        color="primary"
        position="static"
        elevation={0}
        sx={{ zIndex: 0 }}
      >
        <Toolbar>
          <Grid container spacing={1} sx={{ alignItems: 'center' }}>
            <Grid item xs>
              <Typography color="inherit" variant="h5" component="h1">
                {title}
              </Typography>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}

Header.propTypes = {
  onDrawerToggle: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export default Header;
