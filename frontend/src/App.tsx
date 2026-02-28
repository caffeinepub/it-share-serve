import { createRouter, RouterProvider, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ContactsPage from './pages/ContactsPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import CreatePage from './pages/CreatePage';
import { Toaster } from '@/components/ui/sonner';

function AppRouter() {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });

  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: LoginPage,
  });

  const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/register',
    component: RegisterPage,
  });

  const layoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'layout',
    component: () => (
      <Layout>
        <Outlet />
      </Layout>
    ),
  });

  const homeRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: '/',
    component: HomePage,
  });

  const contactsRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: '/contacts',
    component: ContactsPage,
  });

  const chatRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: '/chat/$contactId',
    component: ChatPage,
  });

  const profileRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: '/profile',
    component: ProfilePage,
  });

  const profileUserRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: '/profile/$userId',
    component: ProfilePage,
  });

  const createRoute_ = createRoute({
    getParentRoute: () => layoutRoute,
    path: '/create',
    component: CreatePage,
  });

  const routeTree = rootRoute.addChildren([
    loginRoute,
    registerRoute,
    layoutRoute.addChildren([
      homeRoute,
      contactsRoute,
      chatRoute,
      profileRoute,
      profileUserRoute,
      createRoute_,
    ]),
  ]);

  const router = createRouter({ routeTree });

  return <RouterProvider router={router} />;
}

function AuthGate() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center bg-grid-pattern">
        <div className="flex flex-col items-center gap-4">
          <img src="/assets/generated/shareserve-logo.dim_256x256.png" alt="ShareServe" className="w-16 h-16 animate-float" />
          <div className="font-orbitron text-xl gradient-text animate-glow-pulse">Loading ShareServe...</div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-neon-violet animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (showProfileSetup) {
    return <RegisterPage />;
  }

  return <AppRouter />;
}

export default function App() {
  return (
    <>
      <AuthGate />
      <Toaster theme="dark" position="top-right" />
    </>
  );
}
