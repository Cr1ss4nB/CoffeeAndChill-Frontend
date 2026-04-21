import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Coffee, Mail, Lock, User } from 'lucide-react';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Button } from '@/components/atoms/Button/Button';
import { useAuthStore } from '@/store/auth.store';
import api from '@/api/api.client';
import toast from 'react-hot-toast';

interface RegisterFormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s: any) => s.login);
  const navigate = useNavigate();

  function validate(): boolean {
    const next: RegisterFormErrors = {};
    if (!name.trim()) next.name = 'El nombre es obligatorio';
    if (!email.trim()) next.email = 'El correo es obligatorio';
    if (password.length < 8) next.password = 'Mínimo 8 caracteres';
    if (confirmPassword !== password) next.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      // 1. Registrar en el backend
      await api.post('/auth/register', {
        full_name: name.trim(),
        email: email.trim(),
        password,
      });

      // 2. Pequeña pausa para asegurar sincronización en DB (opcional pero recomendado)
      await new Promise((r) => setTimeout(r, 200));

      // 2. Auto-login con las credenciales recién creadas
      try {
        await login({ email, password });
        toast.success('¡Bienvenido a Coffee & Chill!');
        navigate('/menu');
      } catch (loginError) {
        toast.success('Cuenta creada. Por favor inicia sesión.');
        navigate('/login');
      }
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      if (typeof detail === 'string') {
        toast.error(detail);
      } else if (Array.isArray(detail)) {
        // Pydantic validation errors (lista de errores del BE)
        const msg = detail.map((d: any) => d.msg || d.message).join(', ');
        toast.error(msg);
      } else {
        toast.error('Lo sentimos, no pudimos crear tu cuenta. Revisa los datos.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass max-w-sm w-full p-8 mx-4">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blush to-lavender flex items-center justify-center mb-4">
          <Coffee size={32} className="text-text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold text-text-primary">Coffee & Chill</h1>
        <p className="text-sm text-text-secondary mt-1">Crea tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User size={16} className="absolute left-3 top-[38px] text-text-secondary/50 z-10" />
          <FormField
            label="Nombre completo"
            fieldId="name"
            type="text"
            placeholder="Valentina Rojas"
            value={name}
            onChange={(e) => setName((e.target as HTMLInputElement).value)}
            error={errors.name}
            required
            className="!pl-10"
          />
        </div>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-[38px] text-text-secondary/50 z-10" />
          <FormField
            label="Correo electrónico"
            fieldId="register-email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            error={errors.email}
            required
            className="!pl-10"
          />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-[38px] text-text-secondary/50 z-10" />
          <FormField
            label="Contraseña"
            fieldId="register-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
            error={errors.password}
            required
            className="!pl-10"
          />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-[38px] text-text-secondary/50 z-10" />
          <FormField
            label="Confirmar contraseña"
            fieldId="confirm-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword((e.target as HTMLInputElement).value)}
            error={errors.confirmPassword}
            required
            className="!pl-10"
          />
        </div>
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Crear cuenta
        </Button>
      </form>

      <p className="text-sm text-text-secondary/70 text-center mt-6">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-text-primary font-medium hover:underline focus-ring rounded">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
