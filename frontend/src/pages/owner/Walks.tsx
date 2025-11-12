import { useEffect, useState } from 'react';
import { OwnerLayout } from '../../components/OwnerLayout';
import { api } from '../../lib/api';
import { Calendar, Dog as DogIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import type { Walk } from '@dogwalking/shared';

export function OwnerWalks() {
  const [walks, setWalks] = useState<Walk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedWalk, setExpandedWalk] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    loadWalks();
  }, []);

  const loadWalks = async () => {
    try {
      const data = await api.getWalks();
      setWalks(data);
    } catch (error) {
      console.error('Failed to load walks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-accent/20 text-accent';
      case 'IN_PROGRESS': return 'bg-success/20 text-success';
      case 'COMPLETED': return 'bg-primary/20 text-primary';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Geplant';
      case 'IN_PROGRESS': return 'Läuft';
      case 'COMPLETED': return 'Abgeschlossen';
      case 'CANCELLED': return 'Abgesagt';
      default: return status;
    }
  };

  const filteredWalks = walks.filter(walk => {
    if (filter === 'upcoming') return walk.status === 'SCHEDULED';
    if (filter === 'completed') return walk.status === 'COMPLETED';
    return true;
  });

  if (isLoading) {
    return (
      <OwnerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-dark">Meine Walks</h2>
          <p className="text-gray-600 mt-2">Übersicht aller Walks mit deinen Hunden</p>
        </div>

        {/* Filter */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Alle
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-accent text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Geplant
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Abgeschlossen
          </button>
        </div>

        {filteredWalks.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === 'all' && 'Noch keine Walks'}
              {filter === 'upcoming' && 'Keine geplanten Walks'}
              {filter === 'completed' && 'Keine abgeschlossenen Walks'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWalks.map((walk) => {
              const isExpanded = expandedWalk === walk.id;
              const myDogs = walk.attendances?.filter(a => a.dog) || [];
              
              return (
                <div key={walk.id} className="card">
                  <button
                    onClick={() => setExpandedWalk(isExpanded ? null : walk.id)}
                    className="w-full"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-accent" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-dark">
                            {format(new Date(walk.date), 'EEEE, dd. MMMM yyyy')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {myDogs.length} {myDogs.length === 1 ? 'Hund' : 'Hunde'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(walk.status)}`}>
                          {getStatusLabel(walk.status)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      {walk.notes && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-600 mb-1">Notizen</h4>
                          <p className="text-gray-800">{walk.notes}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-semibold text-gray-600 mb-2">Teilnehmende Hunde</h4>
                        <div className="space-y-2">
                          {myDogs.map((attendance) => (
                            <div
                              key={attendance.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <DogIcon className="w-5 h-5 text-primary" />
                                <span className="font-medium text-dark">{attendance.dog?.name}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                {attendance.attended && (
                                  <span className="text-sm px-2 py-1 bg-success/20 text-success rounded-full">
                                    Anwesend
                                  </span>
                                )}
                                {attendance.duration && (
                                  <span className="text-sm text-gray-600">
                                    {Math.floor(attendance.duration / 60)}h {attendance.duration % 60}min
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {walk.startTime && (
                        <div className="text-sm text-gray-600">
                          <strong>Gestartet:</strong> {format(new Date(walk.startTime), 'HH:mm')}
                          {walk.endTime && (
                            <> • <strong>Beendet:</strong> {format(new Date(walk.endTime), 'HH:mm')}</>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}

