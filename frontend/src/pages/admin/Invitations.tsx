import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../lib/api';
import { Mail, Plus, X, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { Invitation } from '@dogwalking/shared';

export function AdminInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const data = await api.getInvitations();
      setInvitations(data);
    } catch (error) {
      toast.error('Fehler beim Laden der Einladungen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createInvitation({ email });
      toast.success('Einladung erstellt');
      setShowModal(false);
      setEmail('');
      loadInvitations();
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Erstellen');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Einladung wirklich löschen?')) return;
    try {
      await api.deleteInvitation(id);
      toast.success('Einladung gelöscht');
      loadInvitations();
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Löschen');
    }
  };

  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/register?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    toast.success('Link kopiert!');
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-dark">Einladungen</h2>
            <p className="text-gray-600 mt-2">Lade neue Hundebesitzer zur App ein</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Neue Einladung</span>
          </button>
        </div>

        {invitations.length === 0 ? (
          <div className="card text-center py-12">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Noch keine Einladungen verschickt</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary mt-4"
            >
              Erste Einladung erstellen
            </button>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      E-Mail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Erstellt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Läuft ab
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitations.map((invitation) => {
                    const isExpired = new Date(invitation.expiresAt) < new Date();
                    const isUsed = !!invitation.usedAt;
                    
                    return (
                      <tr key={invitation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-dark">{invitation.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isUsed ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success/20 text-success">
                              Verwendet
                            </span>
                          ) : isExpired ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Abgelaufen
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-accent/20 text-accent">
                              Aktiv
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {format(new Date(invitation.createdAt), 'dd.MM.yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {format(new Date(invitation.expiresAt), 'dd.MM.yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {!isUsed && !isExpired && (
                            <button
                              onClick={() => copyInvitationLink(invitation.token)}
                              className="text-primary hover:text-primary/80 mr-4 inline-flex items-center space-x-1"
                            >
                              {copiedToken === invitation.token ? (
                                <><Check className="w-4 h-4" /> <span>Kopiert</span></>
                              ) : (
                                <><Copy className="w-4 h-4" /> <span>Link kopieren</span></>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(invitation.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Löschen
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-dark">Neue Einladung</h3>
                <button
                  onClick={() => { setShowModal(false); setEmail(''); }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    E-Mail-Adresse des Besitzers
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input"
                    placeholder="besitzer@example.com"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Der Besitzer erhält einen Registrierungslink, der 7 Tage gültig ist.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEmail(''); }}
                    className="btn-outline flex-1"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Einladung erstellen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

