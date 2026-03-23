import { AuthTemplate } from '@/components/templates/AuthTemplate/AuthTemplate';
import { RegisterForm } from '@/components/organisms/RegisterForm/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthTemplate>
      <RegisterForm />
    </AuthTemplate>
  );
}
