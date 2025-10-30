import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Loader2, KeyRound, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const { currentUser, changePasswordContext, loading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast({ title: "Error", description: "No hay un usuario autenticado.", variant: "destructive" });
      return;
    }
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast({ title: "Error de Validación", description: "Todos los campos son obligatorios.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Error de Validación", description: "Las nuevas contraseñas no coinciden.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
        toast({ title: "Error de Validación", description: "La nueva contraseña debe tener al menos 6 caracteres.", variant: "destructive" });
        return;
    }

    await changePasswordContext(currentUser.id, currentPassword, newPassword);
    // El contexto se encarga de redirigir
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-sky-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-xl bg-white/95 backdrop-blur-sm border">
          <CardHeader className="text-center">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <KeyRound className="w-16 h-16 text-sky-600 mb-3" />
              <CardTitle className="text-2xl font-bold text-slate-800">Cambiar Contraseña</CardTitle>
              <CardDescription className="text-slate-600">
                {currentUser?.requiereCambioClave ? 'Por favor, establece una nueva contraseña.' : 'Actualiza tu contraseña actual.'}
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div 
                className="space-y-1.5"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Label htmlFor="currentPassword" className="text-slate-700 font-medium">Contraseña Actual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Tu contraseña actual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-slate-50 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </motion.div>
              <motion.div 
                className="space-y-1.5"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Label htmlFor="newPassword" className="text-slate-700 font-medium">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-50 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </motion.div>
              <motion.div 
                className="space-y-1.5"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Label htmlFor="confirmNewPassword" className="text-slate-700 font-medium">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  placeholder="Repite tu nueva contraseña"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="bg-slate-50 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="pt-2"
              >
                <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 text-base" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><ShieldCheck className="mr-2 h-4 w-4" /> Cambiar Contraseña</>}
                </Button>
              </motion.div>
            </form>
          </CardContent>
           <CardFooter className="text-center text-xs text-slate-500 pt-4">
             {currentUser?.requiereCambioClave && !currentUser.rol === 'admin' && (
                <p className="text-orange-600">Es necesario que cambies tu contraseña inicial para continuar.</p>
             )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default ChangePasswordPage;