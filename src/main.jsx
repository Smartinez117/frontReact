import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import { BrowserRouter } from 'react-router-dom';
import RouterApp from './router/RouterApp';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 


ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <RouterApp />
  </BrowserRouter>
);
