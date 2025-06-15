import { Link } from "react-router-dom";
import "../../Pages/styles/navbar.css";
import React, { useState, useEffect } from "react";
import { GiHamburgerMenu } from "react-icons/gi"; 
import DrawerMenu from "../Drawer/drawer";

interface NavbarProps {
  variant?: string;
}

export function Navbar({ variant }: NavbarProps) {
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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

        
        <div className="navbar-home-hamburger" onClick={toggleMenu}>
          <GiHamburgerMenu size={30} color="white" />
        </div>

        {/* Menu */}
        <ul className={`navbar-menu ${isMenuActive ? "active" : ""}`}>
          {variant === "home" ? (
            <>
              <li>
                <Link to="/home" className="navbar-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="navbar-link">
                  Progresso
                </Link>
              </li>
              <li>
                <Link
                  to={userId ? `/trilha/${userId}` : "/login"}
                  className="navbar-link"
                >
                  Trilha
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/" className="navbar-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="navbar-link">
                  Sobre
                </Link>
              </li>
              <li>
                <Link to="/login" className="navbar-button">
                  Entrar
                </Link>
              </li>
              <li>
                <Link to="/cadastro" className="navbar-signup">
                  Criar conta
                </Link>
              </li>
            </>
          )}
        </ul>

        {variant === "home" && <DrawerMenu />}
      </div>
    </nav>
  );
}

export default Navbar;
