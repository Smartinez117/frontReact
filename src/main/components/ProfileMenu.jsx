import * as React from "react";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import { paperClasses } from "@mui/material/Paper";
import { listClasses } from "@mui/material/List";
import Divider, { dividerClasses } from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon, { listItemIconClasses } from "@mui/material/ListItemIcon";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import AddIcon from "@mui/icons-material/Add";
import MenuButton from "./MenuButton";
import {
  handleLogout,
  handleNotifications,
  handleProfile,
  handleSettings,
} from "../../utils/GoogleAuth";

export function ProfileMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Stack
      direction="row"
      sx={{
        p: 2,
        gap: 1,
        alignItems: "center",
      }}
    >
      <IconButton component={Link} to="/publicar">
        <AddIcon />
      </IconButton>
      <Box sx={{ mr: "auto" }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, lineHeight: "16px" }}
        >
          {localStorage.getItem("userName")}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {localStorage.getItem("userEmail")}
        </Typography>
      </Box>
      <MenuButton
        aria-label="Open menu"
        onClick={handleClick}
        sx={{ borderColor: "transparent" }}
      >
        <Avatar
          sizes="small"
          alt={localStorage.getItem("userName")}
          src={localStorage.getItem("userPhoto")}
          sx={{ width: 36, height: 36 }}
        />
      </MenuButton>
      <Menu
        anchorEl={anchorEl}
        id="menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        sx={{
          [`& .${listClasses.root}`]: {
            padding: "4px",
          },
          [`& .${paperClasses.root}`]: {
            padding: 0,
          },
          [`& .${dividerClasses.root}`]: {
            margin: "4px -4px",
          },
        }}
      >
        <Divider />
        <MenuItem onClick={handleProfile}>Perfil</MenuItem>
        <MenuItem onClick={handleNotifications}>Notificaciones</MenuItem>
        <Divider />
        <MenuItem onClick={handleSettings}>Configuración</MenuItem>
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{
            [`& .${listItemIconClasses.root}`]: {
              ml: "auto",
              minWidth: 0,
            },
          }}
        >
          <ListItemText>Cerrar sesión</ListItemText>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </Stack>
  );
}
