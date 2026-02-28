import React from 'react';
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ContactsPage from './pages/ContactsPage';
import ChatPage from './pages/ChatPage';
import CreatePage from './pages/CreatePage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import CustomizeDesignPage from './pages/CustomizeDesignPage';
import PurchaseConfirmationPage from './pages/PurchaseConfirmationPage';

// Root layout wrapper using Outlet
function RootLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

// Root route with layout
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Public routes
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

// Protected routes
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const contactsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contacts',
  component: ContactsPage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat/$username',
  component: ChatPage,
});

const createRoute_ = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create',
  component: CreatePage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: SearchPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const customizeDesignRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customize-design/$designId',
  component: CustomizeDesignPage,
});

const purchaseConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/purchase-confirmation',
  component: PurchaseConfirmationPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  homeRoute,
  profileRoute,
  contactsRoute,
  chatRoute,
  createRoute_,
  searchRoute,
  settingsRoute,
  customizeDesignRoute,
  purchaseConfirmationRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
