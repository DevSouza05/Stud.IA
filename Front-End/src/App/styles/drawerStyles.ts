import { Theme } from '@mui/material/styles';

export const drawerStyles = (theme: Theme) => ({
  drawer: {
    '& .MuiDrawer-paper': {
      width: 280,
      backgroundColor: theme.palette.background.default,
      borderLeft: `1px solid ${theme.palette.divider}`,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.palette.grey[200],
    '& .MuiLinearProgress-bar': {
      borderRadius: 4,
    },
  },
  avatar: {
    width: 56,
    height: 56,
    border: `2px solid ${theme.palette.primary.main}`,
    boxShadow: 2,
  },
  menuItem: {
    borderRadius: 1,
    mb: 1,
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'action.hover',
      transform: 'translateX(-4px)',
    },
  },
  settingsContainer: {
    pl: 4,
    pr: 2,
    py: 1,
    animation: 'fadeIn 0.3s ease-in-out',
    '@keyframes fadeIn': {
      from: { opacity: 0, transform: 'translateY(-10px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
  },
  logoutButton: {
    color: 'error.main',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'error.light',
      color: 'error.contrastText',
    },
  },
}); 