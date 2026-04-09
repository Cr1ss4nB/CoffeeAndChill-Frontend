import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="bg-gradient-mesh" />
      <h1 className="text-6xl font-bold text-accent-primary">403</h1>
      <p className="text-text-secondary text-lg">No tienes permiso para ver esta página</p>
      <Link
        to="/menu"
        className="mt-4 px-6 py-2 rounded-full bg-accent-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Volver al menú
      </Link>
    </div>
  );
}
