// src/layouts/MainLayout.jsx
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const MainLayout = () => {
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName);
        setUserPhoto(user.photoURL);
        localStorage.setItem("userName", user.displayName);
        localStorage.setItem("userPhoto", user.photoURL);
      } else {
        setUserName('');
        setUserPhoto('');
        localStorage.removeItem("userName");
        localStorage.removeItem("userPhoto");
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
      <Footer />
    </>
  );
};

export default MainLayout;
