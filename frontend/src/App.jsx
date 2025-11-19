import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { LoadingPage } from "./components/Admin_components/Loading";
import useAuthCheck from "./hooks/useAuthCheck";

// user zone
import Landing from "./pages/Landing";

// admin zone
import AdminLayout from "./components/Admin_components/Layout/Layout";
import Login from "./components/Login";
import DashboardPage from "./pages/admin/Dashboard/DashboardPage";

import Marketplace from "./pages/users/Buyer/Marketplace";
import Product from "./pages/users/Buyer/Product";
import Profile from "./components/Profile";
import CreateListingForm from "./pages/users/Seller/CreateListingForm";
import { Provider } from "./components/provider";
import { EmptyState } from "./components/Admin_components/EmptyState";
import NotFound from "./components/NotFound";
import ShopProfile from "./pages/users/Seller/ShopProfile";
import ContactListPage from "./components/chat/ContactListPage";

// Lazy load pages
const UsersPage = React.lazy(() => import('./pages/admin/Users/UsersPage'));
const ListingsPage = React.lazy(() => import('./pages/admin/Listings/ListingsPage'));
const CategoriesPage = React.lazy(() => import('./pages/admin/Categories/CategoriesPage'));
const ReviewsPage = React.lazy(() => import('./pages/admin/Reviews/ReviewsPage'));
const ReportsPage = React.lazy(() => import('./pages/admin/Reports/ReportsPage'));


// Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isChecking } = useAuthCheck();

  if (isChecking) {
    return <LoadingPage />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [token, setToken] = useState('')
  const [user, setUsers] = useState(null)
  const [role, setRole] = useState('')

  return (
    <BrowserRouter>
      <Provider>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route
            path="/login"
            element={
              <Login />
            }
          />
          {/* public zone */}
          <Route
            path="/"
            element={
              <Landing
                user={user}
                setUsers={setUsers}
                setToken={setToken}
                setRole={setRole}
              />
            }
          />
          <Route
            path="/marketplace"
            element={
              <Provider>
                <Marketplace
                  user={user}
                  setUsers={setUsers}
                  setToken={setToken}
                  setRole={setRole}
                />
              </Provider>
            }
          />

          <Route
            path="/product/:productID"
            element={
              <Product />
            }
          />
          <Route
            path="/profile"
            element={
              <Profile />
            }
          />
          <Route
            path="/create/product"
            element={
              <CreateListingForm />
            }
          />
          <Route
            path="/shop/:sellerId"
            element={
              <ShopProfile />
            }
          />

          <Route
            path="/mycontact"
            element={
              <Provider>
                <ContactListPage />
              </Provider>
            }
          />

          <Route
            path="/admin/*"
            element={
              // <ProtectedRoute>
              <AdminLayout />
              // </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <React.Suspense fallback={<LoadingPage />}>
                  <DashboardPage />
                </React.Suspense>
              }
            />
            <Route
              path="users"
              element={
                <React.Suspense fallback={<LoadingPage />}>
                  <UsersPage />
                </React.Suspense>
              }
            />
            <Route
              path="listings"
              element={
                <React.Suspense fallback={<LoadingPage />}>
                  <ListingsPage />
                </React.Suspense>
              }
            />
            <Route
              path="categories"
              element={
                <React.Suspense fallback={<LoadingPage />}>
                  <CategoriesPage />
                </React.Suspense>
              }
            />
            <Route
              path="reviews"
              element={
                <React.Suspense fallback={<LoadingPage />}>
                  <ReviewsPage />
                </React.Suspense>
              }
            />
            <Route
              path="reports"
              element={
                <React.Suspense fallback={<LoadingPage />}>
                  <ReportsPage />
                </React.Suspense>
              }
            />


          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Provider>
    </BrowserRouter>
  );
}

export default App;
