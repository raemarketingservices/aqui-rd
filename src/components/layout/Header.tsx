import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FiShoppingCart, FiMenu, FiX, FiLogOut, FiSettings, FiPackage, FiGrid, FiSearch } from "react-icons/fi";
import UnikoLogo from "../ui/UnikoLogo";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const itemCount = 0; // Cart count will be handled separately

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/productos?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  return (
    <header className="bg-uniko-dark text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-uniko-white.png" alt="UNIKO" className="h-10" />
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="¿Qué estás buscando?" className="w-full pl-4 pr-12 py-2.5 rounded-lg text-uniko-blue text-sm focus:ring-2 focus:ring-uniko-red outline-none" />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-uniko-dark hover:text-uniko-red"><FiSearch size={18} /></button>
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/tiendas" className="hover:text-uniko-red transition text-sm font-medium">Tiendas</Link>
            <Link to="/productos" className="hover:text-uniko-red transition text-sm font-medium">Productos</Link>
            {isAuthenticated ? (
              <>
                <Link to="/carrito" className="relative hover:text-uniko-red transition">
                  <FiShoppingCart size={22} />
                  {itemCount > 0 && <span className="absolute -top-2 -right-2 bg-uniko-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{itemCount}</span>}
                </Link>
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 hover:text-uniko-red transition">
                    <div className="w-8 h-8 bg-uniko-blue rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.charAt(0)
                      )}
                    </div>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b"><p className="font-semibold text-uniko-blue">{user?.name}</p><p className="text-xs text-uniko-blue/70">{user?.email}</p></div>
                      <Link to="/perfil" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-uniko-blue hover:bg-white"><FiSettings size={16} /> Mi Perfil</Link>
                      {user?.role === "CUSTOMER" && <Link to="/customer/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-uniko-blue hover:bg-white"><FiGrid size={16} /> Mi Panel</Link>}
                      {user?.role === "VENDOR" && <Link to="/vendor/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-uniko-blue hover:bg-white"><FiPackage size={16} /> Mi Tienda</Link>}
                      {user?.role === "ADMIN" && <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-uniko-blue hover:bg-white"><FiGrid size={16} /> Panel Admin</Link>}
                      <Link to="/mis-ordenes" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-uniko-blue hover:bg-white"><FiPackage size={16} /> Mis Órdenes</Link>
                      <hr className="my-1" />
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full"><FiLogOut size={16} /> Cerrar Sesión</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="border-2 border-white text-white hover:bg-white hover:text-uniko-dark font-semibold py-2 px-4 text-sm rounded-lg transition-all duration-200">Iniciar Sesión</Link>
                <Link to="/registro" className="btn-primary !py-2 !px-4 text-sm">Registrarse</Link>
              </div>
            )}
          </nav>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <form onSubmit={handleSearch} className="mb-4"><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="¿Qué estás buscando?" className="w-full pl-4 pr-4 py-2.5 rounded-lg text-uniko-blue text-sm" /></form>
            <div className="flex flex-col gap-3">
              <Link to="/tiendas" onClick={() => setMobileOpen(false)} className="hover:text-uniko-red">Tiendas</Link>
              <Link to="/productos" onClick={() => setMobileOpen(false)} className="hover:text-uniko-red">Productos</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/carrito" onClick={() => setMobileOpen(false)} className="hover:text-uniko-red">Carrito ({itemCount})</Link>
                  <Link to="/perfil" onClick={() => setMobileOpen(false)} className="hover:text-uniko-red">Mi Perfil</Link>
                  {user?.role === "CUSTOMER" && <Link to="/customer/dashboard" onClick={() => setMobileOpen(false)} className="hover:text-uniko-red">Mi Panel</Link>}
                  {user?.role === "VENDOR" && <Link to="/vendor/dashboard" onClick={() => setMobileOpen(false)} className="hover:text-uniko-red">Mi Tienda</Link>}
                  {user?.role === "ADMIN" && <Link to="/admin" onClick={() => setMobileOpen(false)} className="hover:text-uniko-red">Panel Admin</Link>}
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="text-left text-uniko-red">Cerrar Sesión</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="hover:text-uniko-red">Iniciar Sesión</Link>
                  <Link to="/registro" onClick={() => setMobileOpen(false)} className="btn-primary text-center">Registrarse</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
