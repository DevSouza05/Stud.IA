import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import RoadmapProgress from '../../components/RoadmapProgress/RoadmapProgress';
import "../styles/index.css";
import Navbar from '../../components/Navbar/index';

export const TelaInicial = () => {
  const location = useLocation();
  const dados = location.state?.dados;
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('ID do usuário não encontrado no localStorage');
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/v1/roadmap/${userId}`);
        if (!response.ok) {
          throw new Error(`Erro: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        setRoadmap(data.roadmap);
      } catch (err) {
        setError(err.message || 'Erro ao buscar o roadmap');
      }
    };

    fetchRoadmap();
  }, []);

  // Organizar os dados do roadmap 
  const organizeRoadmapData = (data) => {
    if (!data) return { etapas: [], conquistas: [], recomendacoes: [] };

    return {
      etapas: data.etapas || [],
      conquistas: data.conquistas || [],
      recomendacoes: data.recomendacoes || [],
    };
  };

  const organizedRoadmap = organizeRoadmapData(roadmap);

  return (
    <div>
      <div className="home-container">
        <div className="main-content">
          <Navbar />
          <h1>Bem-vindo!</h1>

          {/*Roadmap */}
          <div className="card">
            <h2>Visão Geral do Roadmap</h2>
            {organizedRoadmap.etapas.map((etapa) => (
              <div key={etapa.id} className="roadmap-etapa">
                <h3>{etapa.nome}</h3>
                <RoadmapProgress progress={etapa.progresso} />
              </div>
            ))}
          </div>

          {/*Conquistas */}
          {organizedRoadmap.conquistas.length > 0 && (
            <div className="card">
              <h2>Conquistas</h2>
              <ul className="conquista-list">
                {organizedRoadmap.conquistas.map((conquista) => (
                  <li key={conquista.id}>{conquista.nome}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recomendações */}
          {organizedRoadmap.recomendacoes.length > 0 && (
            <div className="card">
              <h2>Recomendações</h2>
              <ul className="recommendation-list">
                {organizedRoadmap.recomendacoes.map((recomendacao) => (
                  <li key={recomendacao.id}>{recomendacao.nome}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

   
      {error && <p className="error-message">{error}</p>}
      {!roadmap && !error && <p className="loading-message">Carregando roadmap...</p>}
    </div>
  );
};
