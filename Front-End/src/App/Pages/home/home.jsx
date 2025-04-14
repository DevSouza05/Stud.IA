import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../../components/Navbar/index.tsx";
import "../styles/home.css";
import {
  Button,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import {
  NavigateNext,
  NavigateBefore,
  Star,
  StarBorder,
  Notifications,
  NotificationsOff,
  Save,
  Refresh,
} from "@mui/icons-material";
import axios from "axios"; // Adicionando axios para melhor gerenciamento de requisições

export const TelaInicial = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(
    location.state?.userId || localStorage.getItem("userId") || ""
  );
  const [roadmap, setRoadmap] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingRoadmap, setLoadingRoadmap] = useState(true);
  const [completedSubmodules, setCompletedSubmodules] = useState({});
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [retryCount, setRetryCount] = useState(0);

  const calculateProgress = useMemo(() => {
    if (!roadmap) return 0;
    const totalSubmodules = roadmap.reduce(
      (acc, item) => acc + (item.submodulos?.length || 0),
      0
    );
    const completedCount = Object.values(completedSubmodules).filter(Boolean).length;
    return totalSubmodules > 0 ? (completedCount / totalSubmodules) * 100 : 0;
  }, [roadmap, completedSubmodules]);

  const calculateSectionProgress = useMemo(() => {
    return (section) => {
      if (!section || !section.submodulos) return 0;
      const total = section.submodulos.length;
      const completed = section.submodulos.filter(
        (_, index) => completedSubmodules[`${currentItemIndex}-${index}`]
      ).length;
      return total > 0 ? (completed / total) * 100 : 0;
    };
  }, [completedSubmodules, currentItemIndex]);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
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

  useEffect(() => {
    const lastViewedIndex = localStorage.getItem(`lastViewedTopicIndex_${userId}`);
    if (lastViewedIndex !== null) {
      setCurrentItemIndex(parseInt(lastViewedIndex, 10));
    }
  }, [userId]);

  useEffect(() => {
    if (roadmap && roadmap.length > 0) {
      localStorage.setItem(`lastViewedTopicIndex_${userId}`, currentItemIndex.toString());
    }
  }, [currentItemIndex, userId, roadmap]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites");
    const savedNotifications = localStorage.getItem("notifications");

    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  const fetchData = async () => {
    setLoadingUser(true);
    setLoadingRoadmap(true);
    setError(null);

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      setError("ID de usuário inválido. Redirecionando para o login...");
      setLoadingUser(false);
      setLoadingRoadmap(false);
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    try {
      const userResponse = await axios.get(`http://localhost:8080/api/v1/auth/${parsedUserId}`, {
        timeout: 10000, 
      });
      setUser(userResponse.data.user.username);
    } catch (error) {
      setError(`Não foi possível carregar os dados do usuário: ${error.message}`);
      console.error("Erro ao buscar usuário:", error);
    } finally {
      setLoadingUser(false);
    }

    try {
      const roadmapResponse = await axios.get(`http://localhost:8080/api/v1/roadmap/${parsedUserId}`, {
        timeout: 30000,
      });
      setRoadmap(roadmapResponse.data); 
      setRetryCount(0); 
    } catch (error) {
      setError(
        `Não foi possível carregar o roadmap: ${error.response?.data?.message || error.message}. Clique em "Tentar Novamente" ou retorne ao login.`
      );
      console.error("Erro ao buscar roadmap:", error);
    } finally {
      setLoadingRoadmap(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError("ID do usuário não encontrado. Redirecionando para o login...");
      setLoadingUser(false);
      setLoadingRoadmap(false);
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    fetchData();
  }, [userId, navigate]);

  const handleSubmoduleToggle = (itemIndex, subIndex) => {
    const key = `${itemIndex}-${subIndex}`;
    setCompletedSubmodules((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const goToPreviousTopic = () => {
    if (currentItemIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentItemIndex(currentItemIndex - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const goToNextTopic = () => {
    if (roadmap && currentItemIndex < roadmap.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentItemIndex(currentItemIndex + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const toggleFavorite = (itemId) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      showNotificationMessage(
        newFavorites.includes(itemId)
          ? "Tópico adicionado aos favoritos!"
          : "Tópico removido dos favoritos!",
        "success"
      );
      return newFavorites;
    });
  };

  const toggleNotification = (itemId) => {
    setNotifications((prev) => {
      const newNotifications = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];
      localStorage.setItem("notifications", JSON.stringify(newNotifications));
      showNotificationMessage(
        newNotifications.includes(itemId)
          ? "Notificações ativadas para este tópico!"
          : "Notificações desativadas para este tópico!",
        "success"
      );
      return newNotifications;
    });
  };

  const saveProgress = () => {
    const progress = {};
    roadmap.forEach((item) => {
      progress[item.ordem] = calculateProgress; // Usando ordem como chave
    });
    localStorage.setItem("studyProgress", JSON.stringify(progress));
    showNotificationMessage("Progresso salvo com sucesso!", "success");
  };

  const showNotificationMessage = (message, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  const handleRetry = () => {
    if (retryCount >= 3) {
      setError("Limite de tentativas atingido. Redirecionando para o login...");
      setTimeout(() => navigate("/login"), 3000);
      return;
    }
    setRetryCount((prev) => prev + 1);
    fetchData();
  };

  if (loadingUser || loadingRoadmap) {
    return (
      <div className="home-container">
        <Navbar variant="home" />
        <div className="loading-container">
          <div className="loading-circle" />
          <p>
            Carregando seu guia de aprendizado...
            <span className="user-name">{user || "Usuário"}</span>...
          </p>
        </div>
      </div>
    );
  }

  const currentRoadmapItem = roadmap && roadmap.length > 0 ? roadmap[currentItemIndex] : null;

  return (
    <>
      <Navbar variant="home" />
      <div className="home-container">
        <div className="main-content">
          <h1>Bem-vindo!</h1>
          <h2>Olá, {user || "Usuário"}! Seja bem-vindo ao Seu Guia de Aprendizado</h2>

          {error && (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <div className="error-actions">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Refresh />}
                  onClick={handleRetry}
                  disabled={retryCount >= 3}
                >
                  Tentar Novamente
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate("/login")}
                >
                  Voltar ao Login
                </Button>
              </div>
            </div>
          )}

          {!error && (
            <div className="card">
              <h2>Visão Geral do Roadmap</h2>

              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${calculateProgress}%` }}>
                  <span className="progress-text">{Math.round(calculateProgress)}%</span>
                </div>
              </div>

              {roadmap && roadmap.length > 0 ? (
                <div className="roadmap-section">
                  <div className="pagination-controls">
                    <button
                      className="pagination-button"
                      onClick={goToPreviousTopic}
                      disabled={currentItemIndex === 0}
                    >
                      <NavigateBefore /> Anterior
                    </button>
                    <div className="module-counter">
                      {currentItemIndex + 1} / {roadmap.length}
                    </div>
                    <button
                      className="pagination-button"
                      onClick={goToNextTopic}
                      disabled={currentItemIndex === roadmap.length - 1}
                    >
                      Próximo <NavigateNext />
                    </button>
                  </div>

                  <div className={`roadmap-content ${isTransitioning ? "transitioning" : ""}`}>
                    {currentRoadmapItem && (
                      <div className="roadmap-item">
                        <div className="roadmap-header">
                          <h3>
                            {currentRoadmapItem.ordem}. {currentRoadmapItem.titulo}
                          </h3>
                          <div className="roadmap-actions">
                            <IconButton
                              onClick={() => toggleFavorite(currentRoadmapItem.ordem)}
                              color={favorites.includes(currentRoadmapItem.ordem) ? "primary" : "default"}
                              aria-label={favorites.includes(currentRoadmapItem.ordem) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                            >
                              {favorites.includes(currentRoadmapItem.ordem) ? <Star /> : <StarBorder />}
                            </IconButton>
                            <IconButton
                              onClick={() => toggleNotification(currentRoadmapItem.ordem)}
                              color={notifications.includes(currentRoadmapItem.ordem) ? "primary" : "default"}
                              aria-label={notifications.includes(currentRoadmapItem.ordem) ? "Desativar notificações" : "Ativar notificações"}
                            >
                              {notifications.includes(currentRoadmapItem.ordem) ? (
                                <Notifications />
                              ) : (
                                <NotificationsOff />
                              )}
                            </IconButton>
                            <IconButton onClick={saveProgress} color="primary" aria-label="Salvar progresso">
                              <Save />
                            </IconButton>
                          </div>
                        </div>

                        <div className="content-grid">
                          <div className="main-column">
                            {currentRoadmapItem.nivelDificuldade && (
                              <div className="section">
                                <h4>Nível de Dificuldade</h4>
                                <p>{currentRoadmapItem.nivelDificuldade}</p>
                              </div>
                            )}

                            {currentRoadmapItem.tempoEstimadoTotal && (
                              <div className="section">
                                <h4>Tempo Estimado Total</h4>
                                <p>{currentRoadmapItem.tempoEstimadoTotal} horas</p>
                              </div>
                            )}

                            {currentRoadmapItem.submodulos?.length > 0 && (
                              <div className="section">
                                <h4>Submódulos</h4>
                                <div className="section-progress">
                                  <div className="section-progress-bar">
                                    <div
                                      className="section-progress-fill"
                                      style={{
                                        width: `${calculateSectionProgress(currentRoadmapItem)}%`,
                                      }}
                                    />
                                  </div>
                                  <span>{Math.round(calculateSectionProgress(currentRoadmapItem))}%</span>
                                </div>
                                <ul className="submodules-list">
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
                                          <span className={completedSubmodules[key] ? "completed" : ""}>
                                            {sub}
                                          </span>
                                        </label>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}

                            {currentRoadmapItem.cronograma?.length > 0 && (
                              <div className="section">
                                <h4>Cronograma</h4>
                                <ul>
                                  {currentRoadmapItem.cronograma.map((sessao, idx) => (
                                    <li key={idx}>
                                      Dia: {sessao.dia}, {sessao.horarioInicio} - {sessao.horarioFim} ({sessao.cargaHoraria}h)
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          <div className="side-column">
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

                            {currentRoadmapItem.materiaisApoio?.length > 0 && (
                              <div className="section">
                                <h4>Materiais de Apoio</h4>
                                <ul>
                                  {currentRoadmapItem.materiaisApoio.map((material, idx) => (
                                    <li key={idx}>
                                      {material.tipo}: {material.nome}
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
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-roadmap">
                  <p>Nenhum roadmap disponível.</p>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate("/create-roadmap", { state: { userId } })}
                  >
                    Criar Novo Roadmap
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Snackbar
        open={showNotification}
        autoHideDuration={3000}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowNotification(false)}
          severity={notificationType}
          sx={{ width: "100%" }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TelaInicial;