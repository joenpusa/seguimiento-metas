import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
        alert("Por favor ingrese email y contraseña");
        return;
    }
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <img-replace src="/placeholder-logo.svg" alt="Logo de la Aplicación" className="w-24 h-24 mx-auto mb-4" />
              <CardTitle className="text-3xl font-bold text-slate-800">Iniciar Sesión</CardTitle>
              <CardDescription className="text-slate-600">Accede a tu panel de gestión de planes.</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div 
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Label htmlFor="email" className="text-slate-700">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/80 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </motion.div>
              <motion.div 
                className="space-y-2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Label htmlFor="password" className="text-slate-700">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/80 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 text-base" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Ingresar'}
                </Button>
              </motion.div>
            </form>
          </CardContent>
          <CardFooter className="text-center text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Mi Organización. Todos los derechos reservados.</p>
          </CardFooter>
        </Card>
        <div className="text-center mt-4 text-sm text-slate-300">
            <p>Usuarios de prueba:</p>
            <p>Admin: admin@example.com / adminpass</p>
            <p>Responsable 1 (Secretaría General): responsable1@example.com / resppass</p>
            <p>Responsable 2 (Oficina de Planeación): responsable2@example.com / resppass</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;