import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter,Routes,Route} from "react-router-dom";
import {App} from './App/Pages/login/login.jsx'
import {Cadastro} from "./App/Pages/Cadastro/cadastro.jsx"
import { SwiperPage } from "./App/Pages/Cards/SwiperPage.jsx";
import {TelaInicial} from "./App/Pages/home/home.jsx"
import Dashboard from "./App/Pages/Dashboard/dashboard.jsx";
import {Introducao} from "./App/Pages/Introdução/introducao.jsx"
import {Sobre} from "./App/Pages/Sobre/sobre.jsx"
import ProtectedRoute from './App/components/ProtectedRoute'
import { AppProvider } from './App/context/AppContext'
import './App/styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Introducao />} />
          <Route path="/Cadastro" element={<Cadastro />} />
          <Route path='/login' element={<App/>} />
          <Route path='/sobre' element={<Sobre/>} />
          
          {/* Rotas Protegidas */}
          <Route path='/home' element={
            <ProtectedRoute>
              <TelaInicial />
            </ProtectedRoute>
          } />
          <Route path='/SwiperPage' element={
            <ProtectedRoute>
              <SwiperPage/>
            </ProtectedRoute>
          } />
          <Route path='/dashboard' element={
            <ProtectedRoute>
              <Dashboard/>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>
);
