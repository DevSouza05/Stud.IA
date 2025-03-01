import React, { useEffect, useState } from "react";
import { data, useLocation } from "react-router-dom";

import "../styles/home.css";

export const TelaInicial = () => {
  const location = useLocation();
  const [userId, setUserId] = useState(location.state?.userId || localStorage.getItem("userId"));
  const [roadmap, setRoadmap] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setError("ID do usuário não encontrado.");
      setLoading(false);
      return;
    }

    const fetchUserID = async (userId) => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/auth/${userId}`);
        if (!response.ok) {
          throw new Error(`Erro: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        console.log("TESTETESTE: ", data)
        setUser(data.user.username);
      }
      catch (error) {
        setError(`Erro ao buscar o ID do usuário: ${error.message}`);
        console.error(error);
  
    }
  };
  fetchUserID(userId);


    const fetchRoadmap = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/roadmap/${userId}`);
        if (!response.ok) {
          throw new Error(`Erro: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Resposta da API:", data);

       
        const cleanedRoadmap = data.roadmap
          .replace("```json", "") 
          .replace("```", "")     
          .trim();               

        const parsedRoadmap = JSON.parse(cleanedRoadmap);
        setRoadmap(parsedRoadmap);
      } catch (error) {
        setError(`Erro ao processar o roadmap: ${error.message}`);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [userId]);

  return (
    <div className="home-container">
      <div className="main-content">
      
        <h1>Bem-vindo! </h1>
        <br></br>
        <h2>Olá, {user}! Seja bem-vindo ao Seu Guia de Aprendizado </h2>

        <div className="card">
          <h2>Visão Geral do Roadmap</h2>

          {error && <p className="error-message">{error}</p>}
          {loading && <p className="loading-message">Carregando roadmap...</p>}

          {roadmap && (
            <div className="roadmap-container">
              {roadmap.map((item, index) => (
                <div key={index} className="roadmap-item">
                  <h3>{item.ordem}. {item.titulo}</h3>

                  <div className="section">
                    <h4>Cronograma</h4>
                    <ul>
                      {item.cronograma.map((schedule, idx) => (
                        <li key={idx}>
                          {schedule.dia} - {schedule.horarioInicio} às {schedule.horarioFim} ({schedule.cargaHoraria}h)
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="section">
                    <h4>Métodos de Estudo</h4>
                    <p>{item.metodosEstudo.join(", ")}</p>
                  </div>

                  <div className="section">
                    <h4>Locais de Estudo</h4>
                    <p>{item.locaisEstudo.join(", ")}</p>
                  </div>

                  <div className="section">
                    <h4>Materiais de Apoio</h4>
                    <ul>
                      {item.materiaisApoio.map((material, idx) => (
                        <li key={idx}>
                          {material.tipo}: {material.nome}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="section">
                    <h4>Dificuldades</h4>
                    {item.dificuldades.map((difficulty, idx) => (
                      <div key={idx} className="difficulty-item">
                        <p><strong>Descrição:</strong> {difficulty.descricao}</p>
                        <p><strong>Estratégia:</strong> {difficulty.estrategia}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};