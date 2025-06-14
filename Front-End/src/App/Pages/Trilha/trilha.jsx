// src/App/Pages/Trilha/trilha.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Checkbox,
  CircularProgress,
  Button,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import "../styles/TrilhaPage.css";
import { Navbar } from "../../components/Navbar/index.tsx";

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "https://stud-ia.onrender.com";

const TreeNode = ({ node, progress, handleCheckboxChange, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className={`tree-node level-${level}`} role="treeitem" aria-expanded={isOpen}>
      <div className="node-content">
        <div className="node-header">
          {node.subnos && node.subnos.length > 0 && (
            <Button
              className="toggle-button"
              onClick={toggleOpen}
              startIcon={isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              aria-label={isOpen ? `Fechar ${node.titulo}` : `Expandir ${node.titulo}`}
            />
          )}
          <label className="node-label">
            {node.id && (
              <Checkbox
                checked={!!progress[node.id]}
                onChange={() => handleCheckboxChange(node.id)}
                inputProps={{ "aria-label": `Marcar ${node.titulo} como concluído` }}
              />
            )}
            <Typography
              className={progress[node.id] ? "completed" : ""}
              variant="h6"
            >
              {node.titulo}
            </Typography>
          </label>
        </div>
        <div className="node-details">
          <Typography>
            <strong>Descrição:</strong> {node.descricao}
          </Typography>
          {node.dificuldade && (
            <Typography>
              <strong>Dificuldade:</strong> {node.dificuldade}
            </Typography>
          )}
          {node.tempoEstimado && (
            <Typography>
              <strong>Tempo Estimado:</strong> {node.tempoEstimado} horas
            </Typography>
          )}
          {node.recursos && node.recursos.length > 0 && (
            <div>
              <strong>Recursos:</strong>
              <ul>
                {node.recursos.map((recurso, idx) => (
                  <li key={idx}>
                    {recurso.tipo}:{" "}
                    <a
                      href={recurso.link}
                      className="material-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {recurso.nome}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {node.cronograma && node.cronograma.length > 0 && (
            <div>
              <strong>Cronograma:</strong>
              <ul>
                {node.cronograma.map((item, idx) => (
                  <li key={idx}>
                    Dia: {item.dia}, {item.horarioInicio} - {item.horarioFim} (
                    {item.cargaHoraria} horas)
                  </li>
                ))}
              </ul>
            </div>
          )}
          {node.metas && node.metas.length > 0 && (
            <div>
              <strong>Metas:</strong>
              <ul>
                {node.metas.map((meta, idx) => (
                  <li key={idx}>
                    {meta.descricao} (Recompensa: {meta.recompensa})
                  </li>
                ))}
              </ul>
            </div>
          )}
          {node.metodosEstudo && (
            <Typography>
              <strong>Métodos de Estudo:</strong> {node.metodosEstudo.join(", ")}
            </Typography>
          )}
          {node.locaisEstudo && (
            <Typography>
              <strong>Locais de Estudo:</strong> {node.locaisEstudo.join(", ")}
            </Typography>
          )}
          {node.notificacoes && node.notificacoes.length > 0 && (
            <Typography>
              <strong>Notificações:</strong> {node.notificacoes.join(", ")}
            </Typography>
          )}
          {node.revisoesPlanejadas && node.revisoesPlanejadas.length > 0 && (
            <div>
              <strong>Revisões Planejadas:</strong>
              <ul>
                {node.revisoesPlanejadas.map((revisao, idx) => (
                  <li key={idx}>
                    Dia: {revisao.dia}, Duração: {revisao.duracao} hora(s)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      {node.subnos && node.subnos.length > 0 && (
        <Collapse in={isOpen}>
          <div className="subnodes" role="group">
            {node.subnos.map((subnode) => (
              <TreeNode
                key={subnode.id}
                node={subnode}
                progress={progress}
                handleCheckboxChange={handleCheckboxChange}
                level={level + 1}
              />
            ))}
          </div>
        </Collapse>
      )}
    </div>
  );
};

const TrilhaPage = () => {
  const { id } = useParams();
  const [trilha, setTrilha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(() => {
    const savedProgress = localStorage.getItem(`trilhaProgress_${id}`);
    return savedProgress ? JSON.parse(savedProgress) : {};
  });

  useEffect(() => {
    const fetchTrilha = async () => {
      if (!id) {
        setError("ID do usuário não fornecido");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`/api/v1/trilha/${id}`);
        const data = response.data.trilha || response.data;
        if (!data.nos || !Array.isArray(data.nos)) {
          throw new Error("Estrutura de dados inválida: 'nos' não encontrado ou não é um array");
        }
        setTrilha(data);
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erro ao carregar a trilha. Tente novamente."
        );
        setLoading(false);
      }
    };
    fetchTrilha();
  }, [id]);

  useEffect(() => {
    if (id) {
      localStorage.setItem(`trilhaProgress_${id}`, JSON.stringify(progress));
    }
  }, [progress, id]);

  const handleCheckboxChange = (nodeId) => {
    setProgress((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  if (loading) {
    return (
      <div className="loading-container" role="status">
        <CircularProgress />
        <Typography>Carregando sua trilha...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <Navbar variant="home" />

        <div className="main-content">
          <Typography color="error" role="alert">
            {error}
          </Typography>
        </div>
      </div>
    );
  }

  if (!trilha || !trilha.titulo) {
    return (
      <div className="home-container">
        <Navbar variant="home" />

        <div className="main-content">
          <Typography>Nenhuma trilha encontrada.</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Navbar variant="home" />

      <div className="main-content">
        <Typography variant="h1">{trilha.titulo}</Typography>
        <Typography variant="h2">
          Explore sua trilha de aprendizado personalizada
        </Typography>
        <div className="card roadmap-section" role="tree">
          <div className="tree-container">
            {trilha.nos && trilha.nos.length > 0 ? (
              trilha.nos.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  progress={progress}
                  handleCheckboxChange={handleCheckboxChange}
                />
              ))
            ) : (
              <Typography>Nenhum nó disponível na trilha.</Typography>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrilhaPage;