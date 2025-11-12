import { useState, FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '@dogwalking/shared';
import toast from 'react-hot-toast';
import { Dog } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Erfolgreich angemeldet!');
      
      // Redirect based on role
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === UserRole.ADMIN) {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/owner' });
      }
    } catch (error: any) {
      toast.error(error.message || 'Anmeldung fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Dog className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-dark">Dogwalking Community</h1>
          <p className="text-gray-600 mt-2">Willkommen zurück!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-dark mb-2">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="deine@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-dark mb-2">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo-Zugänge:</p>
          <p className="mt-1">Admin: admin@dogwalking.com / admin123</p>
          <p>Besitzer: owner@example.com / owner123</p>
        </div>
      </div>
    </div>
  );
}

