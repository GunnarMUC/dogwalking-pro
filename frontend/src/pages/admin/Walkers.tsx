import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../lib/api';
import { UserPlus, Star, MapPin, Clock, X, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../lib/utils';
import type { WalkerProfile, User } from '@dogwalking/shared';

export function AdminWalkers() {
  const [walkers, setWalkers] = useState<WalkerProfile[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWalker, setEditingWalker] = useState<WalkerProfile | null>(null);

  const [formData, setFormData] = useState({
    userId: '',
    bio: '',
    experienceYears: 0,
    hourlyRate: 25,
    serviceAreas: '',
    availability: 'Mo-Fr 08:00-18:00',
    isAvailable: true,
    certifications: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [walkersData, usersData] = await Promise.all([
        api.getWalkers(),
        api.getUsers(),
      ]);
      setWalkers(walkersData);
      setAdmins(usersData.filter(u => u.role === 'ADMIN'));
    } catch (error) {
      toast.error('Fehler beim Laden der Walker-Daten');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      bio: '',
      experienceYears: 0,
      hourlyRate: 25,
      serviceAreas: '',
      availability: 'Mo-Fr 08:00-18:00',
      isAvailable: true,
      certifications: '',
    });
    setEditingWalker(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        serviceAreas: formData.serviceAreas.split(',').map(s => s.trim()).filter(Boolean),
        certifications: formData.certifications.split(',').map(s => s.trim()).filter(Boolean),
        availability: [formData.availability],
      };

      if (editingWalker) {
        await api.updateWalker(editingWalker.id, payload);
        toast.success('Walker-Profil aktualisiert');
      } else {
        await api.createWalker(payload);
        toast.success('Walker-Profil erstellt');
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Speichern');
    }
  };

  const handleDelete = async (walker: WalkerProfile) => {
    if (!window.confirm(`Walker-Profil von ${walker.user?.firstName} wirklich löschen?`)) return;
    try {
      await api.deleteWalker(walker.id);
      toast.success('Walker-Profil gelöscht');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Löschen fehlgeschlagen');
    }
  };

  const openEditModal = (walker: WalkerProfile) => {
    setEditingWalker(walker);
    setFormData({
      userId: walker.userId,
      bio: walker.bio,
      experienceYears: walker.experienceYears,
      hourlyRate: walker.hourlyRate,
      serviceAreas: (walker.serviceAreas as any as string[]).join(', '),
      availability: (walker.availability?.[0]) || 'Mo-Fr 08:00-18:00',
      isAvailable: walker.isAvailable,
      certifications: (walker.certifications as any as string[]).join(', '),
    });
    setShowModal(true);
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
            <h2 className="text-3xl font-bold text-dark">Walker</h2>
            <p className="text-gray-600 mt-2">Verwalte Walker-Profile und Einsatzgebiete</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Neuer Walker</span>
          </button>
        </div>

        {/* Walker Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-gradient-to-br from-primary/10 to-primary/5">
            <p className="text-sm text-gray-600">Aktive Walker</p>
            <p className="text-3xl font-bold text-dark mt-2">
              {walkers.filter(w => w.isAvailable).length}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-accent/10 to-accent/5">
            <p className="text-sm text-gray-600">Gesamt Walks</p>
            <p className="text-3xl font-bold text-dark mt-2">
              {walkers.reduce((sum, w) => sum + w.totalWalks, 0)}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-success/10 to-success/5">
            <p className="text-sm text-gray-600">Ø Bewertung</p>
            <p className="text-3xl font-bold text-dark mt-2">
              {walkers.length > 0 
                ? (walkers.reduce((sum, w) => sum + w.averageRating, 0) / walkers.length).toFixed(1)
                : '-'}
            </p>
          </div>
        </div>

        {/* Walker Grid */}
        {walkers.length === 0 ? (
          <div className="card text-center py-12">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Noch keine Walker-Profile erstellt</p>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="btn-primary mt-4"
            >
              Erstes Walker-Profil erstellen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {walkers.map(walker => (
              <div key={walker.id} className="card hover:border-primary transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {walker.user?.firstName?.[0]}{walker.user?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark">
                        {walker.user?.firstName} {walker.user?.lastName}
                      </h3>
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{walker.averageRating.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({walker.totalWalks} Walks)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => openEditModal(walker)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(walker)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{walker.bio}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{walker.experienceYears} Jahre Erfahrung</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{formatCurrency(walker.hourlyRate)}/Std.</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {(walker.serviceAreas as any as string[]).map((area, idx) => (
                    <span key={idx} className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs">
                      {area}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    walker.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {walker.isAvailable ? 'Verfügbar' : 'Nicht verfügbar'}
                  </span>
                  {walker.availability && (walker.availability as any).length > 0 && (
                    <span className="text-xs text-gray-500">
                      {(walker.availability as any)[0]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-dark">
                  {editingWalker ? 'Walker-Profil bearbeiten' : 'Neues Walker-Profil'}
                </h3>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {!editingWalker && (
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Admin-Nutzer *</label>
                    <select
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      required
                      className="input"
                    >
                      <option value="">Admin auswählen...</option>
                      {admins.map(a => (
                        <option key={a.id} value={a.id}>{a.firstName} {a.lastName} ({a.email})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Bio *</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="input"
                    placeholder="Beschreibung der Erfahrung und des Umgangs mit Hunden..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Erfahrung (Jahre) *</label>
                    <input
                      type="number"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                      min="0" max="50"
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">Stundensatz (€) *</label>
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                      min="5" max="200" step="0.5"
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Einsatzgebiete (Komma-getrennt) *</label>
                  <input
                    type="text"
                    value={formData.serviceAreas}
                    onChange={(e) => setFormData({ ...formData, serviceAreas: e.target.value })}
                    className="input"
                    placeholder="München Zentrum, Schwabing, Maxvorstadt"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Verfügbarkeit</label>
                  <input
                    type="text"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="input"
                    placeholder="Mo-Fr 08:00-18:00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Zertifikate (Komma-getrennt)</label>
                  <input
                    type="text"
                    value={formData.certifications}
                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                    className="input"
                    placeholder="Hundeführerschein, Erste Hilfe"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-5 h-5 mr-3"
                  />
                  <label className="text-sm font-medium text-dark">Verfügbar für neue Walks</label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="btn-outline flex-1"
                  >
                    Abbrechen
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    {editingWalker ? 'Aktualisieren' : 'Erstellen'}
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
