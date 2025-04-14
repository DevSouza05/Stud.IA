import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Badge,
  Tooltip,
  IconButton,
  Collapse,
  Paper,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useApp } from '../../context/AppContext';

const FeedbackRewards = ({ 
  currentStreak = 0,
  totalPoints = 0,
  level = 1,
  achievements = [],
  nextMilestone = null
}) => {
  const { state, actions } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);

  // Calcular progresso para o próximo nível
  const pointsPerLevel = 100;
  const currentLevelPoints = totalPoints % pointsPerLevel;
  const progressToNextLevel = (currentLevelPoints / pointsPerLevel) * 100;

  // Verificar conquistas recém-desbloqueadas
  useEffect(() => {
    const newAchievements = achievements.filter(achievement => 
      achievement.unlocked && !achievement.notified
    );
    
    if (newAchievements.length > 0) {
      setCurrentAchievement(newAchievements[0]);
      setShowAchievement(true);
      
      // Marcar como notificado
      const updatedAchievements = achievements.map(achievement => 
        achievement.id === newAchievements[0].id 
          ? { ...achievement, notified: true } 
          : achievement
      );
      
      // Atualizar no contexto global
      actions.setAchievements(updatedAchievements);
    }
  }, [achievements, actions]);

  // Calcular streak atual
  const streakColor = (streak) => {
    if (streak < 3) return '#b0bec5';
    if (streak < 7) return '#4caf50';
    if (streak < 14) return '#2196f3';
    return '#f44336';
  };

  return (
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
          Seu Progresso
        </Typography>
        <IconButton 
          size="small" 
          onClick={() => setExpanded(!expanded)}
          aria-label="Expandir detalhes de progresso"
        >
          <TrendingUpIcon />
        </IconButton>
      </Box>

      {/* Nível e Pontos */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Badge 
            badgeContent={level} 
            color="primary"
            sx={{ mr: 1 }}
          >
            <EmojiEventsIcon color="primary" />
          </Badge>
          <Typography variant="subtitle1">
            Nível {level}
          </Typography>
          <Chip 
            label={`${totalPoints} pontos`} 
            size="small" 
            color="secondary" 
            sx={{ ml: 'auto' }}
          />
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progressToNextLevel} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
            }
          }} 
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {pointsPerLevel - currentLevelPoints} pontos para o próximo nível
        </Typography>
      </Box>

      {/* Streak */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LocalFireDepartmentIcon sx={{ color: streakColor(currentStreak), mr: 1 }} />
        <Typography variant="body1">
          {currentStreak} dias seguidos de estudo
        </Typography>
        {currentStreak > 0 && (
          <Chip 
            label={`+${currentStreak * 5} pontos/dia`} 
            size="small" 
            color="success" 
            sx={{ ml: 'auto' }}
          />
        )}
      </Box>

      {/* Próximo marco */}
      {nextMilestone && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Próximo marco:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StarIcon sx={{ color: '#ffc107', mr: 1 }} />
            <Typography variant="body2">
              {nextMilestone.description}
            </Typography>
            <Chip 
              label={`+${nextMilestone.points} pontos`} 
              size="small" 
              color="primary" 
              sx={{ ml: 'auto' }}
            />
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Conquistas */}
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
          Conquistas ({achievements.filter(a => a.unlocked).length}/{achievements.length})
        </Typography>
        <TrendingUpIcon />
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          {achievements.map((achievement) => (
            <Box 
              key={achievement.id} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1,
                opacity: achievement.unlocked ? 1 : 0.5
              }}
            >
              <EmojiEventsIcon 
                sx={{ 
                  color: achievement.unlocked ? '#ffc107' : '#b0bec5',
                  mr: 1 
                }} 
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2">
                  {achievement.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {achievement.description}
                </Typography>
              </Box>
              {achievement.unlocked && (
                <Chip 
                  label={`+${achievement.points} pontos`} 
                  size="small" 
                  color="success" 
                />
              )}
            </Box>
          ))}
        </Box>
      </Collapse>

      {/* Notificação de conquista */}
      <Collapse in={showAchievement}>
        <Paper 
          elevation={4}
          sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: '#e8f5e9',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <EmojiEventsIcon sx={{ color: '#4caf50', mr: 1 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" color="primary">
              Conquista Desbloqueada!
            </Typography>
            <Typography variant="body2">
              {currentAchievement?.title}
            </Typography>
          </Box>
          <IconButton 
            size="small" 
            onClick={() => setShowAchievement(false)}
            aria-label="Fechar notificação"
          >
            <Typography variant="caption">×</Typography>
          </IconButton>
        </Paper>
      </Collapse>
    </Paper>
  );
};

FeedbackRewards.propTypes = {
  currentStreak: PropTypes.number,
  totalPoints: PropTypes.number,
  level: PropTypes.number,
  achievements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      points: PropTypes.number.isRequired,
      unlocked: PropTypes.bool.isRequired,
      notified: PropTypes.bool,
    })
  ),
  nextMilestone: PropTypes.shape({
    description: PropTypes.string.isRequired,
    points: PropTypes.number.isRequired,
  }),
};

export default FeedbackRewards; 