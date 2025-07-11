import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import { BrowserRouter } from 'react-router-dom';
import RouterApp from './router/RouterApp';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { getAuth } from "firebase/auth"; 


ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <RouterApp />
  </BrowserRouter>
);

window.getToken = async () => {
  const user = getAuth().currentUser;
  if (user) {
    const token = await user.getIdToken();
    console.log("TOKEN:", token);
  } else {
    console.log("No hay usuario logueado");
  }
};