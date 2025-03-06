import React from 'react';
import '../styles/introducao.css';
import { Navbar } from "../../components/Navbar/index.tsx";
import { useNavigate } from 'react-router-dom'; 

export function Introducao() {
  const navigate = useNavigate(); 

  function handleComecarClick() {
    navigate('/cadastro'); 
  }
  
  return (
    <div className="intro-container">
      <div className="intro-content">
        <Navbar />
        <h1>Bem-vindo ao Stud.IA!</h1>
        <h2>Transforme seus estudos com inteligência.</h2>
        <h3>Chega de perder tempo tentando descobrir por onde começar! O Stud.IA cria um plano de estudo totalmente personalizado para você, baseado nas suas necessidades e nas áreas que realmente importam.</h3>
        <h2>Defina suas preferências, receba um cronograma feito sob medida para você e acelere sua evolução.</h2>
        <button className="intro-button" onClick={handleComecarClick}>Começar</button> {/* Adicionando o onClick */}
      </div>
      <div className="intro-image">
      </div>
    </div>
  );
}
