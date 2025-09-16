import * as React from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function Header({ userName, userPhoto, onDrawerToggle, title }) {
  return (
    <AppBar color="primary" position="sticky" elevation={0}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 1, sm: 2 }, // padding horizontal responsivo
        }}
      >
        {/* Lado izquierdo: botón menú y título */}
        <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={onDrawerToggle}
            edge="start"
            sx={{ display: { sm: "none", xs: "block" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="h1"
            noWrap
            sx={{
              ml: 2,
              flexShrink: 1, // se achica si no hay espacio
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Lado derecho: notificaciones y avatar */}
        <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <Tooltip title="Alerts • No alerts">
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
          </Tooltip>
          <IconButton color="inherit" sx={{ p: 0.5 }}>
            {userPhoto ? (
              <Avatar alt={userName || "User"} src={userPhoto} />
            ) : (
              <Avatar alt="User" src="/default-profile.png" />
            )}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  onDrawerToggle: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export default Header;
