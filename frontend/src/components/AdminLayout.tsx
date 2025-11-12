import { ReactNode } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useAuthStore } from '../store/authStore';
import { Home, Dog, Calendar, Mail, DollarSign, Users, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Erfolgreich abgemeldet');
      navigate({ to: '/login' });
    } catch (error) {
      toast.error('Abmeldung fehlgeschlagen');
    }
  };

  const navItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/dogs', icon: Dog, label: 'Hunde' },
    { path: '/admin/walks', icon: Calendar, label: 'Walks' },
    { path: '/admin/invitations', icon: Mail, label: 'Einladungen' },
    { path: '/admin/billing', icon: DollarSign, label: 'Abrechnung' },
    { path: '/admin/users', icon: Users, label: 'Besitzer' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Dog className="w-8 h-8 text-primary mr-2" />
              <h1 className="text-xl font-bold text-dark">Dogwalking Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="btn-outline flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Abmelden</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate({ to: item.path as any })}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-primary hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

