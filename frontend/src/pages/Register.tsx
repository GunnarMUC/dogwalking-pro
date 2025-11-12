import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { Dog, CheckCircle } from 'lucide-react';

export function Register() {
  const search = useSearch({ from: '/register' }) as { token?: string };
  const token = search.token || '';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  
  const { register } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setValidatingToken(false);
      return;
    }

    api.validateInvitation(token)
      .then((result) => {
        setTokenValid(result.valid);
        setEmail(result.email);
        setValidatingToken(false);
      })
      .catch(() => {
        toast.error('Ungültiger oder abgelaufener Einladungslink');
        setValidatingToken(false);
      });
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwörter stimmen nicht überein');
      return;
    }

    if (!acceptPrivacy) {
      toast.error('Bitte akzeptiere die Datenschutzbestimmungen');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        phone: phone || undefined,
        token
      });
      toast.success('Registrierung erfolgreich!');
      navigate({ to: '/owner' });
    } catch (error: any) {
      toast.error(error.message || 'Registrierung fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 px-4">
        <div className="card max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-dark mb-4">Einladung erforderlich</h1>
          <p className="text-gray-600">
            Die Registrierung ist nur über einen Einladungslink möglich. Bitte kontaktiere deinen Dogwalker.
          </p>
          <button
            onClick={() => navigate({ to: '/login' })}
            className="btn-primary mt-6"
          >
            Zur Anmeldung
          </button>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 px-4">
        <div className="card max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-dark mb-4">Ungültiger Link</h1>
          <p className="text-gray-600">
            Dieser Einladungslink ist ungültig oder abgelaufen. Bitte fordere einen neuen Link an.
          </p>
          <button
            onClick={() => navigate({ to: '/login' })}
            className="btn-primary mt-6"
          >
            Zur Anmeldung
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 px-4 py-8">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success rounded-full mb-4">
            <Dog className="w-8 h-8 text-dark" />
          </div>
          <h1 className="text-3xl font-bold text-dark">Registrierung</h1>
          <p className="text-gray-600 mt-2">Erstelle dein Konto</p>
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
              readOnly
              className="input bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-dark mb-2">
                Vorname
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="input"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-dark mb-2">
                Nachname
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-dark mb-2">
              Telefon (optional)
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
              placeholder="+49 123 456789"
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
              minLength={6}
              className="input"
              placeholder="Mindestens 6 Zeichen"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark mb-2">
              Passwort bestätigen
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input"
            />
          </div>

          <div className="flex items-start">
            <input
              id="privacy"
              type="checkbox"
              checked={acceptPrivacy}
              onChange={(e) => setAcceptPrivacy(e.target.checked)}
              className="mt-1 mr-2"
            />
            <label htmlFor="privacy" className="text-sm text-gray-600">
              Ich akzeptiere die Datenschutzbestimmungen und stimme der Verarbeitung meiner Daten gemäß DSGVO zu.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-success w-full"
          >
            {isLoading ? 'Wird registriert...' : 'Registrieren'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate({ to: '/login' })}
            className="text-primary hover:underline text-sm"
          >
            Bereits registriert? Zur Anmeldung
          </button>
        </div>
      </div>
    </div>
  );
}

