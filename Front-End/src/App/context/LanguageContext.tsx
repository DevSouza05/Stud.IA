import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  'pt-BR': {
    translation: {
      'Modo Escuro': 'Modo Escuro',
      'Idioma': 'Idioma',
      'Editar Perfil': 'Editar Perfil',
      'Configurações': 'Configurações',
      'Notificações': 'Notificações',
      'Início': 'Início',
      'Meu Progresso': 'Meu Progresso',
      'Avaliações': 'Avaliações',
      'Sair': 'Sair',
      'Ver notificações': 'Ver notificações',
      'Nenhuma notificação no momento.': 'Nenhuma notificação no momento.',
      'Bem-vindo ao Stud.IA!': 'Bem-vindo ao Stud.IA!',
      'Seu guia inteligente para aprender mais e melhor.': 'Seu guia inteligente para aprender mais e melhor.',
      'Começar': 'Começar',
    }
  },
  'en-US': {
    translation: {
      'Modo Escuro': 'Dark Mode',
      'Idioma': 'Language',
      'Editar Perfil': 'Edit Profile',
      'Configurações': 'Settings',
      'Notificações': 'Notifications',
      'Início': 'Home',
      'Meu Progresso': 'My Progress',
      'Avaliações': 'Assessments',
      'Sair': 'Logout',
      'Ver notificações': 'View notifications',
      'Nenhuma notificação no momento.': 'No notifications at the moment.',
      'Bem-vindo ao Stud.IA!': 'Welcome to Stud.IA!',
      'Seu guia inteligente para aprender mais e melhor.': 'Your smart guide to learn more and better.',
      'Começar': 'Start',
    }
  },
  'es-ES': {
    translation: {
      'Modo Escuro': 'Modo Oscuro',
      'Idioma': 'Idioma',
      'Editar Perfil': 'Editar Perfil',
      'Configurações': 'Configuraciones',
      'Notificações': 'Notificaciones',
      'Início': 'Inicio',
      'Meu Progresso': 'Mi Progreso',
      'Avaliações': 'Evaluaciones',
      'Sair': 'Salir',
      'Ver notificações': 'Ver notificaciones',
      'Nenhuma notificação no momento.': 'No hay notificaciones en este momento.',
      'Bem-vindo ao Stud.IA!': '¡Bienvenido a Stud.IA!',
      'Seu guia inteligente para aprender mais e melhor.': 'Tu guía inteligente para aprender más y mejor.',
      'Começar': 'Comenzar',
    }
  }
};

// Inicialização do i18next
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: localStorage.getItem('appLanguage') || 'pt-BR',
      fallbackLng: 'pt-BR',
      interpolation: { escapeValue: false },
    });
}

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(i18n.language);

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguageState(lang);
    localStorage.setItem('appLanguage', lang);
  };

  useEffect(() => {
    setLanguageState(i18n.language);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}; 