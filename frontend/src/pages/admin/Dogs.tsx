import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../lib/api';
import { Dog, Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Dog as DogType, User, CreateDogRequest } from '@dogwalking/shared';

export function AdminDogs() {
  const [dogs, setDogs] = useState<DogType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDog, setEditingDog] = useState<DogType | null>(null);
  const [formData, setFormData] = useState<CreateDogRequest>({
    name: '',
    breed: '',
    age: undefined,
    weight: undefined,
    ownerId: '',
    medicalNotes: '',
    emergencyContact: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dogsData, usersData] = await Promise.all([
        api.getDogs(),
        api.getUsers(),
      ]);
      setDogs(dogsData);
      setUsers(usersData.filter(u => u.role === 'OWNER'));
    } catch (error) {
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDog) {
        await api.updateDog(editingDog.id, formData);
        toast.success('Hund aktualisiert');
      } else {
        await api.createDog(formData);
        toast.success('Hund erstellt');
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Speichern');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hund wirklich löschen?')) return;
    try {
      await api.deleteDog(id);
      toast.success('Hund gelöscht');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Löschen');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      breed: '',
      age: undefined,
      weight: undefined,
      ownerId: '',
      medicalNotes: '',
      emergencyContact: '',
    });
    setEditingDog(null);
  };

  const openEditModal = (dog: DogType) => {
    setEditingDog(dog);
    setFormData({
      name: dog.name,
      breed: dog.breed || '',
      age: dog.age || undefined,
      weight: dog.weight || undefined,
      ownerId: dog.ownerId,
      medicalNotes: dog.medicalNotes || '',
      emergencyContact: dog.emergencyContact || '',
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
            <h2 className="text-3xl font-bold text-dark">Hunde</h2>
            <p className="text-gray-600 mt-2">Verwalte alle registrierten Hunde</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Neuer Hund</span>
          </button>
        </div>

        {dogs.length === 0 ? (
          <div className="card text-center py-12">
            <Dog className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Noch keine Hunde registriert</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary mt-4"
            >
              Ersten Hund anlegen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dogs.map((dog) => (
              <div key={dog.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Dog className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark">{dog.name}</h3>
                      <p className="text-sm text-gray-600">{dog.breed || 'Keine Rasse'}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(dog)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(dog.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Besitzer:</span>
                    <span className="font-medium">{dog.owner?.firstName} {dog.owner?.lastName}</span>
                  </div>
                  {dog.age && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Alter:</span>
                      <span className="font-medium">{dog.age} Jahre</span>
                    </div>
                  )}
                  {dog.weight && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gewicht:</span>
                      <span className="font-medium">{dog.weight} kg</span>
                    </div>
                  )}
                  {dog.medicalNotes && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-gray-600 text-xs">Medizinische Notizen:</p>
                      <p className="text-gray-800 text-xs mt-1">{dog.medicalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-dark">
                  {editingDog ? 'Hund bearbeiten' : 'Neuer Hund'}
                </h3>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Besitzer *
                  </label>
                  <select
                    value={formData.ownerId}
                    onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                    required
                    className="input"
                  >
                    <option value="">Besitzer auswählen...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Rasse
                    </label>
                    <input
                      type="text"
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Alter (Jahre)
                    </label>
                    <input
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value ? Number(e.target.value) : undefined })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Gewicht (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value ? Number(e.target.value) : undefined })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Notfallkontakt
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="input"
                    placeholder="+49 123 456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Medizinische Notizen
                  </label>
                  <textarea
                    value={formData.medicalNotes}
                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                    rows={3}
                    className="input"
                    placeholder="Allergien, Medikamente, besondere Bedürfnisse..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="btn-outline flex-1"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingDog ? 'Aktualisieren' : 'Erstellen'}
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

