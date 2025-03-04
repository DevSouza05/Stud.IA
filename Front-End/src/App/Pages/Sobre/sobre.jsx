import React from 'react';
import '../styles/sobre.css'; 
import { Navbar } from "../../components/Navbar/index.tsx";


export function Sobre() {
  return (
    <div className="sobre-container">
        <Navbar/>
      <header>
        <h1>Sobre o Stud.IA</h1>
      </header>
      <div className="sobre-content">
        <h2>O que é o Stud.IA?</h2>
        <p>
          O Stud.IA é uma plataforma que visa transformar seus estudos, oferecendo planos de estudo personalizados baseados nas suas necessidades, habilidades e interesses. Com a ajuda de inteligência artificial, o Stud.IA cria cronogramas sob medida para otimizar seu aprendizado, ajudando você a estudar de forma mais eficiente e alcançar seus objetivos mais rápido.
        </p>

        <h2>Como Funciona?</h2>
        <p>
          Ao se cadastrar na plataforma, você preencherá um formulário com suas preferências e informações sobre sua jornada de aprendizado. Com base nesses dados, o Stud.IA gera um plano de estudo completo, incluindo módulos de aprendizado que você pode seguir de acordo com seu ritmo. Além disso, a plataforma permite o acompanhamento do seu progresso.
        </p>

        <h2>Por que escolher o Stud.IA?</h2>
        <p>
          O Stud.IA foi projetado para maximizar seu tempo e esforço, permitindo que você se concentre nas áreas que realmente importam. Não perca tempo tentando descobrir por onde começar. O Stud.IA já fez esse trabalho por você, e tudo o que você precisa fazer é seguir o plano de estudos!
        </p>
      </div>
    </div>
  );
}
