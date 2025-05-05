// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App } from "./App/Pages/login/login.jsx";
import { Cadastro } from "./App/Pages/Cadastro/cadastro.jsx";
import { SwiperPage } from "./App/Pages/Cards/SwiperPage.jsx";
import { TelaInicial } from "./App/Pages/home/home.jsx";
import ChatBot from "./App/components/ChatBot/ChatBot.jsx";
import Dashboard from "./App/Pages/Dashboard/dashboard.jsx";
import { Introducao } from "./App/Pages/Introdução/introducao.jsx";
import { Sobre } from "./App/Pages/Sobre/sobre.jsx";
import ProtectedRoute from "./App/components/ProtectedRoute.jsx";
import { AppProvider } from "./App/context/AppContext.jsx";
import { NotificationProvider } from "./App/context/NotificationContext.jsx";
import MainLayout from "./App/components/Layout/MainLayout.jsx";
import TrilhaPage from "./App/Pages/Trilha/trilha.jsx";
import "./App/styles/global.css";
import { CustomThemeProvider } from "./App/context/ThemeContext.tsx";
import { LanguageProvider } from "./App/context/LanguageContext.tsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CustomThemeProvider>
      <LanguageProvider>
        <AppProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Introducao />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/login" element={<App />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <TelaInicial />
                        <ChatBot />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/swiperPage"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <SwiperPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trilha/:id"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <TrilhaPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </AppProvider>
      </LanguageProvider>
    </CustomThemeProvider>
  </React.StrictMode>
);