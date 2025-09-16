import React from "react";
import { Outlet } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import AppTheme from "../shared-theme/AppTheme";
import AppAppBar from "./components/AppAppBar";
import Footer from "./components/Footer";

const MainLayout = (props) => {
  return (
    <>
      <AppTheme {...props}>
        <CssBaseline enableColorScheme />
        <AppAppBar />
        <Container
          maxWidth="lg"
          component="main"
          sx={{ display: "flex", flexDirection: "column", my: 16, gap: 4 }}
        >
          <Outlet />
        </Container>
        <Footer />
      </AppTheme>
    </>
  );
};

export default MainLayout;
