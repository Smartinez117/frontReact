// src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main style={{ padding: '1rem' }}>
        <Outlet /> {/* Aquí se renderizan las vistas */}
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
