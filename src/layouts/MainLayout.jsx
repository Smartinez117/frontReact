// src/layouts/MainLayout.jsx
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const BASE_URL = import.meta.env.VITE_API_URL;

const MainLayout = () => {
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserName(user.displayName);
        setUserPhoto(user.photoURL);
        localStorage.setItem("userName", user.displayName);
        localStorage.setItem("userPhoto", user.photoURL);
        localStorage.setItem("userSlug", user.slug);

        try {
          // 🔹 Llamamos al backend para traer el usuario con su id interno
          const token = await user.getIdToken();
          const res = await fetch(`${BASE_URL}/api/userconfig`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();

          // Guardamos el id real de la DB
          localStorage.setItem("userId", data.id);
          localStorage.setItem("userSlug", data.slug);
        } catch (err) {
          console.error("Error obteniendo usuario:", err);
        }
      } else {
        setUserName('');
        setUserPhoto('');
        localStorage.removeItem("userName");
        localStorage.removeItem("userPhoto");
        localStorage.removeItem("userId"); 
      }
    });

    return () => unsubscribe();
  }, []);


  return (
    <>
      <Navbar userName={userName} userPhoto={userPhoto} />
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </>
  );
};

export default MainLayout;
