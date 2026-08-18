import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ErrorBoundary from "./components/ErrorBoundary";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Vendors from "./pages/Vendors";
import VendorStore from "./pages/VendorStore";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorProductForm from "./pages/vendor/VendorProductForm";
import VendorProductEdit from "./pages/vendor/VendorProductEdit";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminPanel from "./pages/admin/AdminPanel";
import Chatbot from "./components/Chatbot";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RequireRole({ role, children }: { role: string; children: JSX.Element }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== role) return <Navigate to="/" replace />;
  return children;
}

function Layout({ children }: { children: JSX.Element }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Layout><Home /></Layout>} />
      <Route path="/productos" element={<Layout><Shop /></Layout>} />
      <Route path="/producto/:id" element={<Layout><ProductDetail /></Layout>} />
      <Route path="/tiendas" element={<Layout><Vendors /></Layout>} />
      <Route path="/tienda/:slug" element={<Layout><VendorStore /></Layout>} />
      <Route path="/carrito" element={<Layout><RequireAuth><Cart /></RequireAuth></Layout>} />
      <Route path="/checkout" element={<Layout><RequireAuth><Checkout /></RequireAuth></Layout>} />
      <Route path="/mis-ordenes" element={<Layout><RequireAuth><Orders /></RequireAuth></Layout>} />
      <Route path="/perfil" element={<Layout><RequireAuth><Profile /></RequireAuth></Layout>} />
      <Route path="/customer/dashboard" element={<Layout><RequireRole role="CUSTOMER"><CustomerDashboard /></RequireRole></Layout>} />
      <Route path="/vendor/dashboard" element={<Layout><RequireRole role="VENDOR"><VendorDashboard /></RequireRole></Layout>} />
      <Route path="/vendor/nuevo-producto" element={<Layout><RequireRole role="VENDOR"><VendorProductForm /></RequireRole></Layout>} />
      <Route path="/vendor/editar-producto/:id" element={<Layout><RequireRole role="VENDOR"><VendorProductEdit /></RequireRole></Layout>} />
      <Route path="/admin/dashboard" element={<Layout><RequireRole role="ADMIN"><AdminDashboard /></RequireRole></Layout>} />
      <Route path="/admin/usuarios" element={<Layout><RequireRole role="ADMIN"><AdminUsers /></RequireRole></Layout>} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/admin/vendedores" element={<Layout><RequireRole role="ADMIN"><AdminVendors /></RequireRole></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppRoutes />
        <Chatbot />
      </ErrorBoundary>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}
