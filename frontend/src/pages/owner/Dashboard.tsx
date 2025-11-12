import { useEffect, useState } from 'react';
import { OwnerLayout } from '../../components/OwnerLayout';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Dog, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Dog as DogType, Walk } from '@dogwalking/shared';

export function OwnerDashboard() {
  const { user } = useAuthStore();
  const [dogs, setDogs] = useState<DogType[]>([]);
  const [walks, setWalks] = useState<Walk[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dogsData, walksData] = await Promise.all([
        api.getDogs(),
        api.getWalks(),
      ]);
      setDogs(dogsData);
      setWalks(walksData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const upcomingWalks = walks.filter(w => w.status === 'SCHEDULED');
  const completedWalks = walks.filter(w => w.status === 'COMPLETED');

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
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-dark">Willkommen, {user?.firstName}!</h2>
          <p className="text-gray-600 mt-2">Hier ist eine Übersicht deiner Hunde und Walks</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Meine Hunde</p>
                <p className="text-3xl font-bold text-dark mt-2">{dogs.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Dog className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Geplante Walks</p>
                <p className="text-3xl font-bold text-dark mt-2">{upcomingWalks.length}</p>
              </div>
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abgeschlossene Walks</p>
                <p className="text-3xl font-bold text-dark mt-2">{completedWalks.length}</p>
              </div>
              <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-dark" />
              </div>
            </div>
          </div>
        </div>

        {/* My Dogs */}
        <div className="card">
          <h3 className="text-xl font-bold text-dark mb-4">Meine Hunde</h3>
          {dogs.length === 0 ? (
            <div className="text-center py-8">
              <Dog className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Noch keine Hunde registriert</p>
              <p className="text-sm text-gray-400 mt-2">Kontaktiere deinen Dogwalker, um einen Hund zu registrieren</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dogs.map((dog) => (
                <div key={dog.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary transition-colors">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Dog className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark">{dog.name}</h4>
                      <p className="text-sm text-gray-600">{dog.breed || 'Keine Rasse'}</p>
                    </div>
                  </div>
                  {(dog.age || dog.weight) && (
                    <div className="space-y-1 text-sm text-gray-600">
                      {dog.age && <p>Alter: {dog.age} Jahre</p>}
                      {dog.weight && <p>Gewicht: {dog.weight} kg</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Walks */}
        <div className="card">
          <h3 className="text-xl font-bold text-dark mb-4">Anstehende Walks</h3>
          {upcomingWalks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Keine anstehenden Walks</p>
          ) : (
            <div className="space-y-3">
              {upcomingWalks.slice(0, 5).map((walk) => (
                <div key={walk.id} className="border border-gray-200 rounded-xl p-4 hover:border-accent transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold text-dark">
                          {format(new Date(walk.date), 'EEEE, dd. MMMM yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {walk.attendances?.length || 0} {walk.attendances?.length === 1 ? 'Hund' : 'Hunde'}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium">
                      Geplant
                    </span>
                  </div>
                  {walk.notes && (
                    <p className="text-sm text-gray-600 mt-3 pl-13">{walk.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </OwnerLayout>
  );
}

