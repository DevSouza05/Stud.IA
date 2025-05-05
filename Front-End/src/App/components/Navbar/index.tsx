// src/components/Navbar/index.tsx
import { Link } from "react-router-dom";
import "../../Pages/styles/Navbar.css";
import React, { useState, useEffect } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'react-i18next';

interface NavbarProps {
  variant?: string;
  onMenuClick?: () => void;
}

export function Navbar({ variant, onMenuClick }: NavbarProps) {
  const { t } = useTranslation();
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Obter userId do localStorage ao carregar o componente
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);

  const toggleMenu = () => {
    setIsMenuActive(!isMenuActive);
  };

  return (
    <nav className={`navbar ${variant === "home" ? "home" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/iconLogoStudia.png" alt="Stud.Ia Logo" />
        </Link>
        <ul className={`navbar-menu ${isMenuActive ? "active" : ""}`}>
          {variant === "home" ? (
            <>
              <li>
                <Link to="/home" className="navbar-link">
                  {t('Home')}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="navbar-link">
                  {t('Progresso')}
                </Link>
              </li>
              <li>
                <Link
                  to={userId ? `/trilha/${userId}` : "/login"}
                  className="navbar-link"
                >
                  {t('Trilha')}
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/" className="navbar-link">
                  {t('Home')}
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="navbar-link">
                  {t('Sobre')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="navbar-button">
                  {t('Entrar')}
                </Link>
              </li>
              <li>
                <Link to="/cadastro" className="navbar-signup">
                  {t('Criar conta')}
                </Link>
              </li>
            </>
          )}
        </ul>
        {variant === "home" && (
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ ml: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
      </div>
    </nav>
  );
}

export default Navbar;