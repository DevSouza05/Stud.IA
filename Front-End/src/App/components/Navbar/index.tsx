import { Link } from "react-router-dom";
import "../../Pages/styles/Navbar.css";

import React from "react";


export function Navbar() {
  return (
    <main>
    <nav className="navbar">
           
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="./iconLogoStudia.png" alt="Stud.Ia Logo" />
        </Link>
        <ul className="navbar-menu">

          <li><Link to="/home" className="navbar-link">Home</Link></li>
          <li><Link to="/about" className="navbar-link">Sobre</Link></li>
          <li><Link to="/contact" className="navbar-link">Contato</Link></li>
          <li><Link to="/login" className="navbar-button">Entrar</Link></li>
        </ul>
      </div>
    </nav>
    </main>
  );
}
