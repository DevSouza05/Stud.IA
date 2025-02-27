import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import "../styles/index.css";


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

  return (
    <div>
      <h1>Tela Inicial</h1>
      {dados && (
        <div id='dados-recebidos'>
          <h2 >Dados recebidos:</h2>
          <pre id="pre">{JSON.stringify(dados, null, 2)}</pre>
        </div>
      )}
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : roadmap ? (
        <div id="algumacoisa">
          <h2>Roadmap</h2>
          <pre>{JSON.stringify(roadmap, null, 2)}</pre>
        </div>
      ) : (
        <p>Carregando roadmap...</p>
      )}
    </div>
  );
};
