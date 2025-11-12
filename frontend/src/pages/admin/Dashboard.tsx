import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../lib/api';
import { Dog, Users, Calendar, TrendingUp, Mail } from 'lucide-react';
import type { Dog as DogType, User, Walk } from '@dogwalking/shared';

export function AdminDashboard() {
  const [dogs, setDogs] = useState<DogType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [walks, setWalks] = useState<Walk[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dogsData, usersData, walksData] = await Promise.all([
        api.getDogs(),
        api.getUsers(),
        api.getWalks(),
      ]);
      setDogs(dogsData);
      setUsers(usersData.filter(u => u.role === 'OWNER'));
      setWalks(walksData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const upcomingWalks = walks.filter(w => w.status === 'SCHEDULED').length;
  const inProgressWalks = walks.filter(w => w.status === 'IN_PROGRESS').length;

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
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-dark">Dashboard</h2>
          <p className="text-gray-600 mt-2">Willkommen zurück! Hier ist eine Übersicht deiner Dogwalking-Community.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hunde gesamt</p>
                <p className="text-3xl font-bold text-dark mt-2">{dogs.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Dog className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Besitzer</p>
                <p className="text-3xl font-bold text-dark mt-2">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-dark" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Anstehende Walks</p>
                <p className="text-3xl font-bold text-dark mt-2">{upcomingWalks}</p>
              </div>
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktive Walks</p>
                <p className="text-3xl font-bold text-dark mt-2">{inProgressWalks}</p>
              </div>
              <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-dark" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Dogs */}
        <div className="card">
          <h3 className="text-xl font-bold text-dark mb-4">Neueste Hunde</h3>
          {dogs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Noch keine Hunde registriert</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dogs.slice(0, 6).map((dog) => (
                <div key={dog.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Dog className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-dark truncate">{dog.name}</p>
                      <p className="text-sm text-gray-600 truncate">{dog.breed || 'Keine Rasse'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => window.location.href = '/admin/dogs'}
            className="card-hover text-left"
          >
            <Dog className="w-8 h-8 text-primary mb-3" />
            <h4 className="font-semibold text-dark">Hunde verwalten</h4>
            <p className="text-sm text-gray-600 mt-2">Hundeprofile anlegen und bearbeiten</p>
          </button>

          <button
            onClick={() => window.location.href = '/admin/walks'}
            className="card-hover text-left"
          >
            <Calendar className="w-8 h-8 text-accent mb-3" />
            <h4 className="font-semibold text-dark">Walk planen</h4>
            <p className="text-sm text-gray-600 mt-2">Neue Walks erstellen und verwalten</p>
          </button>

          <button
            onClick={() => window.location.href = '/admin/invitations'}
            className="card-hover text-left"
          >
            <Mail className="w-8 h-8 text-secondary mb-3" />
            <h4 className="font-semibold text-dark">Besitzer einladen</h4>
            <p className="text-sm text-gray-600 mt-2">Neue Hundebesitzer einladen</p>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

