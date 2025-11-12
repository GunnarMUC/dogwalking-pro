import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminDogs } from './pages/admin/Dogs';
import { AdminWalks } from './pages/admin/Walks';
import { AdminInvitations } from './pages/admin/Invitations';
import { AdminBilling } from './pages/admin/Billing';
import { AdminUsers } from './pages/admin/Users';
import { OwnerDashboard } from './pages/owner/Dashboard';
import { OwnerProfile } from './pages/owner/Profile';
import { OwnerWalks } from './pages/owner/Walks';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole } from '@dogwalking/shared';

const rootRoute = createRootRoute();

// Public routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
});

// Admin routes
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminDashboard />
    </ProtectedRoute>
  ),
});

const adminDogsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/dogs',
  component: () => (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminDogs />
    </ProtectedRoute>
  ),
});

const adminWalksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/walks',
  component: () => (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminWalks />
    </ProtectedRoute>
  ),
});

const adminInvitationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/invitations',
  component: () => (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminInvitations />
    </ProtectedRoute>
  ),
});

const adminBillingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/billing',
  component: () => (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminBilling />
    </ProtectedRoute>
  ),
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  component: () => (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminUsers />
    </ProtectedRoute>
  ),
});

// Owner routes
const ownerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/owner',
  component: () => (
    <ProtectedRoute requiredRole={UserRole.OWNER}>
      <OwnerDashboard />
    </ProtectedRoute>
  ),
});

const ownerProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/owner/profile',
  component: () => (
    <ProtectedRoute requiredRole={UserRole.OWNER}>
      <OwnerProfile />
    </ProtectedRoute>
  ),
});

const ownerWalksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/owner/walks',
  component: () => (
    <ProtectedRoute requiredRole={UserRole.OWNER}>
      <OwnerWalks />
    </ProtectedRoute>
  ),
});

// Index route (redirect to login)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    window.location.href = '/login';
    return null;
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  adminRoute,
  adminDogsRoute,
  adminWalksRoute,
  adminInvitationsRoute,
  adminBillingRoute,
  adminUsersRoute,
  ownerRoute,
  ownerProfileRoute,
  ownerWalksRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

