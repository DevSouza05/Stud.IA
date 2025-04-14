import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Grid } from '@mui/material';
import { EmojiEvents, LocalFireDepartment, Stars } from '@mui/icons-material';
import { StyledPaper, StyledLinearProgress, StyledChip, StyledTooltip } from './FeedbackRewards.styles';
import { useApp } from '../../context/AppContext';

const FeedbackRewards = () => {
  const { state } = useApp();
  const { gamification } = state;

  const progress = useMemo(() => {
    const pointsPerLevel = 100;
    const currentLevelPoints = gamification.totalPoints % pointsPerLevel;
    return Math.round((currentLevelPoints / pointsPerLevel) * 100);
  }, [gamification.totalPoints]);

  const getAchievementTooltip = (achievement) => {
    if (achievement.unlocked) {
      return `Desbloqueado em ${new Date(achievement.unlockedAt).toLocaleDateString()}`;
    }
    return achievement.description || 'Continue estudando para desbloquear esta conquista!';
  };

  return (
    <StyledPaper elevation={3}>
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Nível {gamification.level}
        </Typography>
        <StyledLinearProgress variant="determinate" value={progress} />
        <Typography variant="caption" color="textSecondary">
          {progress}% para o próximo nível
        </Typography>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={6}>
          <Box display="flex" alignItems="center">
            <LocalFireDepartment color="error" sx={{ mr: 1 }} />
            <Typography variant="body1">
              Sequência: {gamification.currentStreak} dias
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box display="flex" alignItems="center">
            <Stars color="primary" sx={{ mr: 1 }} />
            <Typography variant="body1">
              Pontos: {gamification.totalPoints}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Conquistas
        </Typography>
        <Box display="flex" flexWrap="wrap">
          {gamification.achievements.map((achievement) => (
            <StyledTooltip 
              key={achievement.id}
              title={getAchievementTooltip(achievement)}
              arrow
            >
              <StyledChip
                icon={<EmojiEvents />}
                label={achievement.name}
                variant={achievement.unlocked ? 'filled' : 'outlined'}
              />
            </StyledTooltip>
          ))}
        </Box>
      </Box>
    </StyledPaper>
  );
};

FeedbackRewards.propTypes = {
  gamification: PropTypes.shape({
    level: PropTypes.number.isRequired,
    totalPoints: PropTypes.number.isRequired,
    currentStreak: PropTypes.number.isRequired,
    achievements: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        unlocked: PropTypes.bool.isRequired,
        unlockedAt: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
};

export default FeedbackRewards; 