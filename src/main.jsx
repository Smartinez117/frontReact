import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import { BrowserRouter } from 'react-router-dom';
import RouterApp from './router/RouterApp';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <RouterApp />
  </BrowserRouter>
);
