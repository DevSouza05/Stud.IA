import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "../../components/Navbar/index.tsx";
import "../styles/home.css";

export const TelaInicial = () => {
  const location = useLocation();
  const [userId, setUserId] = useState(
    location.state?.userId || localStorage.getItem("userId") || ""
  );
  const [roadmap, setRoadmap] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedSubmodules, setCompletedSubmodules] = useState({});
  
  // Estado para controlar a paginação
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const calculateProgress = () => {
    if (!roadmap) return 0;
    const totalSubmodules = roadmap.reduce(
      (acc, item) => acc + (item.submodulos?.length || 0),
      0
    );
    const completedCount = Object.values(completedSubmodules).filter(Boolean).length;
    return totalSubmodules > 0 ? (completedCount / totalSubmodules) * 100 : 0;
  };

  useEffect(() => {
    const savedCompleted = localStorage.getItem(`completedSubmodules_${userId}`);
    if (savedCompleted) {
      setCompletedSubmodules(JSON.parse(savedCompleted));
    }
  }, [userId]);

  useEffect(() => {
    if (Object.keys(completedSubmodules).length > 0) {
      localStorage.setItem(
        `completedSubmodules_${userId}`,
        JSON.stringify(completedSubmodules)
      );
    }
  }, [completedSubmodules, userId]);

  // Efeito para restaurar o último tópico visualizado
  useEffect(() => {
    const lastViewedIndex = localStorage.getItem(`lastViewedTopicIndex_${userId}`);
    if (lastViewedIndex !== null) {
      setCurrentItemIndex(parseInt(lastViewedIndex, 10));
    }
  }, [userId]);

  // Salvar o último tópico visualizado
  useEffect(() => {
    if (roadmap && roadmap.length > 0) {
      localStorage.setItem(`lastViewedTopicIndex_${userId}`, currentItemIndex.toString());
    }
  }, [currentItemIndex, userId, roadmap]);

  useEffect(() => {
    if (!userId) {
      setError("ID do usuário não encontrado.");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/auth/${userId}`);
        if (!response.ok) {
          throw new Error(`Erro: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        setUser(data.user.username);
      } catch (error) {
        setError(`Erro ao buscar usuário: ${error.message}`);
        console.error("Erro ao buscar usuário:", error);
      }
    };

    const fetchRoadmapData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/roadmap/${userId}`);
        if (!response.ok) {
          throw new Error(`Erro: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        const cleanedRoadmap = data.roadmap
          .replace(/```json|```/g, "")
          .trim();
        setRoadmap(JSON.parse(cleanedRoadmap));
      } catch (error) {
        setError(`Erro ao processar roadmap: ${error.message}`);
        console.error("Erro ao processar roadmap:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchRoadmapData();
  }, [userId]);

  const handleSubmoduleToggle = (itemIndex, subIndex) => {
    const key = `${itemIndex}-${subIndex}`;
    setCompletedSubmodules((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Funções para navegar entre tópicos
  const goToPreviousTopic = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
      // Scroll para o topo do card para melhor experiência de usuário
      document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToNextTopic = () => {
    if (roadmap && currentItemIndex < roadmap.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      // Scroll para o topo do card para melhor experiência de usuário
      document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <Navbar variant="home" />
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Verifica se temos um roadmap válido
  const currentRoadmapItem = roadmap && roadmap.length > 0 
    ? roadmap[currentItemIndex] 
    : null;

  return (
    <div className="home-container">
      <div className="main-content">
        <Navbar variant="home" />
        <h1>Bem-vindo!</h1>
        <br />
        <h2>Olá, {user || "Usuário"}! Seja bem-vindo ao Seu Guia de Aprendizado</h2>

        <div className="card">
          <h2>Visão Geral do Roadmap</h2>

          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${calculateProgress()}%` }}>
              <span className="progress-text">{Math.round(calculateProgress())}%</span>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          {/* Controles de paginação */}
          {roadmap && roadmap.length > 0 && (
            <div className="pagination-controls">
              <button 
                className="pagination-button" 
                onClick={goToPreviousTopic} 
                disabled={currentItemIndex === 0}
                aria-label="Tópico anterior"
              >
                &#8592;
              </button>
              
              <div className="module-counter">
                {currentItemIndex + 1} / {roadmap.length}
              </div>
              
              <button 
                className="pagination-button" 
                onClick={goToNextTopic} 
                disabled={currentItemIndex === roadmap.length - 1}
                aria-label="Próximo tópico"
              >
                &#8594;
              </button>
            </div>
          )}

          {/* Conteúdo do roadmap (agora mostrando apenas um item por vez) */}
          <div className="roadmap-container">
            {currentRoadmapItem ? (
              <div className="roadmap-item">
                <h3>
                  {currentRoadmapItem.ordem}. {currentRoadmapItem.titulo}
                </h3>

                {/* Nível de Dificuldade */}
                {currentRoadmapItem.nivelDificuldade && (
                  <div className="section">
                    <h4>Nível de Dificuldade</h4>
                    <p>{currentRoadmapItem.nivelDificuldade}</p>
                  </div>
                )}

                {/* Tempo Estimado Total */}
                {currentRoadmapItem.tempoEstimadoTotal && (
                  <div className="section">
                    <h4>Tempo Estimado Total</h4>
                    <p>{currentRoadmapItem.tempoEstimadoTotal} horas</p>
                  </div>
                )}

                {/* Cronograma */}
                {currentRoadmapItem.cronograma?.length > 0 && (
                  <div className="section">
                    <h4>Cronograma</h4>
                    <ul>
                      {currentRoadmapItem.cronograma.map((schedule, idx) => (
                        <li key={idx}>
                          <strong>{schedule.dia}</strong>: {schedule.horarioInicio} às{" "}
                          {schedule.horarioFim} ({schedule.cargaHoraria}h)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Métodos de Estudo */}
                {currentRoadmapItem.metodosEstudo?.length > 0 && (
                  <div className="section">
                    <h4>Métodos de Estudo</h4>
                    <ul>
                      {currentRoadmapItem.metodosEstudo.map((metodo, idx) => (
                        <li key={idx}>{metodo}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Locais de Estudo */}
                {currentRoadmapItem.locaisEstudo?.length > 0 && (
                  <div className="section">
                    <h4>Locais de Estudo</h4>
                    <p>{currentRoadmapItem.locaisEstudo.join(", ")}</p>
                  </div>
                )}

                {/* Submódulos */}
                {currentRoadmapItem.submodulos?.length > 0 && (
                  <div className="section">
                    <h4>Submódulos</h4>
                    <ul>
                      {currentRoadmapItem.submodulos.map((sub, subIndex) => {
                        const key = `${currentItemIndex}-${subIndex}`;
                        return (
                          <li key={subIndex} className="submodule-item">
                            <label>
                              <input
                                type="checkbox"
                                checked={!!completedSubmodules[key]}
                                onChange={() => handleSubmoduleToggle(currentItemIndex, subIndex)}
                              />
                              <span
                                className={completedSubmodules[key] ? "completed" : ""}
                              >
                                {sub}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Materiais de Apoio */}
                {currentRoadmapItem.materiaisApoio?.length > 0 && (
                  <div className="section">
                    <h4>Materiais de Apoio</h4>
                    <ul>
                      {currentRoadmapItem.materiaisApoio.map((material, idx) => (
                        <li key={idx}>
                          {material.tipo}: {material.nome}{" "}
                          {material.link && (
                            <a
                              href={material.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="material-link"
                            >
                              [Acessar]
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dificuldades */}
                {currentRoadmapItem.dificuldades?.length > 0 && (
                  <div className="section">
                    <h4>Dificuldades</h4>
                    <ul>
                      {currentRoadmapItem.dificuldades.map((dificuldade, idx) => (
                        <li key={idx} className="difficulty-item">
                          <strong>{dificuldade.descricao}</strong>: {dificuldade.estrategia}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Próximos Passos */}
                {currentRoadmapItem.proximosPassos?.length > 0 && (
                  <div className="section">
                    <h4>Próximos Passos</h4>
                    <ul>
                      {currentRoadmapItem.proximosPassos.map((passo, idx) => (
                        <li key={idx}>{passo}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dicas Adicionais */}
                {currentRoadmapItem.dicasAdicionais?.length > 0 && (
                  <div className="section">
                    <h4>Dicas Adicionais</h4>
                    <ul>
                      {currentRoadmapItem.dicasAdicionais.map((dica, idx) => (
                        <li key={idx}>{dica}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Metas */}
                {currentRoadmapItem.metas?.length > 0 && (
                  <div className="section">
                    <h4>Metas</h4>
                    <ul>
                      {currentRoadmapItem.metas.map((meta, idx) => (
                        <li key={idx}>
                          {meta.descricao} - Recompensa: {meta.recompensa}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Notificações */}
                {currentRoadmapItem.notificacoes?.length > 0 && (
                  <div className="section">
                    <h4>Notificações</h4>
                    <ul>
                      {currentRoadmapItem.notificacoes.map((notificacao, idx) => (
                        <li key={idx}>{notificacao}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Revisões Planejadas */}
                {currentRoadmapItem.revisoesPlanejadas?.length > 0 && (
                  <div className="section">
                    <h4>Revisões Planejadas</h4>
                    <ul>
                      {currentRoadmapItem.revisoesPlanejadas.map((revisao, idx) => (
                        <li key={idx}>
                          {revisao.dia} - {revisao.duracao}h
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-message">
                Nenhum tópico de aprendizado disponível. Entre em contato com o administrador.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};