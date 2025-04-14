import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  LinearProgress,
  Tooltip,
  IconButton,
  Collapse,
  Paper,
  Grid,
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FeedbackRewards from './FeedbackRewards';
import { useApp } from '../../context/AppContext';

const RoadmapProgress = ({ 
  progress = 0,
  totalModules = 0,
  completedModules = 0,
  currentModule = '',
  estimatedTime = '',
  lastActivity = ''
}) => {
  const { state, actions } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Dados de gamificação (em um cenário real, viriam do backend)
  const [gamificationData, setGamificationData] = useState({
    currentStreak: 3,
    totalPoints: 250,
    level: 3,
    achievements: [
      {
        id: '1',
        title: 'Primeiro Passo',
        description: 'Complete seu primeiro módulo',
        points: 50,
        unlocked: true,
        notified: true
      },
      {
        id: '2',
        title: 'Estudante Dedicado',
        description: 'Mantenha uma streak de 7 dias',
        points: 100,
        unlocked: false,
        notified: false
      },
      {
        id: '3',
        title: 'Mestre do Conhecimento',
        description: 'Complete 10 módulos',
        points: 200,
        unlocked: false,
        notified: false
      }
    ],
    nextMilestone: {
      description: 'Complete 5 módulos',
      points: 150
    }
  });

  const progressColor = (progress) => {
    if (progress < 30) return '#ff4444';
    if (progress < 70) return '#ffbb33';
    return '#00C851';
  };

  // Atualizar dados de gamificação quando o progresso mudar
  useEffect(() => {
    // Simular atualização de conquistas baseado no progresso
    const updatedAchievements = gamificationData.achievements.map(achievement => {
      if (achievement.id === '3' && completedModules >= 10) {
        return { ...achievement, unlocked: true };
      }
      return achievement;
    });

    setGamificationData(prev => ({
      ...prev,
      achievements: updatedAchievements
    }));
  }, [completedModules]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Paper 
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 2,
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
              Seu Roadmap de Estudos
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => setShowTooltip(!showTooltip)}
              aria-label="Informações sobre o progresso"
            >
              <InfoIcon />
            </IconButton>
          </Box>

          <Tooltip
            open={showTooltip}
            title={
              <Box sx={{ p: 1 }}>
                <Typography variant="body2">
                  • Módulos Completos: {completedModules}/{totalModules}
                </Typography>
                <Typography variant="body2">
                  • Tempo Estimado: {estimatedTime}
                </Typography>
                <Typography variant="body2">
                  • Última Atividade: {lastActivity}
                </Typography>
              </Box>
            }
          >
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: progressColor(progress),
                    borderRadius: 5,
                  },
                }}
              />
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mt: 1, textAlign: 'right' }}
              >
                {progress}% completo
              </Typography>
            </Box>
          </Tooltip>

          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
            onClick={() => setExpanded(!expanded)}
          >
            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
              Detalhes do Progresso
            </Typography>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>

          <Collapse in={expanded}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Módulo Atual: {currentModule}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Módulos Completos: {completedModules} de {totalModules}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tempo Estimado: {estimatedTime}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Última Atividade: {lastActivity}
              </Typography>
            </Box>
          </Collapse>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <FeedbackRewards {...gamificationData} />
      </Grid>
    </Grid>
  );
};

RoadmapProgress.propTypes = {
  progress: PropTypes.number,
  totalModules: PropTypes.number,
  completedModules: PropTypes.number,
  currentModule: PropTypes.string,
  estimatedTime: PropTypes.string,
  lastActivity: PropTypes.string,
};

export default RoadmapProgress;
