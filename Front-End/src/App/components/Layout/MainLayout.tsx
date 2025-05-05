import React, { useState } from 'react';
import { Box } from '@mui/material';
import MenuDrawer from '../Drawer/drawer';
import { Navbar } from '../Navbar/index.tsx';
import { useApp } from '../../context/AppContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { state } = useApp();
  const { user } = state;
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar variant="home" onMenuClick={() => setDrawerOpen(true)} />
      <MenuDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </>
  );
};

export default MainLayout; 