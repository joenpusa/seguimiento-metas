import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Target, 
  TrendingUp, 
  FileBarChart, 
  Settings, 
  HelpCircle, 
  X, 
  Archive, 
  ShieldCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Sidebar = ({ open, setOpen, isDesktop }) => {
  const { currentUser } = useAuth();

  const baseNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', adminOnly: false },
    { icon: Target, label: 'Metas', path: '/metas', adminOnly: false },
    { icon: TrendingUp, label: 'Avances', path: '/avances', adminOnly: false },
    { icon: FileBarChart, label: 'Informes', path: '/informes', adminOnly: false },
    { icon: Archive, label: 'Admin General', path: '/admin-plan', adminOnly: false }, // Visible para todos, el contenido interno se restringe
  ];

  const navItems = baseNavItems.filter(item => {
    if (item.adminOnly && (!currentUser || currentUser.rol !== 'admin')) {
      return false;
    }
    return true;
  });


  const sidebarVariants = {
    open: { x: 0, width: '16rem' , transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', width: '16rem', transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  const desktopSidebarVariants = {
    open: { width: '16rem', opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30, when: "beforeChildren" } },
    closed: { width: '0rem', opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 30, when: "afterChildren" } },
  };
  
  const navLinkVariants = {
    open: { opacity: 1, x: 0, transition: { delay: 0.1, type: 'spring', stiffness: 100 } },
    closed: { opacity: 0, x: -20, transition: { duration: 0.1 } }
  };

  const overlayVariants = {
    open: { opacity: 0.5, display: 'block' },
    closed: { opacity: 0, transitionEnd: { display: 'none' } }
  };

  const handleNavLinkClick = () => {
    if (!isDesktop) {
      setOpen(false);
    }
  };

  const currentVariants = isDesktop ? desktopSidebarVariants : sidebarVariants;

  return (
    <>
      {!isDesktop && (
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              onClick={() => setOpen(false)}
            />
          )}
        </AnimatePresence>
      )}

      <motion.aside
        className={`fixed inset-y-0 left-0 z-30 bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-200 flex flex-col
                    ${isDesktop ? 'md:relative' : ''} overflow-hidden shadow-lg`}
        variants={currentVariants}
        initial={isDesktop ? (open ? "open" : "closed") : "closed"}
        animate={open ? "open" : "closed"}
      >
        <div className={`p-4 border-b border-slate-200 flex items-center ${!open && isDesktop ? 'justify-center' : 'justify-between'} flex-shrink-0 h-16`}>
          <AnimatePresence>
          {open && (
            <motion.div 
              className="flex items-center space-x-2"
              initial={{opacity:0, x: -20}}
              animate={{opacity:1, x:0}}
              exit={{opacity:0, x: -20, transition: {duration:0.1}}}
              transition={{delay:0.1}}
            >
              <div className="h-8 w-8 rounded-lg bg-sky-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-500 bg-clip-text text-transparent whitespace-nowrap">
                Plan App
              </h1>
            </motion.div>
          )}
          </AnimatePresence>
          {!isDesktop && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setOpen(false)}
              className="text-slate-500 hover:text-sky-600"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <motion.nav 
            className="flex-1 pt-4 pb-4 overflow-y-auto"
            initial={false}
            animate={open ? "open" : "closed"}
        >
          <ul className="space-y-1.5 px-3">
            {navItems.map((item) => (
              <motion.li key={item.path} variants={navLinkVariants}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all whitespace-nowrap relative ${
                      isActive 
                        ? 'bg-sky-100 text-sky-700 shadow-sm' 
                        : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                    }`
                  }
                  onClick={handleNavLinkClick}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                      <span className={`${isActive ? 'font-semibold':''}`}>{item.label}</span>
                      {isActive && open && ( 
                        <motion.div
                          className="absolute left-0 w-1 h-full bg-sky-500 rounded-r-md"
                          layoutId="activeNavHighlight"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </motion.li>
            ))}
          </ul>
        </motion.nav>
        
        <AnimatePresence>
        {open && (
            <motion.div 
              className="p-4 border-t border-slate-200 flex-shrink-0"
              initial={{opacity:0, y:20}}
              animate={{opacity:1, y:0}}
              exit={{opacity:0, y:20, transition:{duration:0.1}}}
              transition={{delay: 0.1}}
            >
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-sky-600 w-full justify-start gap-2">
                  <Settings className="h-4 w-4" /> Configuración
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-sky-600 w-full justify-start gap-2">
                  <HelpCircle className="h-4 w-4" /> Ayuda
                </Button>
            </div>
            </motion.div>
        )}
        </AnimatePresence>

      </motion.aside>
    </>
  );
};

export default Sidebar;