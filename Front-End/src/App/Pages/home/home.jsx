import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import "../styles/home.css";
import {
  Button,
  Snackbar,
  Alert,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Tabs,
  Tab,
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
  ExpandMore as ExpandMoreIcon,
  CheckCircle,
} from "@mui/icons-material";
import axios from "axios";

export const TelaInicial = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(location.state?.userId || localStorage.getItem("userId") || "");
  const [roadmap, setRoadmap] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingRoadmap, setLoadingRoadmap] = useState(true);
  const [completedSubmodules, setCompletedSubmodules] = useState({});
  const [completedModules, setCompletedModules] = useState({});
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [retryCount, setRetryCount] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState(false);
  const [history, setHistory] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  // Função para calcular o progresso geral do roadmap
  const calculateProgress = useMemo(() => {
    if (!roadmap || !Array.isArray(roadmap)) return 0;
    const totalSubmodules = roadmap.reduce(
      (acc, item) => acc + (item.submodulos?.length || 0),
      0
    );
    const completedCount = Object.values(completedSubmodules).filter(Boolean).length;
    return totalSubmodules > 0 ? (completedCount / totalSubmodules) * 100 : 0;
  }, [roadmap, completedSubmodules]);

  // Função para calcular o progresso de uma seção/módulo específico
  const calculateSectionProgress = useMemo(() => {
    return (section, sectionIndex) => {
      if (!section || !section.submodulos || !Array.isArray(section.submodulos)) return 0;
      const total = section.submodulos.length;
      const completed = section.submodulos.filter(
        (_, index) => completedSubmodules[`${sectionIndex}-${index}`]
      ).length;
      return total > 0 ? (completed / total) * 100 : 0;
    };
  }, [completedSubmodules]);

  // Função para verificar se todos os submódulos de um módulo específico estão concluídos
  const areAllSubmodulesCompletedForModule = (moduleIndex) => {
    if (!roadmap || !Array.isArray(roadmap) || !roadmap[moduleIndex]) return false;
    const module = roadmap[moduleIndex];
    if (!module.submodulos || module.submodulos.length === 0) return true; // Módulo sem submódulos é considerado concluído
    return module.submodulos.every((_, subIndex) => completedSubmodules[`${moduleIndex}-${subIndex}`]);
  };

  // Função para verificar se todos os submódulos de todos os módulos estão concluídos (para o botão "Concluir Curso")
  const areAllPreviousSubmodulesCompleted = () => {
    if (!roadmap || !Array.isArray(roadmap)) return false;
    return roadmap.every((_, index) => areAllSubmodulesCompletedForModule(index));
  };

  // Função para buscar o histórico de conclusão
  const fetchHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/roadmap/history/${userId}`, {
        timeout: 10000,
      });
      setHistory(response.data || []);
    } catch (error) {
      showNotificationMessage(`Erro ao carregar histórico: ${error.message}`, "error");
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1) fetchHistory();
  };

  // Carrega os dados salvos do localStorage ao iniciar
  useEffect(() => {
    const savedCompletedSubmodules = localStorage.getItem(`completedSubmodules_${userId}`);
    const savedCompletedModules = localStorage.getItem(`completedModules_${userId}`);
    if (savedCompletedSubmodules) {
      setCompletedSubmodules(JSON.parse(savedCompletedSubmodules));
    }
    if (savedCompletedModules) {
      setCompletedModules(JSON.parse(savedCompletedModules));
    }
  }, [userId]);

  // Salva os submódulos e módulos concluídos no localStorage
  useEffect(() => {
    if (Object.keys(completedSubmodules).length > 0) {
      localStorage.setItem(`completedSubmodules_${userId}`, JSON.stringify(completedSubmodules));
    }
    if (Object.keys(completedModules).length > 0) {
      localStorage.setItem(`completedModules_${userId}`, JSON.stringify(completedModules));
    }
  }, [completedSubmodules, completedModules, userId]);

  // Carrega o último índice visualizado
  useEffect(() => {
    const lastViewedIndex = localStorage.getItem(`lastViewedTopicIndex_${userId}`);
    if (lastViewedIndex !== null) {
      setCurrentItemIndex(parseInt(lastViewedIndex, 10));
    }
  }, [userId]);

  // Salva o índice atual no localStorage
  useEffect(() => {
    if (roadmap && Array.isArray(roadmap) && roadmap.length > 0) {
      localStorage.setItem(`lastViewedTopicIndex_${userId}`, currentItemIndex.toString());
    }
  }, [currentItemIndex, userId, roadmap]);

  // Carrega favoritos e notificações do localStorage
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

  // Função para buscar os dados do usuário e do roadmap
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
      setUser(userResponse.data?.user?.username || "Usuário");
    } catch (error) {
      setError(`Não foi possível carregar os dados do usuário: ${error.message}`);
      console.error("Erro ao buscar usuário:", error);
    } finally {
      setLoadingUser(false);
    }

    try {
      const roadmapResponse = await axios.get(`http://localhost:8080/api/v1/roadmap/${parsedUserId}`, {
        timeout: 50000,
      });
      setRoadmap(Array.isArray(roadmapResponse.data) ? roadmapResponse.data : []);
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

  // Inicializa a busca de dados
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

  // Função para marcar/desmarcar um submódulo como concluído
  const handleSubmoduleToggle = (itemIndex, subIndex) => {
    const key = `${itemIndex}-${subIndex}`;
    setCompletedSubmodules((prev) => {
      const newState = { ...prev, [key]: !prev[key] };
      return newState;
    });
  };

  // Função para marcar um módulo como concluído e salvar no backend e no localStorage
  const handleModuleComplete = async (itemIndex) => {
    if (!roadmap || !roadmap[itemIndex]) return;
    const module = roadmap[itemIndex];
    const moduleId = module.ordem;

    try {
      // Salva no backend
      const response = await axios.post(
        `http://localhost:8080/api/v1/roadmap/complete/${userId}`,
        {
          moduleId: moduleId,
          title: module.titulo,
          completionDate: new Date().toISOString(),
          score: module.pontuacao || 0,
        },
        { timeout: 10000 }
      );

      // Atualiza o estado local de módulos concluídos
      setCompletedModules((prev) => {
        const newCompletedModules = {
          ...prev,
          [moduleId]: {
            completed: true,
            completionDate: new Date().toISOString(),
            title: module.titulo,
            score: module.pontuacao || 0,
          },
        };
        return newCompletedModules;
      });

      showNotificationMessage(`Módulo "${module.titulo}" concluído com sucesso!`, "success");

      // Atualiza o histórico
      fetchHistory();
    } catch (error) {
      showNotificationMessage(`Erro ao marcar módulo como concluído: ${error.message}`, "error");
    }
  };

  // Função para marcar todos os módulos como concluídos (ao clicar em "Concluir Curso")
  const handleCompleteCourse = async () => {
    if (!roadmap || !Array.isArray(roadmap)) return;

    try {
      // Marca todos os módulos como concluídos no backend
      const completionPromises = roadmap.map(async (module, index) => {
        if (!completedModules[module.ordem]?.completed) {
          await handleModuleComplete(index);
        }
      });

      await Promise.all(completionPromises);

      showNotificationMessage("Curso concluído com sucesso! Todos os módulos foram salvos.", "success");

      // Limpa os estados locais, se necessário
      setCompletedSubmodules({});
      setCompletedModules({});
      localStorage.removeItem(`completedSubmodules_${userId}`);
      localStorage.removeItem(`completedModules_${userId}`);
      localStorage.removeItem(`lastViewedTopicIndex_${userId}`);
      setCurrentItemIndex(0);

      // Atualiza o histórico
      fetchHistory();
    } catch (error) {
      showNotificationMessage(`Erro ao concluir o curso: ${error.message}`, "error");
    }
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
    if (!roadmap || !Array.isArray(roadmap)) return;
    const progress = {};
    roadmap.forEach((item) => {
      progress[item.ordem] = calculateSectionProgress(item, item.ordem - 1);
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
<<<<<<< HEAD
        <div className="loading-container">
          <div className="loading-circle" />
          <p>
            {t('Carregando seu guia de aprendizado...')}
          </p>
=======
        <Navbar variant="home" userId={userId} />
        <div className="loading-container">
          <div className="loading-circle" />
          <p>Carregando seu guia de aprendizado...</p>
>>>>>>> c2a2f3428d35862fe6949576390fe6637e4d80ea
        </div>
      </div>
    );
  }

  const currentRoadmapItem = roadmap && Array.isArray(roadmap) && roadmap.length > 0 ? roadmap[currentItemIndex] : null;

  return (
<<<<<<< HEAD
    <div className="home-container">
      <div className="main-content">
        <h1>{t('Bem-vindo')}</h1>
        <h2>{t('Olá, {user}! Seja bem-vindo ao Seu Guia de Aprendizado')}</h2>
=======
    <>
      <Navbar variant="home" />
      <div className="home-container">
        <div className="main-content">
          <h1>Bem-vindo!</h1>
          <h2>
            Olá, <span className="user-name">{user || "Usuário"}</span>! Seja bem-vindo ao Seu Guia de Aprendizado
          </h2>
>>>>>>> c2a2f3428d35862fe6949576390fe6637e4d80ea

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
                {t('Tentar Novamente')}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate("/login")}
              >
                {t('Voltar ao Login')}
              </Button>
            </div>
          </div>
        )}

        {!error && (
          <div className="card">
            <h2>{t('Visão Geral do Roadmap')}</h2>

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
                    <NavigateBefore /> {t('Anterior')}
                  </button>
                  <div className="module-counter">
                    {currentItemIndex + 1} / {roadmap.length}
                  </div>
                  <button
                    className="pagination-button"
                    onClick={goToNextTopic}
                    disabled={currentItemIndex === roadmap.length - 1}
                  >
                    {t('Próximo')} <NavigateNext />
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
                              <h4>{t('Nível de Dificuldade')}</h4>
                              <p>{currentRoadmapItem.nivelDificuldade}</p>
                            </div>
                          )}

                          {currentRoadmapItem.tempoEstimadoTotal && (
                            <div className="section">
                              <h4>{t('Tempo Estimado Total')}</h4>
                              <p>{currentRoadmapItem.tempoEstimadoTotal} horas</p>
                            </div>
                          )}

                          {currentRoadmapItem.submodulos?.length > 0 && (
                            <div className="section">
                              <h4>{t('Submódulos')}</h4>
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
                              <div className="submodules-list">
                                {currentRoadmapItem.submodulos.map((sub, subIndex) => {
                                  const key = `${currentItemIndex}-${subIndex}`;
                                  return (
                                    <Accordion
                                      key={subIndex}
                                      expanded={expandedAccordion === `panel-${subIndex}`}
                                      onChange={handleAccordionChange(`panel-${subIndex}`)}
                                    >
                                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <label style={{ display: "flex", alignItems: "center" }}>
                                          <input
                                            type="checkbox"
                                            checked={!!completedSubmodules[key]}
                                            onChange={() => handleSubmoduleToggle(currentItemIndex, subIndex)}
                                            onClick={(e) => e.stopPropagation()} // Evita que o clique no checkbox expanda o accordion
                                          />
                                          <Typography
                                            className={completedSubmodules[key] ? "completed" : ""}
                                            style={{ marginLeft: "8px" }}
                                          >
                                            {sub.nome}
                                          </Typography>
                                        </label>
                                      </AccordionSummary>
                                      <AccordionDetails>
                                        {sub.recursos && sub.recursos.length > 0 ? (
                                          <ul>
                                            {sub.recursos.map((recurso, idx) => (
                                              <li key={idx}>
                                                {recurso.tipo}: {recurso.nome}{" "}
                                                {recurso.link && (
                                                  <a
                                                    href={recurso.link}
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
                                        ) : (
                                          <Typography>{t('Nenhum recurso disponível.')}</Typography>
                                        )}
                                      </AccordionDetails>
                                    </Accordion>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {currentRoadmapItem.cronograma?.length > 0 && (
                            <div className="section">
                              <h4>{t('Cronograma')}</h4>
                              <ul>
                                {currentRoadmapItem.cronograma.map((sessao, idx) => (
                                  <li key={idx}>
                                    {t('Dia: {dia}, {horarioInicio} - {horarioFim} ({cargaHoraria}h)')}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="side-column">
                          {currentRoadmapItem.metodosEstudo?.length > 0 && (
                            <div className="section">
                              <h4>{t('Métodos de Estudo')}</h4>
                              <ul>
                                {currentRoadmapItem.metodosEstudo.map((metodo, idx) => (
                                  <li key={idx}>{metodo}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {currentRoadmapItem.materiaisApoio?.length > 0 && (
                            <div className="section">
                              <h4>{t('Materiais de Apoio')}</h4>
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
                              <h4>{t('Dicas Adicionais')}</h4>
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
                <p>{t('Nenhum roadmap disponível.')}</p>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/create-roadmap", { state: { userId } })}
                >
                  {t('Criar Novo Roadmap')}
                </Button>
              </div>
<<<<<<< HEAD
            )}
          </div>
        )}
=======
            </div>
          )}

          {!error && (
            <div className="card">
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                centered
                className="tabs"
                aria-label="Navegação entre Roadmap e Histórico"
              >
                <Tab label="Roadmap" />
                <Tab label="Histórico de Conclusão" />
              </Tabs>

              {tabValue === 0 && (
                <>
                  <h2>Visão Geral do Roadmap</h2>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${calculateProgress}%` }}>
                      <span className="progress-text">{Math.round(calculateProgress)}%</span>
                    </div>
                  </div>

                  {roadmap && Array.isArray(roadmap) && roadmap.length > 0 ? (
                    <div className="roadmap-section">
                      <div className="pagination-controls">
                        <button
                          className="pagination-button"
                          onClick={goToPreviousTopic}
                          disabled={currentItemIndex === 0}
                          aria-label="Tópico Anterior"
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
                          aria-label="Próximo Tópico"
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
                                  {notifications.includes(currentRoadmapItem.ordem) ? <Notifications /> : <NotificationsOff />}
                                </IconButton>
                                <IconButton
                                  onClick={saveProgress}
                                  color="primary"
                                  aria-label="Salvar progresso"
                                >
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
                                          style={{ width: `${calculateSectionProgress(currentRoadmapItem, currentItemIndex)}%` }}
                                        />
                                      </div>
                                      <span>{Math.round(calculateSectionProgress(currentRoadmapItem, currentItemIndex))}%</span>
                                    </div>
                                    <div className="submodules-list">
                                      {currentRoadmapItem.submodulos.map((sub, subIndex) => {
                                        const key = `${currentItemIndex}-${subIndex}`;
                                        return (
                                          <Accordion
                                            key={subIndex}
                                            expanded={expandedAccordion === `panel-${subIndex}`}
                                            onChange={handleAccordionChange(`panel-${subIndex}`)}
                                            role="region"
                                            aria-labelledby={`submodule-${subIndex}`}
                                          >
                                            <AccordionSummary
                                              expandIcon={<ExpandMoreIcon />}
                                              id={`submodule-${subIndex}`}
                                            >
                                              <label style={{ display: "flex", alignItems: "center" }}>
                                                <input
                                                  type="checkbox"
                                                  checked={!!completedSubmodules[key]}
                                                  onChange={() => handleSubmoduleToggle(currentItemIndex, subIndex)}
                                                  onClick={(e) => e.stopPropagation()}
                                                  aria-label={`Marcar ${sub.nome} como concluído`}
                                                />
                                                <Typography
                                                  className={completedSubmodules[key] ? "completed" : ""}
                                                  style={{ marginLeft: "8px" }}
                                                >
                                                  {sub.nome}
                                                </Typography>
                                              </label>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                              {sub.recursos && sub.recursos.length > 0 ? (
                                                <ul>
                                                  {sub.recursos.map((recurso, idx) => (
                                                    <li key={idx}>
                                                      {recurso.tipo}: {recurso.nome}{" "}
                                                      {recurso.link && (
                                                        <a
                                                          href={recurso.link}
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
                                              ) : (
                                                <Typography>Nenhum recurso disponível.</Typography>
                                              )}
                                            </AccordionDetails>
                                          </Accordion>
                                        );
                                      })}
                                    </div>
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

                                {currentItemIndex === roadmap.length - 1 && (
                                  <div className="complete-module-section">
                                    <Button
                                      variant="contained"
                                      startIcon={<CheckCircle />}
                                      onClick={handleCompleteCourse}
                                      disabled={!areAllPreviousSubmodulesCompleted()}
                                      className="complete-module-button"
                                      aria-label="Concluir Curso"
                                    >
                                      Concluir Curso
                                    </Button>
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
                      <Typography className="empty-message">Nenhum roadmap disponível.</Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate("/create-roadmap", { state: { userId } })}
                      >
                        Criar Novo Roadmap
                      </Button>
                    </div>
                  )}
                </>
              )}

              {tabValue === 1 && (
                <div className="history-section">
                  <h2>Histórico de Conclusão</h2>
                  {history.length > 0 ? (
                    <div className="history-list">
                      {history.map((item, index) => (
                        <div key={index} className="history-item">
                          <Typography variant="h6">{item.title}</Typography>
                          <Typography>Data de Conclusão: {new Date(item.completionDate).toLocaleDateString()}</Typography>
                          <Typography>Pontuação: {item.score}</Typography>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Typography className="empty-message">Nenhum módulo concluído ainda.</Typography>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
>>>>>>> c2a2f3428d35862fe6949576390fe6637e4d80ea
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
    </div>
  );
};

export default TelaInicial;