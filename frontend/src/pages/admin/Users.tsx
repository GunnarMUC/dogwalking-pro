import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../lib/api';
import { Users as UsersIcon, Dog, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { User } from '@dogwalking/shared';

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      // Filter out admins, only show owners
      setUsers(data.filter(u => u.role === 'OWNER'));
    } catch (error) {
      toast.error('Fehler beim Laden der Besitzer');
    } finally {
      setIsLoading(false);
    }
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
        <div>
          <h2 className="text-3xl font-bold text-dark">Besitzer</h2>
          <p className="text-gray-600 mt-2">Übersicht aller registrierten Hundebesitzer</p>
        </div>

        {users.length === 0 ? (
          <div className="card text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Noch keine Besitzer registriert</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div key={user.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                      <UsersIcon className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark">{user.firstName} {user.lastName}</h3>
                      <p className="text-xs text-gray-500">
                        Seit {format(new Date(user.createdAt), 'dd.MM.yyyy')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${user.email}`} className="text-primary hover:underline">
                      {user.email}
                    </a>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${user.phone}`} className="text-gray-600 hover:underline">
                        {user.phone}
                      </a>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200 flex items-center space-x-2">
                    <Dog className="w-4 h-4 text-primary" />
                    <span className="text-sm text-gray-600">
                      {user._count?.dogs || 0} {user._count?.dogs === 1 ? 'Hund' : 'Hunde'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

