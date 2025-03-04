import { Link } from "react-router-dom";
import "../../Pages/styles/Navbar.css";
import React from "react";

export function Navbar({ variant }) {
  return (
    <nav className={`navbar ${variant === "home" ? "home" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="./iconLogoStudia.png" alt="Stud.Ia Logo" />
        </Link>
        <ul className="navbar-menu">
          {/* Condicional para conteúdo diferente na tela home */}
          {variant === "home" ? (
            <>
              <li><Link to="/home" className="navbar-link">Home</Link></li>
              <li><Link to="/about" className="navbar-link">Progresso</Link></li>
              <li><Link to="/Dashboard" className="navbar-link">Roadmap</Link></li>
              <li><Link to="/profile" className="navbar-button">Perfil</Link></li>
            </>
          ) : (
            <>
              {/* Conteúdo para outras páginas, como login ou cadastro */}
              <li><Link to="/" className="navbar-link">Home</Link></li>
              <li><Link to="/sobre" className="navbar-link">Sobre</Link></li>
              <li><Link to="/login" className="navbar-button">Entrar</Link></li>
              <li><Link to="/cadastro" className="navbar-button">Cadastrar</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
