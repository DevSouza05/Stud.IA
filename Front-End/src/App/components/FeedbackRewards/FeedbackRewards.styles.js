import { styled } from '@mui/material/styles';
import { Paper, LinearProgress, Chip, Tooltip } from '@mui/material';

export const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  willChange: 'transform',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
}));

export const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: theme.palette.grey[200],
  overflow: 'hidden',
  '& .MuiLinearProgress-bar': {
    borderRadius: 5,
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
    transition: 'transform 0.3s ease-in-out',
    willChange: 'transform',
    '&:hover': {
      transform: 'scaleY(1.2)',
    },
  },
}));

export const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  transition: 'all 0.2s ease-in-out',
  willChange: 'transform, box-shadow',
  '&.MuiChip-filled': {
    background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.light} 90%)`,
    color: theme.palette.common.white,
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: theme.shadows[2],
    },
  },
  '&.MuiChip-outlined': {
    borderColor: theme.palette.grey[400],
    color: theme.palette.text.secondary,
    '&:hover': {
      transform: 'scale(1.05)',
      borderColor: theme.palette.primary.main,
    },
  },
}));

export const StyledTooltip = styled(Tooltip)(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontSize: '0.875rem',
    padding: theme.spacing(1, 2),
    boxShadow: theme.shadows[2],
    maxWidth: 200,
    '& .MuiTooltip-arrow': {
      color: theme.palette.background.paper,
    },
  },
})); 