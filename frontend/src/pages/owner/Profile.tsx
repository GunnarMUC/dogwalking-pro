import { useState, useEffect, FormEvent } from 'react';
import { OwnerLayout } from '../../components/OwnerLayout';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { User as UserIcon, Mail, Phone, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export function OwnerProfile() {
  const { user, checkAuth } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await api.updateUser(user.id, formData);
      toast.success('Profil aktualisiert');
      setIsEditing(false);
      await checkAuth();
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <OwnerLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-dark">Mein Profil</h2>
          <p className="text-gray-600 mt-2">Verwalte deine persönlichen Informationen</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
              >
                Bearbeiten
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Vorname *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Nachname *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  E-Mail
                </label>
                <div className="input bg-gray-100 cursor-not-allowed flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{user?.email}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">E-Mail kann nicht geändert werden</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Telefon
                </label>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400 ml-4" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input flex-1"
                    placeholder="+49 123 456789"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    if (user) {
                      setFormData({
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        phone: user.phone || '',
                      });
                    }
                  }}
                  className="btn-outline flex-1"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-success flex-1 flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Speichert...' : 'Speichern'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Vorname
                  </label>
                  <p className="text-dark font-medium">{user?.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nachname
                  </label>
                  <p className="text-dark font-medium">{user?.lastName}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  E-Mail
                </label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-dark font-medium">{user?.email}</p>
                </div>
              </div>

              {user?.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Telefon
                  </label>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-dark font-medium">{user.phone}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Privacy Info */}
        <div className="card bg-accent/5">
          <h4 className="font-semibold text-dark mb-2">Datenschutz</h4>
          <p className="text-sm text-gray-600">
            Deine Daten werden gemäß DSGVO verarbeitet und gespeichert. 
            Nur dein Dogwalker hat Zugriff auf deine persönlichen Informationen. 
            Bei Fragen kontaktiere bitte deinen Dogwalker.
          </p>
        </div>
      </div>
    </OwnerLayout>
  );
}

