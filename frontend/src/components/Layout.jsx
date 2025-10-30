import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

const Layout = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  // El sidebar en desktop está abierto por defecto, en móvil cerrado.
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  const updateMedia = useCallback(() => {
    const desktop = window.innerWidth >= 768;
    setIsDesktop(desktop);
    // Si cambia a móvil, cierra el sidebar. Si cambia a desktop, lo abre.
    setSidebarOpen(desktop); 
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateMedia);
    return () => window.removeEventListener('resize', updateMedia);
  }, [updateMedia]);
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} isDesktop={isDesktop} />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isDesktop && sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Header toggleSidebar={toggleSidebar} isDesktopSidebarVisible={isDesktop && sidebarOpen} />
        
        <motion.main 
          className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;