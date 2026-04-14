import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, BookOpen } from 'lucide-react';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Button } from '@/components/atoms/Button/Button';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import logoSrc from '@/assets/foreground-1773528399195.png';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s: any) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });
      
      const user = useAuthStore.getState().user;
      toast.success(`Bienvenido/a, ${user?.name}`);

      if (user?.role === 'ADMIN') {
        navigate('/dashboard');
      } else if (user?.role === 'EMPLOYEE') {
        navigate('/orders');
      } else {
        navigate(returnTo || '/menu');
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Credenciales incorrectas';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass max-w-sm w-full p-8 mx-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blush to-lavender flex items-center justify-center mb-4 p-1">
          <img
            src={logoSrc}
            alt="Coffee & Chill — logo"
            className="w-full h-full rounded-2xl object-contain"
          />
        </div>
        <h1 className="font-display text-2xl font-bold text-text-primary">Coffee & Chill</h1>
        <p className="text-sm text-text-secondary mt-1">Ingresa a tu cuenta</p>
      </div>

      {/* Formulario de login */}
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

      {/* Registro */}
      <p className="text-sm text-text-secondary/70 text-center mt-5">
        ¿No tienes cuenta?{' '}
        <Link
          to="/register"
          state={{ returnTo }}
          className="text-text-primary font-medium hover:underline focus-ring rounded"
        >
          Regístrate
        </Link>
      </p>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-white/40" />
        <span className="text-xs text-text-secondary/50 whitespace-nowrap">o continúa sin cuenta</span>
        <div className="flex-1 h-px bg-white/40" />
      </div>

      {/* Acceso público a la carta */}
      <Link to="/menu">
        <Button variant="ghost" size="lg" className="w-full gap-2">
          <BookOpen size={18} />
          Ver nuestra carta
        </Button>
      </Link>
    </div>
  );
}
