import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { GoogleIcon } from "./CustomIcons";
import  { handleLogin } from '../utils/GoogleAuth';

export default function LoginButton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Button
        fullWidth
        variant="outlined"
        onClick={handleLogin}
        startIcon={<GoogleIcon />}
      >
        Iniciar sesión con Google
      </Button>
    </Box>
  );
}