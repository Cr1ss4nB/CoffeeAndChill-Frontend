import { AuthTemplate } from '@/components/templates/AuthTemplate/AuthTemplate';
import { LoginForm } from '@/components/organisms/LoginForm/LoginForm';

export default function LoginPage() {
  return (
    <AuthTemplate>
      <LoginForm />
    </AuthTemplate>
  );
}
