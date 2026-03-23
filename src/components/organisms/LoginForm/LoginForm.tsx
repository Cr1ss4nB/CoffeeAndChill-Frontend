import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Coffee, Mail, Lock } from 'lucide-react';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Button } from '@/components/atoms/Button/Button';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // TODO: Replace with actual API call to POST /auth/login
    await new Promise((r) => setTimeout(r, 800));

    if (email === 'admin@coffeechill.co' && password === 'admin') {
      login(
        { id: 'e1', name: 'Valentina Rojas', email, role: 'ADMIN', active: true },
        'mock-token-admin'
      );
      toast.success('Bienvenida, Valentina');
      navigate('/dashboard');
    } else if (email === 'empleado@coffeechill.co' && password === 'empleado') {
      login(
        { id: 'e2', name: 'Santiago Herrera', email, role: 'EMPLOYEE', active: true },
        'mock-token-employee'
      );
      toast.success('Bienvenido, Santiago');
      navigate('/orders');
    } else if (email === 'cliente@coffeechill.co' && password === 'cliente') {
      login(
        { id: 'c1', name: 'María García', email, role: 'CUSTOMER', active: true },
        'mock-token-customer'
      );
      toast.success('Bienvenida, María');
      navigate(returnTo || '/menu');
    } else {
      toast.error('Credenciales incorrectas');
    }
    setLoading(false);
  }

  return (
    <div className="glass max-w-sm w-full p-8 mx-4">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blush to-lavender flex items-center justify-center mb-4">
          <Coffee size={32} className="text-text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold text-text-primary">Coffee & Chill</h1>
        <p className="text-sm text-text-secondary mt-1">Ingresa a tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-[38px] text-text-secondary/50 z-10" />
          <FormField
            label="Email"
            fieldId="email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            required
            className="!pl-10"
          />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-[38px] text-text-secondary/50 z-10" />
          <FormField
            label="Contraseña"
            fieldId="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
            required
            className="!pl-10"
          />
        </div>
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Iniciar Sesión
        </Button>
      </form>

      <p className="text-sm text-text-secondary/70 text-center mt-6">
        ¿No tienes cuenta?{' '}
        <Link
          to="/register"
          state={{ returnTo }}
          className="text-text-primary font-medium hover:underline focus-ring rounded"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}
