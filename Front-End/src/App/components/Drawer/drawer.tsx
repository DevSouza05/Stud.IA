import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Box,
  Typography,
  Avatar,
  ListItemButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  LinearProgress,
  Tooltip,
  Badge,
  Collapse,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Language as LanguageIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { styled } from '@mui/material/styles';
import { drawerStyles } from '../../styles/drawerStyles';
import { useNotifications } from '../../context/NotificationContext';
import { useThemeMode } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 300,
    backgroundColor: theme.palette.background.default,
    borderLeft: `1px solid ${theme.palette.divider}`,
    padding: 0,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    backgroundColor: theme.palette.primary.main,
  },
}));

interface MenuDrawerProps {
  open?: boolean;
  onClose?: () => void;
}

const MenuDrawer: React.FC<MenuDrawerProps> = ({ open, onClose }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof open === 'boolean';
  const drawerOpen = isControlled ? open : internalOpen;
  const handleOpen = () => (isControlled ? null : setInternalOpen(true));
  const handleClose = () => {
    if (isControlled && onClose) onClose();
    else setInternalOpen(false);
  };

  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { mode, toggleTheme } = useThemeMode();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const { user, progress } = state;
  const themeMUI = useTheme();
  const { notifications, markAsRead, unreadCount } = useNotifications();

  const menuItems = [
    { text: 'Início', icon: <HomeIcon />, path: '/home' },
    { text: 'Meu Progresso', icon: <SchoolIcon />, path: '/progress' },
    { text: 'Avaliações', icon: <AssessmentIcon />, path: '/assessments' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    handleClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    actions.setUser({
      name: '',
      email: '',
      avatar: '',
    });
    navigate('/login');
  };

  const handleNotificationClick = (notificationId: number) => {
    markAsRead(notificationId);
    // Aqui você pode adicionar lógica específica para cada tipo de notificação
  };

  return (
    <>
      {!isControlled && (
        <IconButton
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={handleOpen}
          sx={{ ml: 2 }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <MenuIcon />
          </Badge>
        </IconButton>
      )}

      <StyledDrawer
        anchor="right"
        open={drawerOpen}
        onClose={handleClose}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Cabeçalho do Drawer */}
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={user.avatar} 
              sx={{ width: 56, height: 56, border: (theme) => `2px solid ${theme.palette.primary.main}`, boxShadow: 2 }}
            />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {user.name || 'Usuário'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nível {state.gamification.level}
              </Typography>
            </Box>
          </Box>
          <ProgressBar 
            variant="determinate" 
            value={state.gamification.progress} 
            sx={{ mb: 1 }}
          />
          <Divider sx={{ my: 1 }} />

          {/* Notificações */}
          <Divider sx={{ my: 1 }} />
          <Box sx={{ px: 2, pb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {t('Notificações')}
            </Typography>
            <ListItemButton onClick={() => setShowNotifications(!showNotifications)} sx={{ py: 1, px: 0, borderRadius: 1 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText primary={t('Ver notificações')} />
              {showNotifications ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
            <Collapse in={showNotifications} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ mt: 0.5 }}>
                {notifications.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }}>
                    {t('Nenhuma notificação no momento.')}
                  </Typography>
                )}
                {notifications.map((notification) => (
                  <ListItemButton
                    key={notification.id}
                    sx={{ pl: 4, backgroundColor: notification.read ? 'transparent' : 'action.hover', py: 0.5, borderRadius: 1, mb: 0.5 }}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <NotificationsIcon fontSize="small" color={notification.read ? 'disabled' : 'primary'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.message}
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: `${notification.type}.main`,
                        fontWeight: notification.read ? 'normal' : 'medium',
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </Box>
          <Divider sx={{ my: 1 }} />

          {/* Menu Principal */}
          <List sx={{ mb: 1 }}>
            {menuItems.map((item) => (
              <Tooltip key={item.text} title={item.text} placement="left">
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{ borderRadius: 1, mb: 0.5, py: 1, px: 2 }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItemButton>
              </Tooltip>
            ))}
          </List>

          <Divider sx={{ my: 1 }} />

          {/* Menu Secundário */}
          <List>
            <ListItemButton 
              onClick={() => setShowSettings(!showSettings)}
              sx={{ borderRadius: 1, py: 1, px: 2 }}
            >
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText 
                primary={t('Configurações')}
                primaryTypographyProps={{ fontWeight: 'medium' }}
              />
              {showSettings ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
            <Collapse in={showSettings} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 4, pr: 2, py: 1 }}>
                <ListItem>
                  <ListItemIcon><DarkModeIcon /></ListItemIcon>
                  <ListItemText 
                    primary={t('Modo Escuro')}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                  <Switch
                    checked={mode === 'dark'}
                    onChange={toggleTheme}
                    color="primary"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><LanguageIcon /></ListItemIcon>
                  <FormControl fullWidth>
                    <InputLabel>{t('Idioma')}</InputLabel>
                    <Select
                      value={language}
                      label={t('Idioma')}
                      onChange={e => setLanguage(e.target.value)}
                      sx={{ '& .MuiSelect-select': { fontWeight: 'medium' } }}
                    >
                      <MenuItem value="pt-BR">Português (BR)</MenuItem>
                      <MenuItem value="en-US">English (US)</MenuItem>
                      <MenuItem value="es-ES">Español (ES)</MenuItem>
                    </Select>
                  </FormControl>
                </ListItem>
                <ListItemButton 
                  onClick={() => handleNavigation('/profile')}
                  sx={{ borderRadius: 1, py: 1, px: 2 }}
                >
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText 
                    primary={t('Editar Perfil')}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItemButton>
              </Box>
            </Collapse>
            <Divider sx={{ my: 1 }} />
            <ListItemButton 
              onClick={handleLogout}
              sx={{
                color: 'error.main',
                borderRadius: 1,
                py: 1,
                px: 2,
                mt: 1,
                mb: 1,
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'error.light',
                  color: 'error.contrastText',
                },
              }}
            >
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText 
                primary={t('Sair')}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItemButton>
          </List>
        </Box>
      </StyledDrawer>
    </>
  );
};

export default MenuDrawer;