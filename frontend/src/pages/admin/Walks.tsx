import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../lib/api';
import { Calendar, Plus, Play, Square, X, CheckCircle, Circle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import type { Walk, Dog, WalkStatus } from '@dogwalking/shared';

export function AdminWalks() {
  const [walks, setWalks] = useState<Walk[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedWalk, setSelectedWalk] = useState<Walk | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    dogIds: [] as string[],
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = async () => {
    try {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      
      const [walksData, dogsData] = await Promise.all([
        api.getWalks({ startDate: start, endDate: end }),
        api.getDogs(),
      ]);
      setWalks(walksData);
      setDogs(dogsData);
    } catch (error) {
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createWalk(formData);
      toast.success('Walk erstellt');
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Erstellen');
    }
  };

  const handleStartWalk = async (walk: Walk) => {
    try {
      await api.startWalk(walk.id);
      toast.success('Walk gestartet');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Starten');
    }
  };

  const handleEndWalk = async (walk: Walk) => {
    try {
      await api.endWalk(walk.id);
      toast.success('Walk beendet');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Beenden');
    }
  };

  const handleToggleAttendance = async (walkId: string, dogId: string, currentAttended: boolean) => {
    try {
      await api.updateAttendance(walkId, dogId, !currentAttended);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Aktualisieren');
    }
  };

  const resetForm = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      dogIds: [],
      notes: '',
    });
  };

  const toggleDog = (dogId: string) => {
    setFormData(prev => ({
      ...prev,
      dogIds: prev.dogIds.includes(dogId)
        ? prev.dogIds.filter(id => id !== dogId)
        : [...prev.dogIds, dogId]
    }));
  };

  const getWalksForDate = (date: Date) => {
    return walks.filter(walk => isSameDay(new Date(walk.date), date));
  };

  const getStatusColor = (status: WalkStatus) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-accent/20 text-accent';
      case 'IN_PROGRESS': return 'bg-success/20 text-success';
      case 'COMPLETED': return 'bg-primary/20 text-primary';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: WalkStatus) => {
    switch (status) {
      case 'SCHEDULED': return 'Geplant';
      case 'IN_PROGRESS': return 'Läuft';
      case 'COMPLETED': return 'Abgeschlossen';
      case 'CANCELLED': return 'Abgesagt';
      default: return status;
    }
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

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
            <h2 className="text-3xl font-bold text-dark">Walks</h2>
            <p className="text-gray-600 mt-2">Plane und verwalte alle Walks</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Neuer Walk</span>
          </button>
        </div>

        {/* Calendar header */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-dark">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="btn-outline"
              >
                Vorheriger
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="btn-secondary"
              >
                Heute
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="btn-outline"
              >
                Nächster
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                {day}
              </div>
            ))}
            
            {monthDays.map(date => {
              const dayWalks = getWalksForDate(date);
              const isToday = isSameDay(date, new Date());
              
              return (
                <div
                  key={date.toString()}
                  className={`border rounded-lg p-2 min-h-[100px] ${
                    isToday ? 'bg-primary/5 border-primary' : 'border-gray-200'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {format(date, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayWalks.map(walk => (
                      <button
                        key={walk.id}
                        onClick={() => setSelectedWalk(walk)}
                        className={`w-full text-left text-xs px-2 py-1 rounded ${getStatusColor(walk.status)}`}
                      >
                        <div className="font-medium truncate">
                          {walk.attendances?.length || 0} {walk.attendances?.length === 1 ? 'Hund' : 'Hunde'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Walk Details Modal */}
        {selectedWalk && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-dark">Walk Details</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {format(new Date(selectedWalk.date), 'dd. MMMM yyyy')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedWalk(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedWalk.status)}`}>
                      {getStatusLabel(selectedWalk.status)}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    {selectedWalk.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleStartWalk(selectedWalk)}
                        className="btn-success flex items-center space-x-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>Walk starten</span>
                      </button>
                    )}
                    {selectedWalk.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleEndWalk(selectedWalk)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Square className="w-4 h-4" />
                        <span>Walk beenden</span>
                      </button>
                    )}
                  </div>
                </div>

                {selectedWalk.notes && (
                  <div>
                    <h4 className="font-semibold text-dark mb-2">Notizen</h4>
                    <p className="text-gray-600">{selectedWalk.notes}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-dark mb-3">Teilnehmende Hunde</h4>
                  <div className="space-y-2">
                    {selectedWalk.attendances?.map(attendance => (
                      <div
                        key={attendance.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleToggleAttendance(
                              selectedWalk.id,
                              attendance.dogId,
                              attendance.attended
                            )}
                            disabled={selectedWalk.status === 'COMPLETED'}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              attendance.attended
                                ? 'bg-success border-success'
                                : 'border-gray-300'
                            }`}
                          >
                            {attendance.attended && <CheckCircle className="w-4 h-4 text-white" />}
                          </button>
                          <div>
                            <p className="font-medium text-dark">{attendance.dog?.name}</p>
                            <p className="text-sm text-gray-600">
                              {attendance.dog?.owner?.firstName} {attendance.dog?.owner?.lastName}
                            </p>
                          </div>
                        </div>
                        {attendance.duration && (
                          <div className="text-sm text-gray-600">
                            {Math.floor(attendance.duration / 60)}h {attendance.duration % 60}min
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedWalk.startTime && (
                  <div className="text-sm text-gray-600">
                    <strong>Gestartet:</strong> {format(new Date(selectedWalk.startTime), 'HH:mm')}
                    {selectedWalk.endTime && (
                      <> | <strong>Beendet:</strong> {format(new Date(selectedWalk.endTime), 'HH:mm')}</>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Walk Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-dark">Neuer Walk</h3>
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
                    Datum *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Hunde auswählen * ({formData.dogIds.length} ausgewählt)
                  </label>
                  <div className="border border-gray-200 rounded-xl p-4 max-h-64 overflow-y-auto space-y-2">
                    {dogs.map(dog => (
                      <label
                        key={dog.id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.dogIds.includes(dog.id)}
                          onChange={() => toggleDog(dog.id)}
                          className="w-5 h-5"
                        />
                        <div>
                          <p className="font-medium text-dark">{dog.name}</p>
                          <p className="text-sm text-gray-600">
                            {dog.owner?.firstName} {dog.owner?.lastName}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Notizen
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="input"
                    placeholder="Besondere Hinweise für diesen Walk..."
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
                    disabled={formData.dogIds.length === 0}
                    className="btn-primary flex-1"
                  >
                    Walk erstellen
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

